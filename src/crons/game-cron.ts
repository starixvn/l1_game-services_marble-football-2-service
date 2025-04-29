import { firstHalfConfig, secondHalfConfigs } from "./../match-configs";
import { Table } from "sc-game-base";
import GameData from "../game-data";
import GameDefinition from "../game-definition";
import AppConfigs from "../app-configs";
import { TournamentConsumer } from "../consumers";
import { HttpsProxyAgent } from "https-proxy-agent";
import axios from "axios";
import { retry } from "../helpers";
import { generateVideoName } from "../helpers/result-helper";
import defaultVideoTimelines from "../timelines/video-timelines";
import defaultEventTimelines from "../timelines/event-timelines";
import GameStatusPublisher from "../publishers/game-status-publisher";
import { calculatePreMatchOdds, calculateLiveOdds } from "../helpers/odds-helper";
import { securePickOne } from "sc-core-rng";
import RunningRoundInfoPublisher from "../publishers/running-round-info-publisher";
import { generateVoiceWithEventTimeline, VOICE_DURATION_CONFIG } from "../helpers/voices";
export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    declare definition: GameDefinition;
    declare appConfigs: typeof AppConfigs;
    declare gameStatusPublisher: GameStatusPublisher;
    declare runningRoundInfoPublisher: RunningRoundInfoPublisher;

    tournamentConsumer: TournamentConsumer;

    constructor(container: any) {
        super(container);

        this.gameData.liveStreamServer = this.appConfigs.liveStreamServer;
        this.tournamentConsumer = container.tournamentConsumer;
    }

    async queryLastResult() {
        await super.queryLastResult();
        const lastTournament = await this.tournamentConsumer.getLastTournament();
        this.gameData.publishedTournament = lastTournament;
    }

    override resetForNewRound() {
        super.resetForNewRound();
        this.gameData.dynamicOdds = {};
        this.gameData.playerBetCount = {};
    }

    async getVideoTimelineByVideoName(videoName: string) {
        const url = new URL(`${videoName}.json`, this.appConfigs.liveStreamServer);

        const agent = this.appConfigs.proxyServer.enabled ? new HttpsProxyAgent(this.appConfigs.proxyServer.url) : undefined;

        try {
            const response = await axios.get(url.toString(), { httpsAgent: agent });

            return response.data.timeLine;
        } catch (error) {
            this.logService.logError(`In match ${this.gameData.roundId}, failed to get video timeline ${url} with error: ${error}`);
            throw error;
        }
    }

    async getEventTimelineByVideoName(videoName: string) {
        const url = new URL(`event_${videoName}.json`, this.appConfigs.liveStreamServer);
        const agent = this.appConfigs.proxyServer.enabled ? new HttpsProxyAgent(this.appConfigs.proxyServer.url) : undefined;

        try {
            const response = await axios.get(url.toString(), { httpsAgent: agent });

            return response.data;
        } catch (error) {
            this.logService.logError(`In match ${this.gameData.roundId}, failed to get event timeline ${url} with error: ${error}`);
            throw error
        };
    }

    async getVideoTimelineWithRetry(videoName: string, videoResult: string, isFirstHalf: boolean) {
        const delay = 100;
        const retries = 3;

        return retry(() => this.getVideoTimelineByVideoName(videoName), retries, delay).catch((error) => {
            this.logService.logError(
                `In match ${this.gameData.roundId}, failed to fetch ${isFirstHalf ? "first half" : "second half"} timeline: ${error}`
            );

            return this.getDefaultVideoTimeline(videoResult, isFirstHalf);
        });
    }

    async getEventTimelineWithRetry(videoName: string, videoResult: string, isFirstHalf: boolean) {
        const delay = 100;
        const retries = 3;

        return retry(() => this.getEventTimelineByVideoName(videoName), retries, delay).catch((error) => {
            this.logService.logError(
                `In match ${this.gameData.roundId}, failed to fetch ${isFirstHalf ? "first half" : "second half"} timeline: ${error}`
            );
            return this.getDefaultEventTimeline(videoResult, isFirstHalf);
        });
    }
    async getVideoTimelineAndVoiceForFirstHalf() {
        this.gameData.result.firstHalfTimeline = await this.getVideoTimelineWithRetry(
            this.gameData.result.firstHalfVideo,
            this.gameData.result.firstHalf,
            true
        );
        this.gameData.result.firstHalfEventTimeline = await this.getEventTimelineWithRetry(
            this.gameData.result.firstHalfVideo,
            this.gameData.result.firstHalf,
            true
        );

        this.gameData.result.voices = generateVoiceWithEventTimeline({
            timeline: this.gameData.result.firstHalfEventTimeline?.timeLine ?? [],
            eventName: this.gameData.result.firstHalfEventTimeline?.eventName ?? [],
        }, VOICE_DURATION_CONFIG);
    }

    async getVideoTimelineAndVoiceForSecondHalf() {
        this.gameData.result.secondHalfTimeline = await this.getVideoTimelineWithRetry(
            this.gameData.result.secondHalfVideo,
            this.gameData.result.secondHalf,
            false
        );
        this.gameData.result.secondHalfEventTimeline = await this.getEventTimelineWithRetry(
            this.gameData.result.secondHalfVideo,
            this.gameData.result.secondHalf,
            false
        );
        this.gameData.result.voices = generateVoiceWithEventTimeline({
            timeline: this.gameData.result.secondHalfEventTimeline?.timeLine ?? [],
            eventName: this.gameData.result.secondHalfEventTimeline?.eventName ?? [],
            firstHalfScore: this.gameData.result.firstHalf,
        }, VOICE_DURATION_CONFIG);
    }

    getDefaultVideoTimeline(result: string, isFirstHalf: boolean) {
        const videoName = generateVideoName(result, {}, true);

        if (isFirstHalf) {
            this.gameData.result.firstHalfVideo = videoName;
        } else {
            this.gameData.result.secondHalfVideo = videoName;
        }

        const videoTimeline = (defaultVideoTimelines as Record<string, number[]>)[`${videoName}_${result}`];

        this.logService.logWarning(`Get default video timeline for ${videoName}_${result}: ${videoTimeline}`);

        return videoTimeline;
    }

    getDefaultEventTimeline(result: string, isFirstHalf: boolean) {
        const videoName = isFirstHalf
            ? this.gameData.result.firstHalfVideo
            : this.gameData.result.secondHalfVideo;
        const eventTimeline = (defaultEventTimelines as Record<string, any>)[`${videoName}_${result}`];

        this.logService.logWarning(`Get default event timeline for ${videoName}_${result}: ${eventTimeline}`);

        return eventTimeline;
    }

    async generateRoundData() {
        await this.roundResultConsumer.generateResult();
        this.gameData.settlementResultFromAdmin = {};
    }

    private publishVideoStreamAndVoiceFirstHalf() {
        const videoResult = {
            firstHalfVideo: this.gameData.result.firstHalfVideo,
            firstHalfTimeline: this.gameData.result.firstHalfTimeline,
            firstHalf: this.gameData.result.firstHalf,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ videoResult });
        this.publishVoices();
    }

    private publishVoices() {
        this.runningRoundInfoPublisher.publishToAllUsers({ voices: this.gameData.result?.voices ?? {} });
    }

    private publishVideoStreamAndVoiceSecondHalf() {
        const videoResult = {
            secondHalfVideo: this.gameData.result.secondHalfVideo,
            secondHalfTimeline: this.gameData.result.secondHalfTimeline,
            secondHalf: this.gameData.result.secondHalf,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ videoResult });
        this.publishVoices();
    }

    async publishTournament() {
        const tournament = await this.tournamentConsumer.getCurrentTournament();

        this.gameData.publishedTournament = JSON.parse(JSON.stringify(tournament));

        this.runningRoundInfoPublisher.publishToAllUsers({ tournament });
    }

    override async proceed() {
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.wholeRound) {
            await this.checkGameStatus();
        }

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        const remainingTime = this.gameData.remainingTime;

        if (remainingTime === durations.startingRound) {
            await this.publishTournament();
        }

        if (this.isStartPlacingBetFirstHalf(remainingTime)) {
            this.resetForNewRound();
            this.bot?.reset();
            this.updateNewMatchConfig();
            this.calculateAndPublishOddsPreMatch();
            await this.generateRoundData();

            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (this.isStartPlacingBetSecondHalf(remainingTime)) {
            this.calculateAndPublishOddsLive();

            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (this.isLockingBetFirstHalf(remainingTime) || this.isLockingBetSecondHalf(remainingTime)) {
            this.gameStatusPublisher.publishEndPlacingBetStatus();
            this.runningRoundInfoPublisher.publish();
        }

        if (this.isDuringFirstHalfBettingTime(remainingTime) || this.isDuringSecondHalfBettingTime(remainingTime)) {
            this.runningRoundInfoPublisher.publish();
        }

        if (this.isDuringBotBettingTime(remainingTime)) {
            this.bot && (await this.bot.run());
        }

        if (this.isStreamingVideoFirstHalf(remainingTime)) {
            await this.getVideoTimelineAndVoiceForFirstHalf();
            this.publishVideoStreamAndVoiceFirstHalf();
        }

        if (this.isStreamingVideoSecondHalf(remainingTime)) {
            await this.getVideoTimelineAndVoiceForSecondHalf();
            this.publishVideoStreamAndVoiceSecondHalf();
        }

        if (remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;
            await this.settleGameRoundConsumer.settleRound();
            this.runningRoundInfoPublisher.publish();
        }
    }

    private isDuringFirstHalfBettingTime(remainingTime: number) {
        const { placingBetsFirstHalf, lockingBetFirstHalf } = this.definition.durations;

        return remainingTime < placingBetsFirstHalf && remainingTime >= lockingBetFirstHalf;
    }

    private isDuringSecondHalfBettingTime(remainingTime: number) {
        const { placingBetsSecondHalf, lockingBetSecondHalf } = this.definition.durations;

        return remainingTime < placingBetsSecondHalf && remainingTime >= lockingBetSecondHalf;
    }

    private isDuringBotBettingTime(remainingTime: number) {
        const { placingBetsFirstHalf, lockingBetFirstHalf, placingBetsSecondHalf, lockingBetSecondHalf } = this.definition.durations;

        return (
            (remainingTime < placingBetsFirstHalf - 2 && remainingTime >= lockingBetFirstHalf) ||
            (remainingTime < placingBetsSecondHalf - 2 && remainingTime >= lockingBetSecondHalf)
        );
    }

    private isStartPlacingBetFirstHalf(remainingTime: number) {
        const { placingBetsFirstHalf } = this.definition.durations;

        return remainingTime === placingBetsFirstHalf;
    }

    private isLockingBetFirstHalf(remainingTime: number) {
        const { lockingBetFirstHalf } = this.definition.durations;

        return remainingTime === lockingBetFirstHalf - 1;
    }

    private isStreamingVideoFirstHalf(remainingTime: number) {
        const { streamingVideoFirstHalf } = this.definition.durations;

        return remainingTime === streamingVideoFirstHalf;
    }

    private isStartPlacingBetSecondHalf(remainingTime: number) {
        const { placingBetsSecondHalf } = this.definition.durations;

        return remainingTime === placingBetsSecondHalf;
    }

    private isLockingBetSecondHalf(remainingTime: number) {
        const { lockingBetSecondHalf } = this.definition.durations;

        return remainingTime === lockingBetSecondHalf - 1;
    }

    private isStreamingVideoSecondHalf(remainingTime: number) {
        const { streamingVideoSecondHalf } = this.definition.durations;

        return remainingTime === streamingVideoSecondHalf;
    }

    updateNewMatchConfig() {
        this.gameData.matchConfig = {
            firstHalfConfig: firstHalfConfig,
            secondHalfConfig: securePickOne(secondHalfConfigs),
        };
    }

    calculateAndPublishOddsPreMatch() {
        const odds = calculatePreMatchOdds(this.gameData.matchConfig, this.gameData.gameConfigs?.margin ?? []);

        this.saveOddToGameDataAndPublish(odds);
    }

    calculateAndPublishOddsLive() {
        const { firstHalf } = this.gameData.result;
        const odds = calculateLiveOdds(this.gameData.matchConfig.secondHalfConfig, firstHalf, this.gameData.gameConfigs.margin ?? []);

        this.saveOddToGameDataAndPublish(odds);
    }

    private saveOddToGameDataAndPublish(odds: Record<string, number>) {
        this.saveOddToGameData(odds);
        this.gameStatusPublisher.publishOdds(odds);
    }

    private saveOddToGameData(odds: Record<string, number>) {
        const currentOdds = this.gameData.dynamicOdds;
        this.gameData.dynamicOdds = { ...currentOdds, ...odds };
    }

}