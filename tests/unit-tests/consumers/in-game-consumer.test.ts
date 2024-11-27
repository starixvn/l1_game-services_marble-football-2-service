import { stub } from "jest-auto-stub";
import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../../../src/game-data";
import { InGameConsumer } from "../../../src/consumers";
import * as helper from "../../../src/helpers";
import GameDefinition from "../../../src/game-definition";
import { gameManagementApiClientFactory, publisher, roundQuery } from "../global-stubs";
import { BET_CHOICES } from "../../../src/constants";

describe("InGameConsumer test", () => {
    let consumer: InGameConsumer;
    const definition = stub<GameDefinition>();
    const gameData = stub<GameData>();
    const getBalance = jest.fn();

    beforeEach(() => {
        consumer = new InGameConsumer(definition, gameData, roundQuery, publisher, getBalance, gameManagementApiClientFactory);
    });

    it("should inherit from TableInGameConsumer", () => {
        expect(consumer instanceof TableInGameConsumer).toBeTruthy();
    });

    describe("getUserBetPercentage", () => {
        beforeEach(() => {
            jest.spyOn(helper.betPercentage, "calculatePlayerBetPercentage").mockReturnValue({
                home: 66.6,
                away: 33.3,
                draw: 0,
            });
        });

        it("should call calculatePlayerBetPercentage with correct parameters", () => {
            // arrange
            const playerBetCount = { home: ["111", "113"], away: ["112"] };

            // act
            consumer.getUserBetPercentage(playerBetCount);

            // assert
            expect(helper.betPercentage.calculatePlayerBetPercentage).toHaveBeenCalledWith(playerBetCount, [
                BET_CHOICES.home,
                BET_CHOICES.draw,
                BET_CHOICES.away,
            ]);
        });
    });

    describe("getCurrentVideoResult", () => {
        it("should return video results from gameData", () => {
            // arrange
            gameData.result = {
                firstHalfVideo: "video1.mp4",
                secondHalfVideo: "video2.mp4",
            };

            // act
            const result = consumer.getCurrentVideoResult();

            // assert
            expect(result).toEqual({
                firstHalfVideo: "video1.mp4",
                secondHalfVideo: "video2.mp4",
            });
        });
    });

    describe("buildPayload", () => {
        it("should build payload with userBetPercentage and video result", async () => {
            // arrange
            const realPlayer = { id: "player1" };
            const basePayload = { some: "payload" };
            const playerBetCount = { home: ["111", "113"], away: ["112"] };
            const userBetPercentage = { home: 66, away: 34, draw: 0 };
            const videoResult = {
                firstHalfVideo: "video1.mp4",
                secondHalfVideo: "video2.mp4",
                firstHalfTimeline: [],
                secondHalfTimeline: [],
            };

            gameData.playerBetCount = playerBetCount;

            jest.spyOn(TableInGameConsumer.prototype, "buildPayload").mockResolvedValue(basePayload);
            jest.spyOn(consumer, "getUserBetPercentage").mockReturnValue(userBetPercentage);
            jest.spyOn(consumer, "getCurrentVideoResult").mockReturnValue(videoResult);

            // act
            const result = await consumer.buildPayload(realPlayer);

            // assert
            expect(result).toEqual({
                ...basePayload,
                userBetPercentage,
                videoResult,
            });

            expect(consumer.getUserBetPercentage).toHaveBeenCalledWith(playerBetCount);

            expect(consumer.getCurrentVideoResult).toHaveBeenCalled();
        });
    });
});
