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
import { generateOdds } from "../helpers/odds";
import { isFirstHalfOddsActive } from "../helpers/game-timing";

import { calculatePreMatchOdds, calculateLiveOdds } from "../helpers/odds-helper";
import { securePickOne } from "../helpers/random-helper";

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
        this.updateNewMatchConfig();
    }

    async getVideoTimelineForHalf(videoName: string) {
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

    async getVideoTimeline() {
        const delay = 100;
        const retries = 3;

        try {
            const [firstHalfTimeline, secondHalfTimeline] = await Promise.all([
                retry(() => this.getVideoTimelineForHalf(this.gameData.result.firstHalfVideo), retries, delay).catch((error) => {
                    this.logService.logError(`In match ${this.gameData.roundId}, failed to fetch first half timeline: ${error}`);
                    return this.getDefaultVideoTimeline(this.gameData.result.firstHalf, true);
                }),
                retry(() => this.getVideoTimelineForHalf(this.gameData.result.secondHalfVideo), retries, delay).catch((error) => {
                    this.logService.logError(`In match ${this.gameData.roundId}, failed to fetch second half timeline: ${error}`);
                    return this.getDefaultVideoTimeline(this.gameData.result.secondHalf, false);
                }),
            ]);

            this.gameData.result.firstHalfTimeline = firstHalfTimeline;
            this.gameData.result.secondHalfTimeline = secondHalfTimeline;
        } catch (error) {
            this.logService.logError(`Unexpected error fetching video timelines: ${error}`);
            this.gameData.result.firstHalfTimeline = this.getDefaultVideoTimeline(this.gameData.result.firstHalf, true);
            this.gameData.result.secondHalfTimeline = this.getDefaultVideoTimeline(this.gameData.result.secondHalf, false);
        }
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
        this.createOddsForCurrentRound();
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

        if (this.isStartingTime(remainingTime, durations)) {
            this.resetForNewRound();
            this.bot?.reset();
            await this.generateRoundData();
        }

        if (this.isStartPlacingBetFirstHalf(remainingTime)) {
            this.calculateAndPublishOddsPreMatch();
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
            await this.getVideoTimeline();
            this.publishVideoStreamFirstHalf();
        }

        if (this.isStreamingVideoSecondHalf(remainingTime)) {
            this.publishVideoStreamSecondHalf();
        }

        if (remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;
            await this.settleGameRoundConsumer.settleRound();
        }
    }

    private notifyPlaceBetsWithDynamicOdds() {
        this.gameStatusPublisher.publishStartPlacingBetStatus();
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

    private isFirstHalfOddsActive() {
        return isFirstHalfOddsActive(this.gameData.remainingTime, this.definition.durations);
    }

    calculateAndPublishOddsPreMatch() {
        const preMatchOdds = calculatePreMatchOdds(this.gameData.matchConfig, this.gameData.gameConfigs.margin);
        const odds = {
            firstHalfHome: preMatchOdds.home,
            firstHalfAway: preMatchOdds.away,
            firstHalfDraw: preMatchOdds.draw,
            firstHalfOver: preMatchOdds.over,
            firstHalfUnder: preMatchOdds.under,
            firstHalfEven: preMatchOdds.even,
            firstHalfOdd: preMatchOdds.odd,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ odds });
    }

    calculateAndPublishOddsLive() {
        const { firstHalf } = this.gameData.result;
        const liveOdds = calculateLiveOdds(this.gameData.matchConfig.secondHalfConfig, this.gameData.gameConfigs.margin, firstHalf);
        const odds = {
            secondHalfHome: liveOdds.home,
            secondHalfAway: liveOdds.away,
            secondHalfDraw: liveOdds.draw,
            secondHalfOver: liveOdds.over,
            secondHalfUnder: liveOdds.under,
            secondHalfEven: liveOdds.even,
            secondHalfOdd: liveOdds.odd,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ odds });
    }
}
