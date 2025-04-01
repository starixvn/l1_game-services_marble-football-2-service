import { stub } from "jest-auto-stub";
import Bot from "../../../src/crons/bot";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import { gameManagementApiClientFactory, publisher, tempBetsRepository } from "../global-stubs";
import { helpers } from "sc-common";
import * as gameTimingHelpers from "../../../src/helpers/game-timing";

// Mock sc-common to control shuffle behavior
jest.mock("sc-common", () => ({
    helpers: {
        arrayHelper: {
            shuffle: jest.fn(arr => arr), // Return the array unchanged to make tests predictable
        },
    },
}));

// Mock game timing helpers to control behavior based on remaining time
jest.mock("../../../src/helpers/game-timing", () => ({
    isWithinFirstHalfBettingTime: jest.fn(),
}));

describe("Bot", () => {
    let botInstance: Bot;
    let mockPickone: jest.Mock;

    const definition = stub<GameDefinition>({
        choices: ["home", "away", "homeLive", "secondHalfAway"] as any,
        hedgeBetGroups: [["home", "away"], ["homeLive", "secondHalfAway"]],
        durations: {
            placingBetsFirstHalf: 300,
            lockingBetFirstHalf: 60,
            placingBetsSecondHalf: 200,
            lockingBetSecondHalf: 30,
        }
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
        // Reset mocks before each test
        jest.clearAllMocks();
        
        mockPickone = jest.fn(arr => arr[0]);
        
        botInstance = new Bot(definition, gameData, publisher, gameManagementApiClientFactory, tempBetsRepository);
        
        // Mock chance.pickone to return first element consistently
        Object.defineProperty(botInstance, 'chance', {
            value: {
                pickone: mockPickone,
            }
        });

        // Setup getBetChoicesRatios to return empty array by default
        jest.spyOn(botInstance as any, 'getBetChoicesRatios').mockReturnValue([]);
    });

    describe("updateBalanceAndPublishBetPayload", () => {
        it("should update the balance and call updatePlayerBetCount", () => {
            const botId = "bot1";
            const choice = "home";
            const amount = 100;
            const balance = 500;

            gameData.players[botId] = { red: 0 };

            const updatePlayerBetCountSpy = jest.spyOn(botInstance, "updatePlayerBetCount");
            const superUpdateSpy = jest.spyOn(botInstance, "updateBalanceAndPublishBetPayload");

            botInstance.updateBalanceAndPublishBetPayload(botId, choice, amount, balance);

            expect(gameData.players[botId].red).toBe(balance);
            expect(updatePlayerBetCountSpy).toHaveBeenCalledWith(botId, choice);
            expect(superUpdateSpy).toHaveBeenCalledWith(botId, choice, amount, balance);
        });
    });

    describe("updatePlayerBetCount", () => {
        it("should update player bet count for a valid choice", () => {
            const playerId = "player1";
            const choice = "home";

            botInstance.updatePlayerBetCount(playerId, choice);

            expect(gameData.playerBetCount[choice]).toContain(playerId);
        });

        it("should not update player bet count for an invalid choice", () => {
            const playerId = "player1";
            const choice = "invalidChoice";

            botInstance.updatePlayerBetCount(playerId, choice);

            expect(gameData.playerBetCount[choice]).toEqual([]);
        });

        it("should initialize playerBetCount array if it doesn't exist", () => {
            const playerId = "player1";
            const choice = "away";

            delete gameData.playerBetCount[choice];

            botInstance.updatePlayerBetCount(playerId, choice);

            expect(gameData.playerBetCount[choice]).toEqual([playerId]);
        });

        it("should not add duplicate player IDs to playerBetCount", () => {
            const playerId = "player1";
            const choice = "home";

            gameData.playerBetCount[choice] = [playerId];

            botInstance.updatePlayerBetCount(playerId, choice);

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
                // Bot has both choices from the hedge bet group
                const bot = { choices: ["home", "away"] };
                const underRatioGroups = [{ underBetRatio: true, group: ["home"] }];
                
                // Mock getBetChoicesRatios to return our prepared data
                (botInstance as any).getBetChoicesRatios.mockReturnValue(underRatioGroups);
                
                // Force pickone to return home
                mockPickone.mockImplementation((arr) => 
                    arr === underRatioGroups[0].group ? "home" : arr[0]
                );
                
                const result = botInstance.getBetChoice(bot);
                
                // It should choose away since home was picked initially
                // and the bot has both options available
                expect(result).toBe("away");
                expect(helpers.arrayHelper.shuffle).toHaveBeenCalledWith(underRatioGroups);
            });

            it("should return a random choice when no underRatio groups are available", () => {
                // Bot has both choices from the hedge bet group
                const bot = { choices: ["home", "away"] };
                
                // Force pickone to return home for this test
                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("home")) return "home";
                    return arr[0];
                });
                
                const result = botInstance.getBetChoice(bot);
                
                // It should choose away since home was picked initially
                // and the bot has both options available
                expect(result).toBe("away");
            });

            it("should return original choice when bot doesn't have the opposite choice in hedge bet group", () => {
                // Bot only has the initial choice, not the opposite
                const bot = { choices: ["home"] };
                
                // Force pickone to return home
                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("home")) return "home";
                    return arr[0];
                });
                
                const result = botInstance.getBetChoice(bot);
                
                // It should keep home since the bot doesn't have away available
                expect(result).toBe("home");
            });

            it("should return opposite choice when bot has it in hedge bet group", () => {
                // Bot only has the opposite choice
                const bot = { choices: ["away"] };
                
                // Force pickone to return home initially
                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("home")) return "home";
                    return arr[0];
                });
                
                const result = botInstance.getBetChoice(bot);
                
                // It should choose away since that's the opposite of home
                // and the bot has it available
                expect(result).toBe("away");
            });
        });

        describe("during second half betting period", () => {
            beforeEach(() => {
                // Set up for second half betting period
                (gameTimingHelpers.isWithinFirstHalfBettingTime as jest.Mock).mockReturnValue(false);
            });

            it("should return a second half choice from available options", () => {
                // Bot has both choices from the hedge bet group
                const bot = { choices: ["homeLive", "secondHalfAway"] };
                
                // Force pickone to return homeLive for this test
                mockPickone.mockImplementation((arr) => {
                    if (arr.includes("homeLive")) return "homeLive";
                    return arr[0];
                });
                
                const result = botInstance.getBetChoice(bot);
                
                // It should choose secondHalfAway since homeLive was picked initially
                // and the bot has both options available
                expect(result).toBe("secondHalfAway");
            });
        });
    });
});
