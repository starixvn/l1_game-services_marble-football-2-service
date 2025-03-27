import { Core } from "sc-game-base";
import GameData from "../game-data";
import GameDefinition from "../game-definition";
import { omitOddsBasedOnHalf } from "../helpers/odds";

export default class GameStatusPublisher extends Core.BaseEventPublishers.GameStatusPublisher {
    declare gameData: GameData;
    definition: GameDefinition;

    constructor(gameName: string, gameData: Core.GameData, definition: GameDefinition) {
        super(gameName, gameData);
        this.definition = definition;
    }

    publishDynamicOddsStatus(isFirstHalf: boolean) {
        if (!this.gameData.dynamicOdds) {
            throw new Error("Dynamic odds are not generated");
        }

        const pureOdds = this.gameData.dynamicOdds;

        const odds = omitOddsBasedOnHalf(pureOdds, isFirstHalf);
        this.publishToAllUsers({ odds });
    }
}
