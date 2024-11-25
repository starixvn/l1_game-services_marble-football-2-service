import {
    provablyFairConsumer,
    resultsRepository,
    roundResultPublisher,
    roundResultConsumer as roundResultConsumerStub,
} from "../global-stubs";

import { stub } from "jest-auto-stub";
import RoundResultConsumer from "../../../src/consumers/round-result-consumer";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import * as ResultHelper from "../../../src/helpers/result-helper";

jest.mock("sc-game-base/src/core/event-consumers", () => {
    class RoundResultConsumer {
        constructor(
            public readonly gameData: object,
            public readonly definition: object,
            public readonly roundResultPublisher: object,
            public readonly resultsRepository: object,
            public readonly provablyFairConsumer: object
        ) {}

        generateResult() {
            return roundResultConsumerStub.generateResult();
        }
    }

    return { RoundResultConsumer };
});

jest.mock("../../../src/helpers/result-helper", () => ({
    generateResult: jest.fn().mockResolvedValue({ result: "generated" }),
    generateResultFromAdminRawResult: jest.fn().mockResolvedValue({ result: "admin" }),
}));

jest.mock("sc-game-base/src/core/helpers/crypto-helper", () => ({
    encrypt: jest.fn().mockReturnValue("encrypted"),
}));

describe("RoundResultConsumer", () => {
    let roundResultConsumer: RoundResultConsumer;

    const gameData = stub<GameData>({
        matchConfig: {
            firstHalf: {},
            secondHalf: {},
            ou: 5,
        },
        result: {},
    });
    const definition = stub<GameDefinition>();
    const appConfigs = { some: "config" };

    beforeEach(() => {
        roundResultConsumer = new RoundResultConsumer({
            gameData,
            definition,
            roundResultPublisher,
            resultsRepository,
            provablyFairConsumer,
            tournamentConsumer: { getCurrentTournamentId: async () => "fake_id" },
            appConfigs,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("generateResult", () => {
        it("should try admin result first then generate result if no admin result", async () => {
            // Act
            await roundResultConsumer.generateResult();

            // Assert
            expect(ResultHelper.generateResult).toHaveBeenCalledWith({
                matchConfig: gameData.matchConfig,
                appConfigs,
            });
            expect(gameData.result).toEqual({
                result: "generated",
                tournamentId: "fake_id",
            });
        });

        it("should use admin result if available", async () => {
            // Arrange
            gameData.roundId = 1;
            gameData.settlementResultFromAdmin = {
                roundId: 1,
                result: { someResult: true },
            };

            // Act
            await roundResultConsumer.generateResult();

            // Assert
            expect(ResultHelper.generateResultFromAdminRawResult).toHaveBeenCalledWith(
                gameData.matchConfig,
                gameData.settlementResultFromAdmin.result,
                appConfigs
            );
            expect(gameData.result).toEqual({
                result: "admin",
                tournamentId: "fake_id",
            });
        });

        it("should call createResultRecord", async () => {
            // Arrange
            jest.spyOn(roundResultConsumer, "createResultRecord").mockResolvedValue();

            // Act
            await roundResultConsumer.generateResult();

            // Assert
            expect(roundResultConsumer.createResultRecord).toHaveBeenCalled();
        });
    });

    describe("generateResultFromAdminAsync", () => {
        it("should generate result when roundId matches", async () => {
            // Arrange
            gameData.matchConfig = { matchConfig: "data" } as any;
            gameData.roundId = 1;
            gameData.settlementResultFromAdmin = {
                roundId: 1,
                result: { someResult: true },
            };

            // Act
            const result = await roundResultConsumer.generateResultFromAdminAsync();

            // Assert
            expect(result).toBe(true);
            expect(ResultHelper.generateResultFromAdminRawResult).toHaveBeenCalledWith(
                gameData.matchConfig,
                gameData.settlementResultFromAdmin.result,
                appConfigs
            );
        });

        it("should return false when roundId doesn't match", async () => {
            // Arrange
            gameData.roundId = 1;
            gameData.settlementResultFromAdmin = {
                roundId: 2,
                result: { someResult: true },
            };

            // Act
            const result = await roundResultConsumer.generateResultFromAdminAsync();

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("createResultRecord", () => {
        it("should create encrypted result record", async () => {
            // Arrange
            gameData.roundId = 1;

            // Act
            await roundResultConsumer.createResultRecord();

            // Assert
            expect(resultsRepository.create).toHaveBeenCalledWith({
                roundId: 1,
                encryptedResult: "encrypted",
            });
        });
    });
});
