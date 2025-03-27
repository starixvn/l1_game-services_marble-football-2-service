import { Core } from "sc-game-base";
import GameDefinition from "../game-definition";
import { FIRST_HALF_BET_CHOICES, SECOND_HALF_BET_CHOICES } from "../constants";
import { helpers } from "sc-common";
import { isWithinBettingTime, isWithinFirstHalfBettingTime, isWithinSecondHalfBettingTime } from "../helpers/game-timing";

export default class PlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
    declare definition: GameDefinition;

    composeBetChoiceValidationCriteria(betChoice: string) {
        return [
            {
                failure: this.isBetChoiceBanned(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            ...super.composeBetChoiceValidationCriteria(betChoice),
        ];
    }

    composeBettingTimeValidationCriteria(roundId: number): { failure: boolean; notice: string }[] {
        const configs = this.gameData.gameConfigs;

        return [
            {
                failure: !configs.enabled,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            {
                failure: roundId !== this.gameData.roundId,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet, { gameRoundId: roundId }),
            },
            {
                failure: !isWithinBettingTime(this.gameData.remainingTime, this.definition.durations),
                notice: this.getNoticeObj(helpers.noticeHelper.placeBetNextRound),
            },
        ];
    }

    private isBetChoiceBanned(betChoice: string) {
        return this.isBetChoiceBannedOnSecondHalf(betChoice) || this.isBetChoiceBannedOnFirstHalf(betChoice);
    }

    private isBetChoiceBannedOnFirstHalf(betChoice: string) {
        return this.isWithinFirstHalfBettingTime() && !this.isFirstHalfBetChoice(betChoice);
    }

    private isBetChoiceBannedOnSecondHalf(betChoice: string) {
        return this.isWithinSecondHalfBettingTime() && !this.isSecondHalfBetChoice(betChoice);
    }

    private isWithinFirstHalfBettingTime() {
        return isWithinFirstHalfBettingTime(this.gameData.remainingTime, this.definition.durations);
    }

    private isWithinSecondHalfBettingTime() {
        return isWithinSecondHalfBettingTime(this.gameData.remainingTime, this.definition.durations);
    }

    private isFirstHalfBetChoice(betChoice: string) {
        return Object.hasOwn(FIRST_HALF_BET_CHOICES, betChoice);
    }

    private isSecondHalfBetChoice(betChoice: string) {
        return Object.hasOwn(SECOND_HALF_BET_CHOICES, betChoice);
    }
}
