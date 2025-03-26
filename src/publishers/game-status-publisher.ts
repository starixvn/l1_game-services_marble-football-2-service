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

    publishDynamicOddsStatus() {
        if (!this.gameData.dynamicOdds) {
            throw new Error("Dynamic odds are not generated");
        }

        const pureOdds = this.gameData.dynamicOdds;

        const odds = this.omitOddsBasedOnHalf(pureOdds);
        this.publishToAllUsers({ odds });
    }

    private omitOddsBasedOnHalf(target: Record<string, any>) {
        if (this.isFirstHalfPlacingBet()) {
            return GameStatusPublisher.omitOdds(target, Object.keys(SECOND_HALF_ODDS_TYPE));
        }

        if (this.isSecondHalfPlacingBet()) {
            return GameStatusPublisher.omitOdds(target, Object.keys(FIRST_HALF_ODDS_TYPE));
        }

        return {};
    }

    private isFirstHalfPlacingBet() {
        return this.gameData.remainingTime === this.definition.durations.placingBetsFirstHalf;
    }


    private isSecondHalfPlacingBet() {
        return this.gameData.remainingTime === this.definition.durations.placingBetsSecondHalf;
    }

    private static omitOdds(target: Record<string, any>, oddTypes: string[] = []) {
        return Object.fromEntries(
            Object.entries(target)
                .filter(([key]) => !oddTypes.includes(key))
        );
    }
}
