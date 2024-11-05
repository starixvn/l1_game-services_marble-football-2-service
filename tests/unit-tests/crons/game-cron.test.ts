import GameCron from "../../../src/crons/game-cron";
import { stub } from "jest-auto-stub";

import {
    bot,
    gameManagementApiClientFactory,
    gameStatusPublisher,
    provablyFairConsumer,
    roundIdConsumer,
    roundResultConsumer,
    runningRoundPublisher,
    settleGameConsumer,
    unsettledRoundConsumer,
} from "../global-stubs";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import { TournamentConsumer } from "../../../src/consumers";

describe("GameCron", () => {
    let gameCron: GameCron;

    const gameData = stub<GameData>();
    const definition = stub<GameDefinition>();
    const tournament = stub<TournamentConsumer>();

    definition.durations = {
        wholeRound: 10,
        placingBets: 5,
        lockingBet: 2,
        showingResult: 1,
        startingRound: 1,
    } as any;

    beforeEach(() => {
        gameCron = new GameCron({
            definition,
            gameData,
            bot: bot as any,
            settleGameRoundConsumer: settleGameConsumer,
            gameStatusPublisher,
            runningRoundInfoPublisher: runningRoundPublisher,
            logService: null as any,
            roundResultConsumer,
            resultsRepository: {} as any,
            appConfigs: {},
            gameManagementApiClientFactory,
            roundIdConsumer,
            provablyFairConsumer,
            unsettledRoundConsumer,
            tournamentConsumer: tournament,
        });

        gameCron.gameManagementApiClient = {
            notification: {
                getUmMessages: jest.fn(),
            },
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("proceed", () => {
        it("should reset player bet count for new round", () => {
            // act
            gameCron.resetForNewRound();

            // assert
            expect(gameData.playerBetCount).toEqual({});
        });

        it("should generate round data and reset settlement result from admin", async () => {
            // act
            await gameCron.generateRoundData();

            // assert
            expect(roundResultConsumer.generateResult).toHaveBeenCalled();
            expect(gameData.settlementResultFromAdmin).toEqual({});
        });

        it("should proceed and handle game status check at the start of a new round", async () => {
            // arrange
            gameData.remainingTime = definition.durations.wholeRound;
            jest.spyOn(gameCron, "checkGameStatus").mockImplementation(async () => {});

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.checkGameStatus).toHaveBeenCalled();
        });

        it("should decrement remaining time if game is not disabled", async () => {
            // arrange
            gameData.remainingTime = 5;
            gameData.disabled = false;

            // act
            await gameCron.proceed();

            // assert
            expect(gameData.remainingTime).toBe(4);
        });

        it("should publish start placing bet status at the correct time", async () => {
            // arrange
            gameData.remainingTime = definition.durations.placingBets + 1;

            // act
            await gameCron.proceed();

            // assert
            expect(gameStatusPublisher.publishStartPlacingBetStatus).toHaveBeenCalled();
        });

        it("should publish end placing bet status and round data at locking bet time", async () => {
            // arrange
            gameData.remainingTime = definition.durations.lockingBet;
            jest.spyOn(gameCron, "publishRoundData").mockImplementation(() => {});

            // act
            await gameCron.proceed();

            // assert
            expect(gameStatusPublisher.publishEndPlacingBetStatus).toHaveBeenCalled();
            expect(gameCron.publishRoundData).toHaveBeenCalled();
        });

        describe("when the remaining time is less than 0", () => {
            it("should reset remaining time", async () => {
                // arrange
                gameData.remainingTime = -1;
                (definition.settle as jest.Mock).mockReturnValue({ draw: false });

                // act
                await gameCron.proceed();

                // assert
                expect(gameData.remainingTime).toBe(definition.durations.wholeRound);
            });

            it("should settle round", async () => {
                // arrange
                gameData.remainingTime = -1;
                (definition.settle as jest.Mock).mockReturnValue({ draw: false });

                // act
                await gameCron.proceed();

                // assert
                expect(settleGameConsumer.settleRound).toHaveBeenCalled();
            });

            it("should update tournament", async () => {
                // arrange
                gameData.remainingTime = -1;
                (definition.settle as jest.Mock).mockReturnValue({ draw: false });

                // act
                await gameCron.proceed();

                // assert
                expect(tournament.updateMatchResult).toHaveBeenCalled();
            });
        });

        it("should run bot and publish running round info during bet time", async () => {
            // arrange
            gameData.remainingTime = 3;

            // act
            await gameCron.proceed();

            // assert
            expect(bot.run).toHaveBeenCalled();
            expect(runningRoundPublisher.publish).toHaveBeenCalled();
        });

        it("should not decrement remaining time if game is disabled", async () => {
            // arrange
            gameData.remainingTime = 5;
            gameData.disabled = true;

            // act
            await gameCron.proceed();

            // assert
            expect(gameData.remainingTime).toBe(5);
        });

        it("should not run bot if remaining time is not during bet time", async () => {
            // arrange
            gameData.remainingTime = 6;

            // act
            await gameCron.proceed();

            // assert
            expect(bot.run).not.toHaveBeenCalled();
        });

        it("should not publish running round info if remaining time is not during bet time", async () => {
            // arrange
            gameData.remainingTime = 6;

            // act
            await gameCron.proceed();

            // assert
            expect(runningRoundPublisher.publish).not.toHaveBeenCalled();
        });
    });
});
