import { halfConfigs, OddsType } from "./../match-configs";
import { Table } from "sc-game-base";
import GameData, { MatchConfigType } from "../game-data";
import Chance from "chance";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    chance = new Chance();

    override resetForNewRound() {
        super.resetForNewRound();
        this.gameData.playerBetCount = {};
    }

    getMatchConfig(): MatchConfigType {
        const firstHalf = this.chance.pickone(halfConfigs);
        const secondHalf = this.chance.pickone(halfConfigs);

        return {
            firstHalf,
            secondHalf,
            ou: firstHalf.ou + secondHalf.ou,
        };
    }

    calculateOdds() {
        return {} as OddsType;
    }

    async generateRoundData() {
        this.gameData.matchConfig = this.getMatchConfig();

        this.gameData.odds = this.calculateOdds();

        await this.roundResultConsumer.generateResult();

        this.gameData.settlementResultFromAdmin = {};
    }

    publishRoundData() {}

    override async proceed() {
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.wholeRound) {
            await this.checkGameStatus();
        }

        const remainingTime = this.gameData.remainingTime;

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        if (this.isStartingTime(remainingTime, durations)) {
            this.resetForNewRound();
            this.bot && this.bot.reset();
            this.appConfigs.enabledBoostedOdds && (await this.updatePromotionOddsAndNotify());

            await this.generateRoundData();
        }

        if (remainingTime === durations.placingBets + 1) {
            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (remainingTime === durations.lockingBet) {
            this.gameStatusPublisher.publishEndPlacingBetStatus();
            this.publishRoundData();
        }

        if (remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;

            await this.settleGameRoundConsumer.settleRound();
        }

        if (this.isDuringBetTime(remainingTime)) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }
    }

    isDuringBetTime(remainingTime: number) {
        const { placingBets, lockingBet } = this.definition.durations;

        return remainingTime < placingBets && remainingTime > lockingBet;
    }
}
