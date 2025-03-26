import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { getUserBetPercentage } from "../helpers/bet-percentage";
import GameDefinition from "../game-definition";

export default class InGameConsumer extends TableInGameConsumer {
    declare gameData: GameData;
    declare definition: GameDefinition;

    override async buildPayload(realPlayer: any) {
        console.log("buildPayload");
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

        const isStreamingVideoFirstHalf = remainingTime <= durations.streamingVideoFirstHalf && remainingTime > durations.placingBetsSecondHalf;
        const isStreamingVideoSecondHalf = remainingTime <= durations.streamingVideoSecondHalf && remainingTime >= 0;
        const isShowingResultFirstHalf = remainingTime <= durations.placingBetsSecondHalf && remainingTime > durations.lockingBetSecondHalf;
        const isShowingResultSecondHalf = remainingTime <= durations.wholeRound && remainingTime > durations.startingRound;

        if (isStreamingVideoFirstHalf) {
            console.log("isStreamingVideoFirstHalf");
            return {
                firstHalfVideo: this.gameData.result?.firstHalfVideo,
                firstHalfTimeline: this.gameData.result?.firstHalfTimeline,
                firstHalf: this.gameData.result?.firstHalf,
            };
        }

        if (isStreamingVideoSecondHalf) {
            console.log("isStreamingVideoSecondHalf");
            return {
                secondHalfVideo: this.gameData.result?.secondHalfVideo,
                secondHalfTimeline: this.gameData.result?.secondHalfTimeline,
                secondHalf: this.gameData.result?.secondHalf,
            };
        }

        if (isShowingResultFirstHalf) {
            console.log("isShowingResultFirstHalf");
            return {
                firstHalfTimeline: this.gameData.result?.firstHalfTimeline,
                firstHalf: this.gameData.result?.firstHalf,
            };
        }

        if (isShowingResultSecondHalf) {
            console.log("isShowingResultSecondHalf");
            return {
                secondHalfTimeline: this.gameData.result?.secondHalfTimeline,
                secondHalf: this.gameData.result?.secondHalf,
            };
        }
        
        return {};
    }
}
