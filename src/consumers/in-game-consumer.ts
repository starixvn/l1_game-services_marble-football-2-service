import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { getPercentageBetChoices, getUserBetPercentage } from "../helpers/bet-percentage";
import GameDefinition from "../game-definition";
import { LIVE_BET_CHOICES, PRE_MATCH_BET_CHOICES } from "../constants";
import {
    isStreamingVideoFirstHalf,
    isStreamingVideoSecondHalf,
    isShowingResultFirstHalf,
    isShowingResultSecondHalf,
    isFirstHalfOddsActive,
} from "../helpers/game-timing";

export default class InGameConsumer extends TableInGameConsumer {
    declare gameData: GameData;
    declare definition: GameDefinition;

    constructor(
        definition: GameDefinition,
        gameData: GameData,
        roundQuery: any,
        publisher: any,
        getBalance: any,
        gameManagementApiClientFactory: any,
    ) {
        super(definition, gameData, roundQuery, publisher, getBalance, gameManagementApiClientFactory);
    }

    override async consume(realPlayer: any): Promise<void> {
        await super.consume(realPlayer);
        this.publishOddsToPlayer(realPlayer.UID);
    }

    override async buildPayload(realPlayer: any) {
        const payload = await super.buildPayload(realPlayer);
        return {
            ...payload,
            userBetPercentage: this.getUserBetPercentage(),
            liveStreamServer: this.gameData.liveStreamServer,
            videoResult: this.getCurrentVideoResult(),
            tournament: this.gameData.publishedTournament,
        };
    }

    private getUserBetPercentage() {
        const betChoices = getPercentageBetChoices();

        return getUserBetPercentage(this.gameData.playerBetCount, betChoices);
    }

    getCurrentVideoResult() {
        const { durations } = this.definition;
        const { remainingTime } = this.gameData;

        if (isStreamingVideoFirstHalf(remainingTime, durations)) {
            return this.getFirstHalfStreamingResult();
        }
        if (isStreamingVideoSecondHalf(remainingTime, durations)) {
            return this.getSecondHalfStreamingResult();
        }
        if (isShowingResultFirstHalf(remainingTime, durations)) {
            return this.getFirstHalfResult();
        }
        if (isShowingResultSecondHalf(remainingTime, durations)) {
            return this.getSecondHalfResult();
        }
        return {};
    }

    private getFirstHalfStreamingResult() {
        const { result } = this.gameData;
        return {
            firstHalfVideo: result?.firstHalfVideo,
            firstHalfTimeline: result?.firstHalfTimeline,
            firstHalf: result?.firstHalf,
        };
    }

    private getSecondHalfStreamingResult() {
        const { result } = this.gameData;
        return {
            secondHalfVideo: result?.secondHalfVideo,
            secondHalfTimeline: result?.secondHalfTimeline,
            secondHalf: result?.secondHalf,
        };
    }

    private getFirstHalfResult() {
        const { result } = this.gameData;
        return {
            firstHalfTimeline: result?.firstHalfTimeline,
            firstHalf: result?.firstHalf,
        };
    }

    private getSecondHalfResult() {
        const { result } = this.gameData;
        return {
            secondHalfTimeline: result?.secondHalfTimeline,
            secondHalf: result?.secondHalf,
        };
    }

    publishOddsToPlayer(UID: string): void {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;

        if (isFirstHalfOddsActive(remainingTime, durations)) {
            this.publishFirstHalfOdds(UID);
        } else {
            this.publishSecondHalfOdds(UID);
        }
    }

    private publishFirstHalfOdds(UID: string): void {
        const dynamicOdds = this.gameData.dynamicOdds;
        const odds = {
            [PRE_MATCH_BET_CHOICES.home]: dynamicOdds?.home,
            [PRE_MATCH_BET_CHOICES.away]: dynamicOdds?.away,
            [PRE_MATCH_BET_CHOICES.draw]: dynamicOdds?.draw,
            [PRE_MATCH_BET_CHOICES.over]: dynamicOdds?.over,
            [PRE_MATCH_BET_CHOICES.under]: dynamicOdds?.under,
            [PRE_MATCH_BET_CHOICES.even]: dynamicOdds?.even,
            [PRE_MATCH_BET_CHOICES.odd]: dynamicOdds?.odd,
        };

        this.publisher.publishToUser(UID, { odds });
    }

    private publishSecondHalfOdds(UID: string): void {
        const dynamicOdds = this.gameData.dynamicOdds;
        const odds = {
            [LIVE_BET_CHOICES.homeLive]: dynamicOdds?.homeLive,
            [LIVE_BET_CHOICES.awayLive]: dynamicOdds?.awayLive,
            [LIVE_BET_CHOICES.drawLive]: dynamicOdds?.drawLive,
            [LIVE_BET_CHOICES.overLive]: dynamicOdds?.overLive,
            [LIVE_BET_CHOICES.underLive]: dynamicOdds?.underLive,
            [LIVE_BET_CHOICES.evenLive]: dynamicOdds?.evenLive,
            [LIVE_BET_CHOICES.oddLive]: dynamicOdds?.oddLive,
        };

        this.publisher.publishToUser(UID, { odds });
    }
}
