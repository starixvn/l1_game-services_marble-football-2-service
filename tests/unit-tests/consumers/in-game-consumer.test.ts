import { stub } from "jest-auto-stub";
import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../../../src/game-data";
import { InGameConsumer } from "../../../src/consumers";
import GameDefinition from "../../../src/game-definition";
import { gameManagementApiClientFactory, publisher, roundQuery } from "../global-stubs";
import * as helper from "../../../src/helpers/bet-percentage";

describe("InGameConsumer test", () => {
    let consumer: InGameConsumer;
    const definition = stub<GameDefinition>();
    definition.durations = {
        wholeRound: 121,
        startingRound: 118,
        placingBetsFirstHalf: 115,
        lockingBetFirstHalf: 99,
        streamingVideoFirstHalf: 94,
        placingBetsSecondHalf: 63,
        lockingBetSecondHalf: 47,
        streamingVideoSecondHalf: 42,
        lockingBet: 0,
        placingBets: 0,
    };
    const gameData = stub<GameData>();
    const getBalance = jest.fn();

    beforeEach(() => {
        consumer = new InGameConsumer(definition, gameData, roundQuery, publisher, getBalance, gameManagementApiClientFactory);
    });

    it("should inherit from TableInGameConsumer", () => {
        expect(consumer instanceof TableInGameConsumer).toBeTruthy();
    });

    describe("getCurrentVideoResult", () => {
        const fullVideoFirstHalfResult = {
            firstHalfVideo: "video1.mp4",
            firstHalf: "AH",
            firstHalfTimeline: [1, 2, 3],
        };

        const fullVideoSecondHalfResult = {
            secondHalfVideo: "video2.mp4",
            secondHalfTimeline: [4, 5, 6],
            secondHalf: "HA",
        };

        const timelineFirstHalfResult = {
            firstHalfTimeline: [1, 2, 3],
            firstHalf: "AH",
        };

        const timelineSecondHalfResult = {
            secondHalfTimeline: [4, 5, 6],
            secondHalf: "HA",
        };

        const fullVideoResult = {
            ...fullVideoFirstHalfResult,
            ...fullVideoSecondHalfResult,
        };

        beforeEach(() => {
            gameData.result = fullVideoResult as any;
        });

        const testCases = [
            {
                phase: "streaming video first half",
                timeRange: { start: definition.durations.placingBetsSecondHalf + 1, end: definition.durations.streamingVideoFirstHalf },
                resultDescription: "full video first half result",
                expectedResult: fullVideoFirstHalfResult,
            },
            {
                phase: "streaming video second half",
                timeRange: { start: 0, end: definition.durations.streamingVideoSecondHalf },
                resultDescription: "full video second half result",
                expectedResult: fullVideoSecondHalfResult,
            },
            {
                phase: "showing result second half",
                timeRange: { start: 0, end: definition.durations.streamingVideoSecondHalf },
                resultDescription: "full video second half result",
                expectedResult: fullVideoSecondHalfResult,
            },
            {
                phase: "showing result second half",
                timeRange: { start: definition.durations.startingRound + 1, end: definition.durations.wholeRound },
                resultDescription: "timeline result second half",
                expectedResult: timelineSecondHalfResult,
            },
            {
                phase: "starting",
                timeRange: { start: definition.durations.placingBetsFirstHalf, end: definition.durations.startingRound },
                resultDescription: "empty result",
                expectedResult: {},
            },
            {
                phase: "placing bets first half",
                timeRange: { start: definition.durations.streamingVideoFirstHalf + 1, end: definition.durations.placingBetsFirstHalf },
                resultDescription: "empty result",
                expectedResult: {},
            },
        ];

        testCases.forEach(({ phase, timeRange, resultDescription, expectedResult }) => {
            describe(`during ${phase} phase with start time ${timeRange.start} and end time ${timeRange.end}`, () => {
                const timeToTests = Array.from({ length: timeRange.end - timeRange.start + 1 }, (_, i) => timeRange.start + i);
                it.each(timeToTests)(`should return ${resultDescription} when remaining time is %s`, (time) => {
                    gameData.remainingTime = time;
                    expect(consumer.getCurrentVideoResult()).toEqual(expectedResult);
                });
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
                firstHalf: "AH",
                secondHalf: "HA",
            };

            gameData.publishedTournament = {} as any;
            gameData.liveStreamServer = "server1";
            gameData.playerBetCount = playerBetCount;

            jest.spyOn(TableInGameConsumer.prototype, "buildPayload").mockResolvedValue(basePayload);
            jest.spyOn(consumer, "getCurrentVideoResult").mockReturnValue(videoResult as any);
            jest.spyOn(helper, "getUserBetPercentage").mockReturnValue(userBetPercentage);

            // act
            const result = await consumer.buildPayload(realPlayer);

            // assert
            expect(result).toEqual({
                ...basePayload,
                userBetPercentage,
                videoResult,
                liveStreamServer: "server1",
                tournament: {},
            });

            expect(helper.getUserBetPercentage).toHaveBeenCalledWith(playerBetCount);

            expect(consumer.getCurrentVideoResult).toHaveBeenCalled();
        });
    });
});
