import { stub } from "jest-auto-stub";
import Bot from "../../../src/crons/bot";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import { gameManagementApiClientFactory, publisher, tempBetsRepository } from "../global-stubs";

describe("Bot", () => {
    let botInstance: Bot;

    const definition = stub<GameDefinition>({
        choices: ["choice1", "choice2"] as any,
    });
    const gameData = stub<GameData>({
        players: {},
        playerBetCount: {
            choice1: [],
            invalidChoice: [],
        },
    });

    beforeEach(() => {
        botInstance = new Bot(definition, gameData, publisher, gameManagementApiClientFactory, tempBetsRepository);
    });

    describe("updateBalanceAndPublishBetPayload", () => {
        it("should update the balance and call updatePlayerBetCount", () => {
            const botId = "bot1";
            const choice = "choice1";
            const amount = 100;
            const balance = 500;

            gameData.players[botId] = { red: 0 };

            const updatePlayerBetCountSpy = jest.spyOn(botInstance, "updatePlayerBetCount");

            botInstance.updateBalanceAndPublishBetPayload(botId, choice, amount, balance);

            expect(gameData.players[botId].red).toBe(balance);
            expect(updatePlayerBetCountSpy).toHaveBeenCalledWith(botId, choice);
        });
    });

    describe("updatePlayerBetCount", () => {
        it("should update player bet count for a valid choice", () => {
            const playerId = "player1";
            const choice = "choice1";

            botInstance.updatePlayerBetCount(playerId, choice);

            expect(gameData.playerBetCount[choice]).toContain(playerId);
        });

        it("should not update player bet count for an invalid choice", () => {
            const playerId = "player1";
            const choice = "invalidChoice";

            botInstance.updatePlayerBetCount(playerId, choice);

            expect(gameData.playerBetCount[choice]).toEqual([]);
        });
    });

    describe("addToPlayersAndPublish", () => {
        it("should add bot to players", () => {
            const newBot = { id: "bot1" };

            botInstance.addToPlayersAndPublish(newBot);

            expect(gameData.players[newBot.id]).toBe(newBot);
        });
    });

    describe("removeBot", () => {
        it("should remove bot from players and botsInRoom", () => {
            const botId = "bot1";
            gameData.players[botId] = { id: botId };
            (botInstance as any).botsInRoom = { [botId]: {} };

            botInstance.removeBot(botId);

            expect(gameData.players[botId]).toBeUndefined();
            expect((botInstance as any).botsInRoom[botId]).toBeUndefined();
        });
    });
});
