import GameManagementApiClientFactory from "sc-game-base/src/core/game-management-api";
import GameData from "../game-data";
import GameDefinition from "../game-definition";
import { BaseBot } from "sc-game-base/src/core/crons";
import { BaseEventPublishers } from "sc-game-base/src/core";
import { IRound } from "../models/rounds";
import mongoose from "mongoose";
import { logger } from "sc-common";

export default class Bot extends BaseBot {
    declare gameData: GameData;
    declare definition: GameDefinition;
    publisher: BaseEventPublishers.BaseEventPublisher;
    roundsRepository: mongoose.Model<IRound>;
    logService: typeof logger;

    constructor(
        gameManagementApiClientFactory: GameManagementApiClientFactory,
        gameData: GameData,
        definition: GameDefinition,
        publisher: BaseEventPublishers.BaseEventPublisher,
        roundsRepository: mongoose.Model<IRound>,
        logService: typeof logger
    ) {
        super(definition, gameData, gameManagementApiClientFactory);
        this.publisher = publisher;
        this.roundsRepository = roundsRepository;
        this.logService = logService;
    }
}
