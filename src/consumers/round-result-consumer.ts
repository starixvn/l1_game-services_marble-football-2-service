import { RoundResultConsumer as RoundResultConsumerBase } from "sc-game-base/src/core/event-consumers";
import GameData from "../game-data";
import type TournamentConsumer from "./tournament-consumer";
import { resultHelper } from "../helpers";
import { encrypt } from "sc-game-base/src/core/helpers/crypto-helper";
import type appConfigs from "../app-configs";

export default class RoundResultConsumer extends RoundResultConsumerBase {
    declare gameData: GameData;
    tournamentConsumer: TournamentConsumer;
    appConfigs: typeof appConfigs;

    constructor(container: any) {
        super(
            container.gameData,
            container.definition,
            container.roundResultPublisher,
            container.resultsRepository,
            container.provablyFairConsumer
        );

        this.tournamentConsumer = container.tournamentConsumer;
        this.appConfigs = container.appConfigs;
    }

    override async generateResult() {
        const isResultFromAdminGenerated = await this.generateResultFromAdminAsync();

        if (!isResultFromAdminGenerated) {
            this.gameData.result = await resultHelper.generateResult({
                matchConfig: this.gameData.matchConfig,
                appConfigs: this.appConfigs,
            });
        }

        this.gameData.result.tournamentId = await this.tournamentConsumer.getCurrentTournamentId();
        await this.createResultRecord();
    }

    async generateResultFromAdminAsync() {
        const { roundId, settlementResultFromAdmin: resultFromAdmin } = this.gameData;

        if (roundId === resultFromAdmin.roundId) {
            this.gameData.result = await resultHelper.generateResultFromAdminRawResult(
                this.gameData.matchConfig,
                resultFromAdmin.result,
                this.appConfigs
            );
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
