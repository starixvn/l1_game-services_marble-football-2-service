import { RoundResultConsumer as RoundResultConsumerBase } from "sc-game-base/src/core/event-consumers";
import GameData from "../game-data";

export default class RoundResultConsumer extends RoundResultConsumerBase {
    declare gameData: GameData;

    override getDataForGenerateResult() {
        return this.gameData.matchConfig;
    }
}
