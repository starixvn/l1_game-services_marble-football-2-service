import { RunningRoundInfoPublisher as RunningRoundInfoPublisherBase } from "sc-game-base/src/core/event-publishers";

import GameData from "../game-data";
import { getPercentageBetChoices, getUserBetPercentage } from "../helpers/bet-percentage";
import GameDefinition from "../game-definition";

export default class RunningRoundInfoPublisher extends RunningRoundInfoPublisherBase {
    declare definition: GameDefinition;
    declare gameData: GameData;

    constructor(definition: GameDefinition, gameData: GameData, gameName: string) {
        super(gameName, gameData);
        this.definition = definition;
    }

    publish() {
        super.publish();

        this.publishBetPercentage();
    }

    publishBetPercentage() {
        const { playerBetCount } = this.gameData;

        const choices = getPercentageBetChoices(this.gameData.remainingTime, this.definition.durations);
        const userBetPercentage = getUserBetPercentage(playerBetCount, choices);

        if (choices.some((choice) => playerBetCount[choice])) {
            this.publishToAllUsers({ userBetPercentage });
        }
    }
}
