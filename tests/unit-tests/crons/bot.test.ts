import { stub } from "jest-auto-stub";
import Bot from "../../../src/crons/bot";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import { gameManagementApiClientFactory, publisher, tempBetsRepository } from "../global-stubs";
import { helpers } from "sc-common";
import * as gameTimingHelpers from "../../../src/helpers/game-timing";

jest.mock("sc-common", () => ({
    helpers: {
        arrayHelper: {
            shuffle: jest.fn((arr) => arr), // Return the array unchanged to make tests predictable
        },
    },
}));

jest.mock("../../../src/helpers/game-timing", () => ({
    isWithinFirstHalfBettingTime: jest.fn(),
}));

describe("Bot", () => {
    let botInstance: Bot;
    let mockPickone: jest.Mock;

    const definition = stub<GameDefinition>({
        choices: ["home", "away", "homeLive", "secondHalfAway"] as any,
        hedgeBetGroups: [
            ["home", "away"],
            ["homeLive", "secondHalfAway"],
        ],
        durations: {
            placingBetsFirstHalf: 300,
            lockingBetFirstHalf: 60,
            placingBetsSecondHalf: 200,
            lockingBetSecondHalf: 30,
        },
    });
    const gameData = stub<GameData>({
        players: {},
        playerBetCount: {
            home: [],
            invalidChoice: [],
        },
        remainingTime: 100,
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockPickone = jest.fn((arr) => arr[0]);

        botInstance = new Bot(definition, gameData, publisher, gameManagementApiClientFactory, tempBetsRepository);

        Object.defineProperty(botInstance, "chance", {
            value: {
                pickone: mockPickone,
            },
        });

        jest.spyOn(botInstance as any, "getBetChoicesRatios").mockReturnValue([]);
    });

    describe("updateBalanceAndPublishBetPayload", () => {
        it("should update the balance and call updatePlayerBetCount", () => {
            // Arrange
            const botId = "bot1";
            const choice = "home";
            const amount = 100;
            const balance = 500;
            gameData.players[botId] = { red: 0 };
            const updatePlayerBetCountSpy = jest.spyOn(botInstance, "updatePlayerBetCount");
            const superUpdateSpy = jest.spyOn(botInstance, "updateBalanceAndPublishBetPayload");

            // Act
            botInstance.updateBalanceAndPublishBetPayload(botId, choice, amount, balance);

            // Assert
            expect(gameData.players[botId].red).toBe(balance);
            expect(updatePlayerBetCountSpy).toHaveBeenCalledWith(botId, choice);
            expect(superUpdateSpy).toHaveBeenCalledWith(botId, choice, amount, balance);
        });
    });

    describe("updatePlayerBetCount", () => {
        it("should update player bet count for a valid choice", () => {
            // Arrange
            const playerId = "player1";
            const choice = "home";

            // Act
            botInstance.updatePlayerBetCount(playerId, choice);

            // Assert
            expect(gameData.playerBetCount[choice]).toContain(playerId);
        });

        it("should not update player bet count for an invalid choice", () => {
            // Arrange
            const playerId = "player1";
            const choice = "invalidChoice";

            // Act
            botInstance.updatePlayerBetCount(playerId, choice);

            // Assert
            expect(gameData.playerBetCount[choice]).toEqual([]);
        });

        it("should initialize playerBetCount array if it doesn't exist", () => {
            // Arrange
            const playerId = "player1";
            const choice = "away";
            delete gameData.playerBetCount[choice];

            // Act
            botInstance.updatePlayerBetCount(playerId, choice);

            // Assert
            expect(gameData.playerBetCount[choice]).toEqual([playerId]);
        });

        it("should not add duplicate player IDs to playerBetCount", () => {
            // Arrange
            const playerId = "player1";
            const choice = "home";
            gameData.playerBetCount[choice] = [playerId];

            // Act
            botInstance.updatePlayerBetCount(playerId, choice);

            // Assert
            expect(gameData.playerBetCount[choice]).toEqual([playerId]);
            expect(gameData.playerBetCount[choice].length).toBe(1);
        });
    });

    describe("getBetChoice", () => {
        describe("during first half betting period", () => {
            beforeEach(() => {
                // Set up for first half betting period
                (gameTimingHelpers.isWithinFirstHalfBettingTime as jest.Mock).mockReturnValue(true);
            });

            it("should return a choice from underRatio groups when available", () => {
                // Arrange
                const bot = { choices: ["home", "away"] };
                const underRatioGroups = [{ underBetRatio: true, group: ["home"] }];

                (botInstance as any).getBetChoicesRatios.mockReturnValue(underRatioGroups);

                mockPickone.mockImplementation((arr) => (arr === underRatioGroups[0].group ? "home" : arr[0]));

                // Act
                const result = botInstance.getBetChoice(bot);

                // Assert
                expect(result).toBe("away");
                expect(helpers.arrayHelper.shuffle).toHaveBeenCalledWith(underRatioGroups);
            });

            it("should return a random choice when no underRatio groups are available", () => {
                // Arrange
                const bot = { choices: ["home", "away"] };

                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("home")) return "home";
                    return arr[0];
                });

                // Act
                const result = botInstance.getBetChoice(bot);

                // Assert
                expect(result).toBe("away");
            });

            it("should return original choice when bot doesn't have the opposite choice in hedge bet group", () => {
                // Arrange
                const bot = { choices: ["home"] };

                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("home")) return "home";
                    return arr[0];
                });

                // Act
                const result = botInstance.getBetChoice(bot);

                // Assert
                expect(result).toBe("home");
            });

            it("should return opposite choice when bot has it in hedge bet group", () => {
                // Arrange
                const bot = { choices: ["away"] };

                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("home")) return "home";
                    return arr[0];
                });

                // Act
                const result = botInstance.getBetChoice(bot);

                // Assert
                expect(result).toBe("away");
            });
        });

        describe("during second half betting period", () => {
            beforeEach(() => {
                (gameTimingHelpers.isWithinFirstHalfBettingTime as jest.Mock).mockReturnValue(false);
            });

            it("should return a second half choice from available options", () => {
                // Arrange
                const bot = { choices: ["homeLive", "secondHalfAway"] };

                // Force pickone to return homeLive for this test
                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("homeLive")) return "homeLive";
                    return arr[0];
                });

                // Act
                const result = botInstance.getBetChoice(bot);

                // Assert
                expect(result).toBe("secondHalfAway");
            });
        });
    });
});
