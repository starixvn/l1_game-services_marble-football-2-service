import { stub } from "jest-auto-stub";
import ProcessBetQueue from "../../../src/crons/process-bet-queue";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import {
    baseMetrics,
    betLogsRepository,
    betsRepository,
    gameManagementApiClientFactory,
    logService,
    placeBet,
    placeBetPublisher,
} from "../global-stubs";
import { TableProcessBetQueue } from "sc-game-base/src/table/crons";
import { helpers } from "sc-common";
import { Duration } from "../../../src/game-definition";

describe("ProcessBetQueue", () => {
    let processBetQueue: ProcessBetQueue;
    let mockPlayer: any;
    let mockBet: any;
    let mockRate: number;

    beforeEach(() => {
        const gameData = stub<GameData>();
        const definition = stub<GameDefinition>({ choices: ["choice1", "choice2"] } as any);
        gameData.playerBetCount = {};
        processBetQueue = new ProcessBetQueue({
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

        mockPlayer = { UID: "player1" };
        mockBet = { amount: 100, betChoice: "choice1", roundId: 1, clientSeed: new Date() };
        mockRate = 1.5;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("adjustTotalBets", () => {
        it("should call adjustPlayerBetCount with correct parameters", () => {
            // Arrange
            jest.spyOn(TableProcessBetQueue.prototype, "adjustTotalBets");
            const adjustPlayerBetCountSpy = jest.spyOn(processBetQueue, "adjustPlayerBetCount");

            // Act
            processBetQueue.adjustTotalBets(mockPlayer, mockBet, mockRate);

            // Assert
            expect(adjustPlayerBetCountSpy).toHaveBeenCalledWith(mockPlayer, mockBet.betChoice);
        });
    });

    describe("adjustPlayerBetCount", () => {
        it("should initialize playerBetCount array if not present", () => {
            // Arrange

            // Act
            processBetQueue.adjustPlayerBetCount(mockPlayer, mockBet.betChoice);

            // Assert
            expect(processBetQueue.gameData.playerBetCount[mockBet.betChoice]).toEqual([mockPlayer.UID]);
        });

        it("should add player UID to playerBetCount array if not already present", () => {
            // Arrange
            processBetQueue.gameData.playerBetCount[mockBet.betChoice] = [];

            // Act
            processBetQueue.adjustPlayerBetCount(mockPlayer, mockBet.betChoice);

            // Assert
            expect(processBetQueue.gameData.playerBetCount[mockBet.betChoice]).toContain(mockPlayer.UID);
        });

        it("should not add player UID to playerBetCount array if already present", () => {
            // Arrange
            processBetQueue.gameData.playerBetCount[mockBet.betChoice] = [mockPlayer.UID];

            // Act
            processBetQueue.adjustPlayerBetCount(mockPlayer, mockBet.betChoice);

            // Assert
            expect(processBetQueue.gameData.playerBetCount[mockBet.betChoice].length).toBe(1);
        });

        it("should not add player UID if betChoice is not in definition choices", () => {
            // Arrange

            // Act
            processBetQueue.adjustPlayerBetCount(mockPlayer, "invalidChoice");

            // Assert
            expect(processBetQueue.gameData.playerBetCount["invalidChoice"]).toBeUndefined();
        });
    });

    describe("composeBettingTimeValidationCriteria", () => {
        it("should return correct criteria when round ID matches and within betting time", () => {
            // Arrange
            const mockDurations: Duration = {
                placingBets: 10,
                lockingBet: 5,
                wholeRound: 30,
                placingBetsFirstHalf: 10,
                lockingBetFirstHalf: 5,
                startingRound: 2,
                streamingVideoFirstHalf: 4,
                placingBetsSecondHalf: 20,
                lockingBetSecondHalf: 15,
                streamingVideoSecondHalf: 14
            };
            processBetQueue.definition.durations = mockDurations;
            processBetQueue.gameData.roundId = 1;
            processBetQueue.gameData.remainingTime = 8;

            const expectedBettingTimeResult = true;

            jest.spyOn(require("../../../src/helpers/game-timing"), "isWithinBettingTime")
                .mockReturnValue(expectedBettingTimeResult);

            // Act
            const criteria = processBetQueue.composeBettingTimeValidationCriteria(1);

            // Assert
            expect(criteria).toEqual([
                {
                    failure: !expectedBettingTimeResult,
                    notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
                },
                {
                    failure: false,
                    notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
                },
            ]);
        });

        it("should return failure when round ID does not match", () => {
            // Arrange
            const mockDurations: Duration = {
                placingBets: 10,
                lockingBet: 5,
                wholeRound: 30,
                placingBetsFirstHalf: 10,
                lockingBetFirstHalf: 5,
                startingRound: 2,
                streamingVideoFirstHalf: 4,
                placingBetsSecondHalf: 20,
                lockingBetSecondHalf: 15,
                streamingVideoSecondHalf: 14
            };
            processBetQueue.definition.durations = mockDurations;
            processBetQueue.gameData.roundId = 1;
            processBetQueue.gameData.remainingTime = 8;

            jest.spyOn(require("../../../src/helpers/game-timing"), "isWithinBettingTime")
                .mockReturnValue(true);

            // Act
            const criteria = processBetQueue.composeBettingTimeValidationCriteria(2);

            // Assert
            expect(criteria).toEqual([
                {
                    failure: true,
                    notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
                },
                {
                    failure: false,
                    notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
                },
            ]);
        });
    });
});
