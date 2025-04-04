import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { getUserBetPercentage } from "../helpers/bet-percentage";
import GameDefinition from "../game-definition";
import { isFirstHalfOddsActive } from "../helpers/game-timing";
import { BET_CHOICES, LIVE_BET_CHOICES, PRE_MATCH_BET_CHOICES } from "../constants";

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
        const betChoices = this.getBetChoices();
        const userBetPercentage = getUserBetPercentage(this.gameData.playerBetCount, betChoices);

        return userBetPercentage;
    }

    getBetChoices(): string[] {
        const firstHalfBetChoices = [BET_CHOICES.home, BET_CHOICES.away, BET_CHOICES.draw];
        const secondHalfBetChoices = [LIVE_BET_CHOICES.homeLive, LIVE_BET_CHOICES.awayLive, LIVE_BET_CHOICES.drawLive];

        if (this.isDuringFirstHalf()) {
            return firstHalfBetChoices;
        }

        if (this.isDuringSecondHalf()) {
            return secondHalfBetChoices;
        }

        return [...firstHalfBetChoices, ...secondHalfBetChoices];
    }

    getCurrentVideoResult() {
        if (this.isStreamingVideoFirstHalf()) {
            return this.getFirstHalfStreamingResult();
        }
        if (this.isStreamingVideoSecondHalf()) {
            return this.getSecondHalfStreamingResult();
        }
        if (this.isShowingResultFirstHalf()) {
            return this.getFirstHalfResult();
        }
        if (this.isShowingResultSecondHalf()) {
            return this.getSecondHalfResult();
        }
        return {};
    }

    private isStreamingVideoFirstHalf(): boolean {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;
        return remainingTime <= durations.streamingVideoFirstHalf && remainingTime > durations.placingBetsSecondHalf;
    }

    private isStreamingVideoSecondHalf(): boolean {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;
        return remainingTime <= durations.streamingVideoSecondHalf && remainingTime >= 0;
    }

    private isShowingResultFirstHalf(): boolean {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;
        return remainingTime <= durations.placingBetsSecondHalf && remainingTime > durations.lockingBetSecondHalf;
    }

    private isShowingResultSecondHalf(): boolean {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;
        return remainingTime <= durations.wholeRound && remainingTime > durations.startingRound;
    }

    private isDuringFirstHalf(): boolean {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;
        return remainingTime <= durations.placingBetsFirstHalf && remainingTime > durations.placingBetsSecondHalf;
    }

    private isDuringSecondHalf(): boolean {
        const { durations } = this.definition;
        const remainingTime = this.gameData.remainingTime;
        return remainingTime <= durations.placingBetsSecondHalf && remainingTime > 0;
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
