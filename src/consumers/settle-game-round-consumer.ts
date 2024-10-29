import { TableSettleGameRoundConsumer as SettleGameRoundConsumerBase } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";

export default class SettleGameRoundConsumer extends SettleGameRoundConsumerBase {
    override async settleRound() {
        const result = this.generateResult();
        const settlementResult = this.definition.settle(result);
        const { roundId, exchangeRates, match } = this.gameData as GameData;
        const newRound = await this.roundsRepository.create({
            id: roundId,
            result,
            settlementResult,
            time: new Date(),
            exchangeRateId: exchangeRates.exId,
            match,
        });

        if (newRound) {
            this.roundResultPublisher.publishRoundResult(this.collectRoundResult(result, settlementResult, roundId));

            const finish = {
                settlementResult,
                result,
                roundId: newRound.id,
                time: newRound.time,
            };

            this.gameData.roundId = finish.roundId + 1;

            await this.settleBets(finish);

            this.roundResultPublisher.publishWinners(roundId, this.gameData.winningPlayers);
        }
    }

    collectRoundResult(result: any, settlementResult: any, roundId: any) {
        return {
            result,
            settlementResult,
            roundId,
        };
    }
}
