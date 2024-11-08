import { stub } from "jest-auto-stub";
import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../../../src/game-data";
import { InGameConsumer } from "../../../src/consumers";
import * as helper from "../../../src/helpers";
import GameDefinition from "../../../src/game-definition";
import { gameManagementApiClientFactory, publisher, roundQuery } from "../global-stubs";

describe("InGameConsumer test", () => {
    let consumer: InGameConsumer;
    const definition = stub<GameDefinition>();
    const gameData = stub<GameData>();
    const getBalance = jest.fn();

    beforeEach(() => {
        consumer = new InGameConsumer(definition, gameData, roundQuery, publisher, getBalance, gameManagementApiClientFactory);
    });

    it("inherit InGameConsumer of sc-number-game-base", () => {
        expect(consumer instanceof TableInGameConsumer);
    });

    describe("getUserBetPercentage", () => {
        jest.spyOn(helper.betPercentage, "calculatePlayerBetPercentage").mockReturnValue({
            home: 66.6,
            away: 33.3,
        });

        it("should call roundUserBetPercentage with correct value", () => {
            // arrange
            const playerBetCount = { home: ["111", "113"], away: ["112"] };

            // act
            consumer.getUserBetPercentage(playerBetCount);

            // assert
            expect(helper.betPercentage.calculatePlayerBetPercentage).toHaveBeenCalledWith(playerBetCount, ["home", "draw", "away"]);
        });
    });

    describe("buildPayload", () => {
        it("should build payload with userBetPercentage and match", async () => {
            // arrange
            const realPlayer = { id: "player1" };
            const payload = { some: "payload" };
            const playerBetCount = { home: ["111", "113"], away: ["112"] };

            gameData.playerBetCount = playerBetCount;
            jest.spyOn(TableInGameConsumer.prototype, "buildPayload").mockResolvedValue(payload);
            jest.spyOn(consumer, "getUserBetPercentage").mockReturnValue({ home: 66, away: 34 });

            // act
            const result = await consumer.buildPayload(realPlayer);

            // assert
            expect(result).toEqual({ ...payload, userBetPercentage: { home: 66, away: 34 } });
        });
    });

    describe("consume", () => {
        it("should emit disabled message if gameConfigs is not enabled", async () => {
            // arrange
            const realPlayer = { UID: "player1", socketClient: { emit: jest.fn() }, profile: { name: "Player One" } };
            gameData.remainingTime = 100;
            gameData.gameConfigs = { enabled: false } as any;
            gameData.umMessages = "Game is disabled" as any;

            const payload = {
                user: { red: true, avatarId: "avatar1", type: "type1", rate: 1.5 },
                some: "payload",
            };

            jest.spyOn(consumer, "buildPayload").mockResolvedValue(payload);

            // act
            await consumer.consume(realPlayer);

            // assert
            expect(realPlayer.socketClient.emit).toHaveBeenCalledWith(consumer.definition.name, {
                remainingTime: 100,
                um: true,
                um_message: "Game is disabled",
            });
        });

        it("should build payload and emit it", async () => {
            // arrange
            const realPlayer = { UID: "player1", socketClient: { emit: jest.fn() }, profile: { name: "Player One" } };
            const payload = {
                user: { red: true, avatarId: "avatar1", type: "type1", rate: 1.5 },
                some: "payload",
            };
            jest.spyOn(consumer, "buildPayload").mockResolvedValue(payload);

            // act
            await consumer.consume(realPlayer);

            // assert
            expect(realPlayer.socketClient.emit).toHaveBeenCalledWith(consumer.definition.name, payload);
            expect(gameData.players["player1"]).toEqual({
                id: "player1",
                name: "Player One",
                red: true,
                avatarId: "avatar1",
                type: "type1",
                rate: 1.5,
            });
        });
    });
});
