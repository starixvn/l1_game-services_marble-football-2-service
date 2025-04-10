import { TableGameConfigBot } from "sc-game-base/src/table/crons";
import GameData from "../game-data";
import { isWithinBettingTime, isWithinFirstHalfBettingTime, isWithinSecondHalfBettingTime } from "../helpers/game-timing";
import GameDefinition from "../game-definition";
import { helpers } from "sc-common";
import { LIVE_BET_CHOICES, PRE_MATCH_BET_CHOICES } from "../constants";

export default class Bot extends TableGameConfigBot {
    declare gameData: GameData;
    declare definition: GameDefinition;

    override updateBalanceAndPublishBetPayload(botId: string, choice: string, amount: number, balance: number) {
        super.updateBalanceAndPublishBetPayload(botId, choice, amount, balance);
        this.updatePlayerBetCount(botId, choice);
    }

    updatePlayerBetCount(playerId: string, choice: string) {
        if (this.definition.choices.includes(choice)) {
            if (!this.gameData.playerBetCount[choice]) {
                this.gameData.playerBetCount[choice] = [];
            }
            !this.gameData.playerBetCount[choice].includes(playerId) && this.gameData.playerBetCount[choice].push(playerId);
        }
    }

    getBetChoice(bot: any) {
        const betOptions = this.filterBetChoice(this.definition.choices);
        const betChoiceRatios = this.getBetChoicesRatios();
        const underRatioGroups = helpers.arrayHelper.shuffle(betChoiceRatios.filter((data) => data.underBetRatio && data.group.length > 0));
        const choice = underRatioGroups.length > 0 ? this.chance.pickone(underRatioGroups[0].group) : this.chance.pickone(betOptions);
        const hedgeBetGroup = this.definition.hedgeBetGroups.find((group) => group.includes(choice));

        if (hedgeBetGroup) {
            const oppositeChoice = choice === hedgeBetGroup[0] ? hedgeBetGroup[1] : hedgeBetGroup[0];
            return bot.choices.includes(oppositeChoice) ? oppositeChoice : choice;
        } else {
            return choice;
        }
    }

    getBetChoicesRatios() {
        const totalBotBet = this.getAllBetAmountOnChoices(this.betOptions);
        return Object.keys(this.botSettings.ratio).map((group) => {
            const betOptions = this.filterBetChoice(this.botSettings[group] as string[]);
            return {
                group: betOptions,
                underBetRatio: (this.getAllBetAmountOnChoices(betOptions) * 100) / totalBotBet < this.botSettings.ratio[group],
            };
        });
    }

    isDuringBetTime = () => isWithinBettingTime(this.gameData.remainingTime, this.definition.durations);

    async insertOrUpdateBet(bot: any, choice: string, amount: number, currentBet: any) {
        const currentAmount = currentBet ? currentBet[choice] : 0;
        const update = { [choice]: amount + currentAmount, odds: this.gameData.dynamicOdds };
        const create = {
            uid: bot.id,
            name: bot.name,
            roundId: this.gameData.roundId,
            time: new Date(),
            currency: " ",
            operatorId: " ",
            clientSeed: bot.clientSeed,
        };

        await this.tempBetsRepository.updateOne(
            { uid: bot.id, roundId: this.gameData.roundId },
            { $set: update, $setOnInsert: create },
            { upsert: true, setDefaultsOnInsert: true }
        );

        return create.time;
    }

    filterBetChoice(betOptions: string[]) {
        return betOptions.filter((choice) => this.isBetChoiceValid(choice));
    }

    private isBetChoiceValid(choice: string) {
        const remainingTime = this.gameData.remainingTime;
        const durations = this.definition.durations;
        const isFirstHalf = isWithinFirstHalfBettingTime(remainingTime, durations);
        const acceptedBetChoices = isFirstHalf ? PRE_MATCH_BET_CHOICES : LIVE_BET_CHOICES;
        return Object.hasOwn(acceptedBetChoices, choice) && this.isOddOfBetChoiceValid(choice);
    }

    private isOddOfBetChoiceValid(choice: string) {
        return this.gameData?.dynamicOdds?.[choice] && this.gameData?.dynamicOdds?.[choice] !== 0;
    }
}
