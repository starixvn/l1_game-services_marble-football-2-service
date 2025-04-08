import { RunningRoundInfoPublisher as RunningRoundInfoPublisherBase } from "sc-game-base/src/core/event-publishers";

import GameData from "../game-data";
import { getPercentageBetChoices, getUserBetPercentage } from "../helpers/bet-percentage";

export default class RunningRoundInfoPublisher extends RunningRoundInfoPublisherBase {
    declare gameData: GameData;

    publish() {
        super.publish();

        this.publishBetPercentage();
    }

    publishBetPercentage() {
        const { playerBetCount } = this.gameData;

        const choices = getPercentageBetChoices();
        const userBetPercentage = getUserBetPercentage(playerBetCount, choices);

        if (choices.some((choice) => playerBetCount[choice])) {
            this.publishToAllUsers({ userBetPercentage });
        }
    }
}
