import { RoundResultConsumer as RoundResultConsumerBase } from "sc-game-base/src/core/event-consumers";
import GameData from "../game-data";
import type TournamentConsumer from "./tournament-consumer";

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
        return this.gameData.matchConfig;
    }

    async generateResult() {
        await super.generateResult();

        this.gameData.result.tournamentId = await this.tournamentConsumer.getTournamentIdForNextRound();
    }
}
