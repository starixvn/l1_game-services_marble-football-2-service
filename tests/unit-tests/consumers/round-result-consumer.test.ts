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

    beforeEach(() => {
        roundResultConsumer = new RoundResultConsumer({
            gameData,
            definition,
            roundResultPublisher,
            resultsRepository,
            provablyFairConsumer,
            tournamentConsumer: { getCurrentTournamentId: async () => "fake_id" },
        });
    });

    describe("getDataForGenerateResult", () => {
        it("should return matchConfig from gameData", () => {
            // act
            const result = roundResultConsumer.getDataForGenerateResult();

            // assert
            expect(result).toBe(gameData.matchConfig);
        });
    });

    describe("generateResult", () => {
        it("should call super.generateResult", async () => {
            // Act
            await roundResultConsumer.generateResult();

            // Assert
            expect(roundResultConsumerStub.generateResult).toHaveBeenCalled();
        });

        it("should generate the round result", async () => {
            // Act
            await roundResultConsumer.generateResult();

            // Assert
            expect(gameData.result).toStrictEqual({
                tournamentId: "fake_id",
            });
        });
    });
});
