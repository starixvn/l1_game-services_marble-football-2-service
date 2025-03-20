import { Core } from "sc-game-base";
import GameDefinition from "../game-definition";
import { SECOND_HALF_BET_CHOICES } from "../constants";
import { helpers } from "sc-common";

export default class PlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
    declare definition: GameDefinition;

    composeValidationCriteria(player: any, betChoice: string, amount: number, freeBet: boolean, roundId: number): { failure: boolean; notice: string; }[] {
        const secondHalfBetChoiceValidationCriteria = this.composeSecondHalfBetChoiceValidationCriteria(betChoice);
        
        return secondHalfBetChoiceValidationCriteria.concat(super.composeBetAmountValidationCriteria(player,betChoice, amount, freeBet));
    }

    composeSecondHalfBetChoiceValidationCriteria(betChoice: string) {
        return [
            {
                failure: this.isBetChoiceBannedOnSecondHalf(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet)
            }
        ]
    }

    private isBetChoiceBannedOnSecondHalf(betChoice: string) {
        return this.isInSecondHalfBettingTime() && !this.isSecondHalfBetChoice(betChoice)
    }

    private isInSecondHalfBettingTime() {
        const { placingBetSecondHalf, lockingBetSecondHalf } = this.definition.durations;
        const remainingTime = this.gameData.remainingTime;

        return remainingTime < placingBetSecondHalf && remainingTime >= lockingBetSecondHalf;
    }

    private isSecondHalfBetChoice(betChoice: string) {
        return Object.hasOwn(SECOND_HALF_BET_CHOICES, betChoice)
    }
}