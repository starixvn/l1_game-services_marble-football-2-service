import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { getUserBetPercentage } from "../helpers/bet-percentage";
import GameDefinition from "../game-definition";
import { isFirstHalfOddsActive } from "../helpers/game-timing";
import { LIVE_BET_CHOICES, PRE_MATCH_BET_CHOICES } from "../constants";

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
        const { playerBetCount } = this.gameData;
        const userBetPercentage = getUserBetPercentage(playerBetCount);
        const videoResult = this.getCurrentVideoResult();
        const liveStreamServer = this.gameData.liveStreamServer;

        const tournament = this.gameData.publishedTournament;
        return { ...payload, userBetPercentage, liveStreamServer, videoResult, tournament };
    }

    getCurrentVideoResult() {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;

        const isStreamingVideoFirstHalf =
            remainingTime <= durations.streamingVideoFirstHalf && remainingTime > durations.placingBetsSecondHalf;
        const isStreamingVideoSecondHalf = remainingTime <= durations.streamingVideoSecondHalf && remainingTime >= 0;
        const isShowingResultFirstHalf = remainingTime <= durations.placingBetsSecondHalf && remainingTime > durations.lockingBetSecondHalf;
        const isShowingResultSecondHalf = remainingTime <= durations.wholeRound && remainingTime > durations.startingRound;

        if (isStreamingVideoFirstHalf) {
            return {
                firstHalfVideo: this.gameData.result?.firstHalfVideo,
                firstHalfTimeline: this.gameData.result?.firstHalfTimeline,
                firstHalf: this.gameData.result?.firstHalf,
            };
        }

        if (isStreamingVideoSecondHalf) {
            return {
                secondHalfVideo: this.gameData.result?.secondHalfVideo,
                secondHalfTimeline: this.gameData.result?.secondHalfTimeline,
                secondHalf: this.gameData.result?.secondHalf,
            };
        }

        if (isShowingResultFirstHalf) {
            return {
                firstHalfTimeline: this.gameData.result?.firstHalfTimeline,
                firstHalf: this.gameData.result?.firstHalf,
            };
        }

        if (isShowingResultSecondHalf) {
            return {
                secondHalfTimeline: this.gameData.result?.secondHalfTimeline,
                secondHalf: this.gameData.result?.secondHalf,
            };
        }

        return {};
    }

    publishOddsToPlayer(UID: any) {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;

        if (isFirstHalfOddsActive(remainingTime, durations)) {
            return this.publishFirstHalfOdds(UID);
        }

        return this.publishSecondHalfOdds(UID);
    }

    private publishFirstHalfOdds(UID: any) {
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

    private publishSecondHalfOdds(UID: any) {
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
