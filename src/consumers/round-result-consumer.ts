import { RoundResultConsumer as RoundResultConsumerBase } from "sc-game-base/src/core/event-consumers";
import GameData from "../game-data";
import type TournamentConsumer from "./tournament-consumer";
import { resultHelper } from "../helpers";
import { encrypt } from "sc-game-base/src/core/helpers/crypto-helper";
export default class RoundResultConsumer extends RoundResultConsumerBase {
    declare gameData: GameData;
    tournamentConsumer: TournamentConsumer;

    constructor(container: any) {
        super(
            container.gameData,
            container.definition,
            container.roundResultPublisher,
            container.resultsRepository,
            container.provablyFairConsumer
        );

        this.tournamentConsumer = container.tournamentConsumer;
    }

    override getDataForGenerateResult() {
        const { randomMode } = this.gameData.gameConfigs;
        return { randomMode };
    }

    override async generateResult() {
        await super.generateResult();

        const tournament = await this.tournamentConsumer.getCurrentTournament();
        this.gameData.result.tournamentId = tournament._id;
        await this.createResultRecord();
    }

    override generateResultFromAdmin() {
        const { roundId, settlementResultFromAdmin: resultFromAdmin } = this.gameData;

        if (roundId === resultFromAdmin.roundId) {
            this.gameData.result = resultHelper.generateResultFromAdminRawResult(resultFromAdmin.result);
            return true;
        }

        return false;
    }

    async createResultRecord() {
        await this.resultsRepository.create({
            roundId: this.gameData.roundId,
            encryptedResult: encrypt(JSON.stringify(this.gameData.result)),
        });
    }
}
