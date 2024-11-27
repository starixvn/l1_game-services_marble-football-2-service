import { Table } from "sc-game-base";
import type { TournamentConsumer } from "../consumers";
import GameData, { MatchConfigType } from "../game-data";
import { calculateFulltimeOdds } from "../helpers/odds-helper";
import { halfConfigs } from "./../match-configs";
import GameDefinition from "../game-definition";
import AppConfigs from "../app-configs";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    declare definition: GameDefinition;
    declare appConfigs: typeof AppConfigs;

    tournamentConsumer: TournamentConsumer;

    constructor(container: any) {
        super(container);

        this.tournamentConsumer = container.tournamentConsumer;
    }

    override resetForNewRound() {
        super.resetForNewRound();
        this.gameData.playerBetCount = {};
    }

    getMatchConfig(): MatchConfigType {
        const firstHalf = halfConfigs[0];
        const secondHalf = halfConfigs[0];

        return {
            firstHalf,
            secondHalf,
            ou: firstHalf.ou + secondHalf.ou,
        };
    }

    async getVideoTimelineForHalf(videoName: string) {
        const url = new URL(`${videoName}.json`, this.appConfigs.liveStreamServer);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                this.logService(`Failed to fetch video timeline ${url} with error: ${response.status}`);
                return [];
            }

            const data = await response.json();

            return data.timeLine;
        } catch (error) {
            this.logService(`Failed to get video timeline ${url} with error: ${error}`);
            return [];
        }
    }

    async getVideoTimeline() {
        this.gameData.result.firstHalfTimeline = await this.getVideoTimelineForHalf(this.gameData.result.firstHalfVideo);

        this.gameData.result.secondHalfTimeline = await this.getVideoTimelineForHalf(this.gameData.result.secondHalfVideo);
    }

    calculateOdds() {
        const fulltimeOdds = calculateFulltimeOdds(this.gameData.matchConfig, this.gameData.gameConfigs?.margin);

        const odds = {
            home: fulltimeOdds.odds.home,
            draw: fulltimeOdds.odds.draw,
            away: fulltimeOdds.odds.away,
            over: fulltimeOdds.odds.over,
            under: fulltimeOdds.odds.under,
            odd: fulltimeOdds.odds.odd,
            even: fulltimeOdds.odds.even,
        };

        return {
            odds,
            overUnderValue: fulltimeOdds.ou,
        };
    }

    async generateRoundData() {
        this.gameData.matchConfig = this.getMatchConfig();

        const { odds, overUnderValue } = this.calculateOdds();

        this.gameData.matchConfig.ou = overUnderValue;
        this.gameData.gameConfigs.odds = odds;

        await this.roundResultConsumer.generateResult();

        this.gameData.settlementResultFromAdmin = {};
    }

    publishVideoStream() {
        const videoResult = {
            firstHalfVideo: this.gameData.result.firstHalfVideo,
            secondHalfVideo: this.gameData.result.secondHalfVideo,
            firstHalfTimeline: this.gameData.result.firstHalfTimeline,
            secondHalfTimeline: this.gameData.result.secondHalfTimeline,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ videoResult });
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

        if (this.isStartingTime(remainingTime, durations)) {
            this.resetForNewRound();
            this.bot?.reset();

            await this.generateRoundData();
        }

        if (remainingTime === durations.placingBets) {
            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (remainingTime === durations.lockingBet - 1) {
            this.gameStatusPublisher.publishEndPlacingBetStatus();
        }

        if (remainingTime === durations.streamingVideo) {
            await this.getVideoTimeline();
        }

        if (remainingTime === durations.streamingVideo - 1) {
            this.publishVideoStream();
        }

        if (remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;

            await this.settleGameRoundConsumer.settleRound();
            await this.updateTournament();
        }

        if (this.isDuringBetTime(remainingTime)) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }
    }

    async updateTournament() {
        const settlementResult = this.definition.settle(this.gameData.result);
        const homeWins = settlementResult.draw ? this.gameData.result.homeWinsOnDraw : settlementResult.home;

        await this.tournamentConsumer.updateMatchResult(this.gameData.roundId - 1, this.gameData.result.tournamentId, homeWins);
    }

    isDuringBetTime(remainingTime: number) {
        const { placingBets, lockingBet } = this.definition.durations;

        return remainingTime < placingBets && remainingTime > lockingBet;
    }
}
