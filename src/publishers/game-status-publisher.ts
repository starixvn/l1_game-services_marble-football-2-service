import { Core } from "sc-game-base";
import GameData from "../game-data";
import GameDefinition from "../game-definition";
import { FIRST_HALF_ODDS_TYPE, SECOND_HALF_ODDS_TYPE } from "../constants";

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

        const odds = this.omitOddsBasedOnHalf(pureOdds, isFirstHalf);
        this.publishToAllUsers({ odds });
    }

    private omitOddsBasedOnHalf(target: Record<string, any>, isFirstHalf: boolean) {
        if (isFirstHalf) {
            return GameStatusPublisher.omitOdds(target, Object.keys(SECOND_HALF_ODDS_TYPE));
        }

        return GameStatusPublisher.omitOdds(target, Object.keys(FIRST_HALF_ODDS_TYPE));
    }

    private static omitOdds(target: Record<string, any>, oddTypes: string[] = []) {
        return Object.fromEntries(Object.entries(target).filter(([key]) => !oddTypes.includes(key)));
    }
}
