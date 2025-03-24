import { Core } from "sc-game-base";
import GameData from "../game-data";

export default class GameStatusPublisher extends Core.BaseEventPublishers.GameStatusPublisher {
    declare gameData: GameData;

    publishDynamicOddsStatus() {
        // TODO: Implement dynamic odds status publishing
    }
}
