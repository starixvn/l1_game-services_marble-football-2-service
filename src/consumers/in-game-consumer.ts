import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { getUserBetPercentage } from "../helpers/bet-percentage";

export default class InGameConsumer extends TableInGameConsumer {
    declare gameData: GameData;

    override async buildPayload(realPlayer: any) {
        const payload = await super.buildPayload(realPlayer);
        const { playerBetCount } = this.gameData;
        const userBetPercentage = getUserBetPercentage(playerBetCount);
        const videoResult = this.getCurrentVideoResult();
        const liveStreamServer = this.gameData.liveStreamServer;

        const tournament = this.gameData.tournament;
        return { ...payload, userBetPercentage, liveStreamServer, videoResult, tournament };
    }

    getCurrentVideoResult() {
        return {
            firstHalfVideo: this.gameData.result?.firstHalfVideo,
            secondHalfVideo: this.gameData.result?.secondHalfVideo,
            firstHalfTimeline: this.gameData.result?.firstHalfTimeline,
            secondHalfTimeline: this.gameData.result?.secondHalfTimeline,
            firstHalf: this.gameData.result?.firstHalf,
            secondHalf: this.gameData.result?.secondHalf,
        };
    }
}
