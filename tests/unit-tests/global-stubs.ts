// @ts-ignore
import { stubMongoose, stub } from "jest-micro-auto-stub";
import mongoose from "mongoose";
import {
    BaseEventPublisher,
    GameStatusPublisher,
    PlaceBetPublisher,
    RoundResultPublisher,
    RunningRoundInfoPublisher,
    UserBetResultPublisher,
} from "sc-game-base/src/core/event-publishers";
import GameManagementApiClientFactory from "sc-game-base/src/core/game-management-api";
import Bot from "../../src/crons/bot";
import {
    ProvablyFairConsumer,
    RoundIdConsumer,
    UnsettledRoundConsumer,
    RoundResultConsumer,
    SettleGameRoundConsumer,
} from "sc-game-base/src/core/event-consumers";
import { Core } from "sc-game-base";
import BaseMetrics from "sc-game-base/src/core/base-metrics";
import { logger } from "sc-common";
jest.mock("sc-game-management-client");

const roundsRepository: mongoose.Model<any> = stubMongoose(mongoose.Model);
const betsRepository: mongoose.Model<any> = stubMongoose(mongoose.Model);
const tempBetsRepository: mongoose.Model<any> = stubMongoose(mongoose.Model);
const betLogsRepository: mongoose.Model<any> = stubMongoose(mongoose.Model);

const endGame = jest.fn();
const placeBet = jest.fn();
const gameManagementApiClientFactory = new GameManagementApiClientFactory({});

const roundQuery = stub<Core.QueryApis.RoundQuery>();
const publisher = stub<BaseEventPublisher>();

const bot = stub<Bot>();
const settleGameConsumer: SettleGameRoundConsumer = stub<SettleGameRoundConsumer>();
const gameStatusPublisher: GameStatusPublisher = stub<GameStatusPublisher>();
const runningRoundPublisher: RunningRoundInfoPublisher = stub<RunningRoundInfoPublisher>();
const roundResultConsumer: RoundResultConsumer = stub<RoundResultConsumer>();
const roundIdConsumer: RoundIdConsumer = stub<RoundIdConsumer>();
const provablyFairConsumer: ProvablyFairConsumer = stub<ProvablyFairConsumer>();
const unsettledRoundConsumer: UnsettledRoundConsumer = stub<UnsettledRoundConsumer>();
const roundResultPublisher: RoundResultPublisher = stub<RoundResultPublisher>();
const userBetResultPublisher: UserBetResultPublisher = stub<UserBetResultPublisher>();
const placeBetPublisher: PlaceBetPublisher = stub<PlaceBetPublisher>();

const baseMetrics: BaseMetrics = stub<BaseMetrics>();

const logService: typeof logger = {
    logError: jest.fn(),
    logInfo: jest.fn(),
} as unknown as typeof logger;

export {
    roundsRepository,
    betsRepository,
    tempBetsRepository,
    betLogsRepository,
    endGame,
    placeBet,
    roundResultPublisher,
    userBetResultPublisher,
    gameManagementApiClientFactory,
    bot,
    settleGameConsumer,
    gameStatusPublisher,
    runningRoundPublisher,
    roundResultConsumer,
    roundIdConsumer,
    provablyFairConsumer,
    unsettledRoundConsumer,
    roundQuery,
    publisher,
    placeBetPublisher,
    baseMetrics,
    logService,
};
