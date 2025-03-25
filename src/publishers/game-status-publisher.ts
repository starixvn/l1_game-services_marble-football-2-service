import { Core } from "sc-game-base";
import GameData from "../game-data";

export default class GameStatusPublisher extends Core.BaseEventPublishers.GameStatusPublisher {
    declare gameData: GameData;

    publishDynamicOddsStatus() {
        const odds = this.gameData.dynamicOdds 
            ?? this.gameData.gameConfigs.odds 
            ?? this.gameData.gameConfigs.originalOdds;

        this.publishToAllUsers({ odds });
    }
}
