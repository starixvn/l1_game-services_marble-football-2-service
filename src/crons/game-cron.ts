import { FIRST_HALF_BET_CHOICES, SECOND_HALF_BET_CHOICES } from "./../constants";
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
import GameStatusPublisher from "../publishers/game-status-publisher";

import { calculatePreMatchOdds, calculateLiveOdds } from "../helpers/odds-helper";
import { securePickOne } from "sc-core-rng";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    declare definition: GameDefinition;
    declare appConfigs: typeof AppConfigs;
    declare gameStatusPublisher: GameStatusPublisher;

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

    async getVideoTimelineWithRetry(videoName: string, isFirstHalf: boolean) {
        const delay = 100;
        const retries = 3;

        return retry(() => this.getVideoTimelineByVideoName(videoName), retries, delay).catch((error) => {
            this.logService.logError(
                `In match ${this.gameData.roundId}, failed to fetch ${isFirstHalf ? "first half" : "second half"} timeline: ${error}`
            );

            return this.getDefaultVideoTimeline(videoName, isFirstHalf);
        });
    }

    async getVideoTimelineForFirstHalf() {
        this.gameData.result.firstHalfTimeline = await this.getVideoTimelineWithRetry(this.gameData.result.firstHalfVideo, true);
    }

    async getVideoTimelineForSecondHalf() {
        this.gameData.result.secondHalfTimeline = await this.getVideoTimelineWithRetry(this.gameData.result.secondHalfVideo, false);
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

    async generateRoundData() {
        await this.roundResultConsumer.generateResult();
        this.gameData.settlementResultFromAdmin = {};
    }

    private publishVideoStreamFirstHalf() {
        const videoResult = {
            firstHalfVideo: this.gameData.result.firstHalfVideo,
            firstHalfTimeline: this.gameData.result.firstHalfTimeline,
            firstHalf: this.gameData.result.firstHalf,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ videoResult });
    }

    private publishVideoStreamSecondHalf() {
        const videoResult = {
            secondHalfVideo: this.gameData.result.secondHalfVideo,
            secondHalfTimeline: this.gameData.result.secondHalfTimeline,
            secondHalf: this.gameData.result.secondHalf,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ videoResult });
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
        }

        if (this.isDuringFirstHalfBettingTime(remainingTime) || this.isDuringSecondHalfBettingTime(remainingTime)) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }

        if (this.isStreamingVideoFirstHalf(remainingTime)) {
            await this.getVideoTimelineForFirstHalf();
            this.publishVideoStreamFirstHalf();
        }

        if (this.isStreamingVideoSecondHalf(remainingTime)) {
            await this.getVideoTimelineForSecondHalf();
            this.publishVideoStreamSecondHalf();
        }

        if (remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;
            await this.settleGameRoundConsumer.settleRound();
        }
    }

    private isDuringFirstHalfBettingTime(remainingTime: number) {
        const { placingBetsFirstHalf, lockingBetFirstHalf } = this.definition.durations;

        return remainingTime < placingBetsFirstHalf && remainingTime > lockingBetFirstHalf;
    }

    private isDuringSecondHalfBettingTime(remainingTime: number) {
        const { placingBetsSecondHalf, lockingBetSecondHalf } = this.definition.durations;

        return remainingTime < placingBetsSecondHalf && remainingTime > lockingBetSecondHalf;
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
        const preMatchOdds = calculatePreMatchOdds(this.gameData.matchConfig, this.gameData.gameConfigs.margin);
        const odds = {
            [FIRST_HALF_BET_CHOICES.firstHalfHome]: preMatchOdds.home,
            [FIRST_HALF_BET_CHOICES.firstHalfAway]: preMatchOdds.away,
            [FIRST_HALF_BET_CHOICES.firstHalfDraw]: preMatchOdds.draw,
            [FIRST_HALF_BET_CHOICES.firstHalfOver]: preMatchOdds.over,
            [FIRST_HALF_BET_CHOICES.firstHalfUnder]: preMatchOdds.under,
            [FIRST_HALF_BET_CHOICES.firstHalfEven]: preMatchOdds.even,
            [FIRST_HALF_BET_CHOICES.firstHalfOdd]: preMatchOdds.odd,
        };

        this.gameStatusPublisher.publishOdds(odds);
    }

    calculateAndPublishOddsLive() {
        const { firstHalf } = this.gameData.result;
        const liveOdds = calculateLiveOdds(this.gameData.matchConfig.secondHalfConfig, this.gameData.gameConfigs.margin, firstHalf);
        const odds = {
            [SECOND_HALF_BET_CHOICES.secondHalfHome]: liveOdds.home,
            [SECOND_HALF_BET_CHOICES.secondHalfAway]: liveOdds.away,
            [SECOND_HALF_BET_CHOICES.secondHalfDraw]: liveOdds.draw,
            [SECOND_HALF_BET_CHOICES.secondHalfOver]: liveOdds.over,
            [SECOND_HALF_BET_CHOICES.secondHalfUnder]: liveOdds.under,
            [SECOND_HALF_BET_CHOICES.secondHalfEven]: liveOdds.even,
            [SECOND_HALF_BET_CHOICES.secondHalfOdd]: liveOdds.odd,
        };

        this.gameStatusPublisher.publishOdds(odds);
    }
}
