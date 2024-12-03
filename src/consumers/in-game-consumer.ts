import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { calculatePlayerBetPercentage } from "../helpers/bet-percentage";
import { BET_CHOICES } from "../constants";

export default class InGameConsumer extends TableInGameConsumer {
    declare gameData: GameData;

    override async buildPayload(realPlayer: any) {
        const payload = await super.buildPayload(realPlayer);
        const { playerBetCount } = this.gameData;
        const userBetPercentage = this.getUserBetPercentage(playerBetCount);
        const videoResult = this.getCurrentVideoResult();
        const liveStreamServer = this.gameData.liveStreamServer;

        const tournament = this.gameData.tournament;
        return { ...payload, userBetPercentage, liveStreamServer, videoResult, tournament };
    }

    getUserBetPercentage(playerBetCount: Record<string, string[]>) {
        return calculatePlayerBetPercentage(playerBetCount, [BET_CHOICES.home, BET_CHOICES.draw, BET_CHOICES.away]);
    }

    getCurrentVideoResult() {
        return {
            firstHalfVideo: this.gameData.result.firstHalfVideo,
            secondHalfVideo: this.gameData.result.secondHalfVideo,
            firstHalfTimeline: this.gameData.result.firstHalfTimeline,
            secondHalfTimeline: this.gameData.result.secondHalfTimeline,
            firstHalf: this.gameData.result.firstHalf,
            secondHalf: this.gameData.result.secondHalf,
        };
    }
}
