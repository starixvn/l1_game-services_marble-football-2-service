import { stub } from "jest-auto-stub";
import RoundResultConsumer from "../../../src/consumers/round-result-consumer";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import { provablyFairConsumer, resultsRepository, roundResultPublisher } from "../global-stubs";

describe("RoundResultConsumer", () => {
    let roundResultConsumer: RoundResultConsumer;

    const gameData = stub<GameData>({
        matchConfig: {
            firstHalf: {},
            secondHalf: {},
            ou: 5,
        },
    });
    const definition = stub<GameDefinition>();

    beforeEach(() => {
        roundResultConsumer = new RoundResultConsumer(gameData, definition, roundResultPublisher, resultsRepository, provablyFairConsumer);
    });

    describe("getDataForGenerateResult", () => {
        it("should return matchConfig from gameData", () => {
            // act
            const result = roundResultConsumer.getDataForGenerateResult();

            // assert
            expect(result).toBe(gameData.matchConfig);
        });
    });
});
