import { TableProcessBetQueue } from "sc-game-base/src/table/crons";
import GameData from "../game-data";
import GameManagementApiClientFactory from "sc-game-base/src/core/game-management-api";
import GameDefinition from "../game-definition";
import { PlaceBetPublisher } from "sc-game-base/src/core/event-publishers";
import { logger } from "sc-common";
import mongoose from "mongoose";
import BaseMetrics from "sc-game-base/src/core/base-metrics";
import { RoundResultPublisher } from "../publishers";

export default class ProcessBetQueue extends TableProcessBetQueue {
    roundsRepository: mongoose.Model<any>;
    roundResultPublisher: RoundResultPublisher;

    declare gameData: GameData;
    declare definition: GameDefinition;

    constructor({
        definition,
        gameData,
        placeBetPublisher,
        placeBet,
        logService,
        betsRepository,
        betLogsRepository,
        roundsRepository,
        gameManagementApiClientFactory,
        baseMetrics,
        roundResultPublisher,
    }: {
        definition: GameDefinition;
        gameData: GameData;
        placeBetPublisher: PlaceBetPublisher;
        placeBet: any;
        logService: typeof logger;
        betsRepository: mongoose.Model<any>;
        betLogsRepository: mongoose.Model<any>;
        roundsRepository: mongoose.Model<any>;
        gameManagementApiClientFactory: GameManagementApiClientFactory;
        baseMetrics: BaseMetrics;
        roundResultPublisher: RoundResultPublisher;
    }) {
        super({
            definition,
            gameData,
            placeBetPublisher,
            placeBet,
            logService,
            betsRepository,
            betLogsRepository,
            gameManagementApiClientFactory,
            baseMetrics,
        });

        this.roundsRepository = roundsRepository;
        this.roundResultPublisher = roundResultPublisher;
    }
}
