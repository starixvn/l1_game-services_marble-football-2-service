import { Table } from "sc-game-base";
import GameData from "../game-data";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;

    override resetForNewRound() {
        super.resetForNewRound();
        this.gameData.playerBetCount = {};
    }

    async generateRoundData() {
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

            // TODO: Publish round data for play video
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
