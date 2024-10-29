import { BaseEventPublishers } from "sc-game-base/src/core";
import GameData from "../game-data";
import GameDefinition from "../game-definition";

export default class GameStatusPublisher extends BaseEventPublishers.GameStatusPublisher {
    declare gameData: GameData;
    definition: GameDefinition;

    constructor(gameName: string, gameData: GameData, definition: GameDefinition) {
        super(gameName, gameData);

        this.definition = definition;
    }
}
