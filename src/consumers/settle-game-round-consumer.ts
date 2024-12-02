import { Table } from "sc-game-base";
import GameData from "../game-data";
import type TournamentConsumer from "./tournament-consumer";
export default class SettleGameRoundConsumer extends Table.EventConsumers.TableSettleGameRoundConsumer {
    declare gameData: GameData;
    tournamentConsumer: TournamentConsumer;

    constructor(container: any) {
        super(container);

        this.tournamentConsumer = container.tournamentConsumer;
    }

    override async settleRound() {
        await super.settleRound();
        await this.updateTournament();
    }

    async updateTournament() {
        const settlementResult = this.definition.settle(this.gameData.result);
        const homeWins = settlementResult.draw ? this.gameData.result.homeWinsOnDraw : settlementResult.home;

        await this.tournamentConsumer.updateMatchResult(this.gameData.roundId - 1, this.gameData.result.tournamentId as string, homeWins);
    }
}
