import { Core } from "sc-game-base";
import GameDefinition from "../game-definition";
import { PRE_MATCH_BET_CHOICES, LIVE_BET_CHOICES, ADMIN_BET_CHOICES_MAPPER } from "../constants";
import { helpers } from "sc-common";
import { isWithinBettingTime, isWithinFirstHalfBettingTime, isWithinSecondHalfBettingTime } from "../helpers/game-timing";
import GameData from "../game-data";

export default class PlaceBetConsumer extends Core.BaseEventConsumers.PlaceBetConsumer {
    declare definition: GameDefinition;
    declare gameData: GameData;

    composeBetChoiceValidationCriteria(betChoice: string) {
        return [
            {
                failure: this.isBetChoiceBanned(betChoice),
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            ...super.composeBetChoiceValidationCriteria(betChoice),
        ];
    }

    composeBetAmountValidationCriteria(
        player: any,
        betChoice: string,
        amount: number,
        freeBet: boolean
    ): { failure: boolean; notice: string }[] {
        const settings = this.gameData.currencyGroupGames.find((x) => x.groupId.toString() === player.session.currencyGroupId);
        const configs = this.gameData.gameConfigs;
        const { betTracks } = this.gameData.ingame[player.profile.name] || { betTracks: {} };
        const totalAmount = this.definition.choices.reduce((total, choice) => total + (betTracks[choice] || 0), 0) + amount;
        const minBet = Math.max(player.profile.minBet, settings?.minBet ?? 0);
        const maxBet = Math.min(player.profile.maxBet, settings?.maxBet ?? Infinity);
        const maxBetPerChoice = this.getMaxBetPerChoice(player, betChoice, settings);

        return [
            {
                failure: freeBet && !configs.enableFreeBet,
                notice: this.getNoticeObj(helpers.noticeHelper.invalidBet),
            },
            {
                failure: amount > maxBetPerChoice || betTracks[betChoice] + amount > maxBetPerChoice,
                notice: this.getNoticeObj(helpers.noticeHelper.maxBetForChoice, { maxBet: maxBetPerChoice }),
            },
            {
                failure: amount < minBet,
                notice: this.getNoticeObj(helpers.noticeHelper.minBet, { minBet }),
            },
            {
                failure: amount > maxBet,
                notice: this.getNoticeObj(helpers.noticeHelper.maxBet, { maxBet }),
            },
            {
                failure: totalAmount > maxBet,
                notice: this.getNoticeObj(helpers.noticeHelper.maxBet, { maxBet }),
            },
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

    composeHedgeBetValidationCriteria(betChoice: string, player: any): { failure: boolean; notice: string }[] {
        const { betTracks } = this.gameData.ingame[player.profile.name] || { betTracks: {} };
        const hedgeBetGroups = this.definition.hedgeBetGroups.filter((group) => group.includes(betChoice));

        const isInvalid = Object.keys(betTracks).some(
            (betKey) => betTracks[betKey] && hedgeBetGroups.some((group) => group.includes(betKey)) && betKey !== betChoice
        );

        return [
            {
                failure: isInvalid,
                notice: this.getNoticeObj(helpers.noticeHelper.disallowHedgeBet, { hedgeBetGroup: hedgeBetGroups }),
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
        return Object.values(PRE_MATCH_BET_CHOICES).includes(betChoice);
    }

    private isSecondHalfBetChoice(betChoice: string) {
        return Object.values(LIVE_BET_CHOICES).includes(betChoice);
    }

    private getMaxBetPerChoice(player: any, betChoice: string, settings?: any) {
        if (this.isFirstHalfBetChoice(betChoice)) {
            return Math.min(player.profile.maxBet, settings?.maxBetPerChoices[betChoice] || Infinity);
        }

        return this.getMaxBetPerChoiceWithOdds(player, betChoice, settings);
    }

    private getMaxBetPerChoiceWithOdds(player: any, betChoice: string, settings?: any) {
        const maxBet = player.profile.maxBet ?? Infinity;
        const configuredMaxBetByBetChoice = settings?.maxBetPerChoices[ADMIN_BET_CHOICES_MAPPER[betChoice]] ?? Infinity;
        const maxBetByOdds = this.getMaxBetByOdds(betChoice, maxBet);

        return Math.min(maxBet, configuredMaxBetByBetChoice, maxBetByOdds);
    }

    private getMaxBetByOdds(betChoice: string, maxBet: number) {
        const odds = this.gameData?.dynamicOdds;
        const betChoiceOdds = odds?.[betChoice] ?? 1;
        return Math.round(maxBet / Math.abs(betChoiceOdds - 1));
    }
}
