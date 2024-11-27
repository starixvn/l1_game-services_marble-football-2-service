import GameCron from "../../../src/crons/game-cron";
import { stub } from "jest-auto-stub";

import {
    bot,
    gameManagementApiClientFactory,
    gameStatusPublisher,
    provablyFairConsumer,
    roundIdConsumer,
    roundResultConsumer,
    runningRoundInfoPublisher,
    settleGameConsumer,
    unsettledRoundConsumer,
} from "../global-stubs";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import { TournamentConsumer } from "../../../src/consumers";

describe("GameCron", () => {
    let gameCron: GameCron;

    const definition = stub<GameDefinition>();
    const tournament = stub<TournamentConsumer>();

    definition.durations = {
        wholeRound: 125,
        placingBets: 120,
        lockingBet: 93,
        streamingVideo: 90,
    } as any;

    beforeEach(() => {
        const gameData = stub<GameData>({
            disabled: false,
        });

        gameCron = new GameCron({
            definition,
            gameData,
            bot: bot as any,
            settleGameRoundConsumer: settleGameConsumer,
            gameStatusPublisher,
            runningRoundInfoPublisher,
            logService: null as any,
            roundResultConsumer,
            resultsRepository: {} as any,
            appConfigs: {},
            gameManagementApiClientFactory,
            roundIdConsumer,
            provablyFairConsumer,
            unsettledRoundConsumer,
            tournamentConsumer: tournament,
        });

        gameCron.gameManagementApiClient = {
            notification: {
                getUmMessages: jest.fn(),
            },
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("proceed", () => {
        it("should reset player bet count for new round", () => {
            // act
            gameCron.resetForNewRound();

            // assert
            expect(gameCron.gameData.playerBetCount).toEqual({});
        });

        it("should generate round data and reset settlement result from admin", async () => {
            // act
            await gameCron.generateRoundData();

            // assert
            expect(roundResultConsumer.generateResult).toHaveBeenCalled();
            expect(gameCron.gameData.settlementResultFromAdmin).toEqual({});
        });

        it("should proceed and handle game status check at the start of a new round", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.wholeRound;
            jest.spyOn(gameCron, "checkGameStatus").mockImplementation(async () => {});

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.checkGameStatus).toHaveBeenCalled();
        });

        it("should decrement remaining time if game is not disabled", async () => {
            // arrange
            gameCron.gameData.remainingTime = 5;
            gameCron.gameData.disabled = false;

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.gameData.remainingTime).toBe(4);
        });

        it("should publish start placing bet status at the correct time", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.placingBets + 1;

            // act
            await gameCron.proceed();

            // assert
            expect(gameStatusPublisher.publishStartPlacingBetStatus).toHaveBeenCalled();
        });

        it("should publish end placing bet status locking bet time", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.lockingBet;

            // act
            await gameCron.proceed();

            // assert
            expect(gameStatusPublisher.publishEndPlacingBetStatus).toHaveBeenCalled();
        });

        it("should call getVideoTimeline at the correct time", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.streamingVideo + 1;
            jest.spyOn(gameCron, "getVideoTimeline").mockResolvedValue();

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.getVideoTimeline).toHaveBeenCalled();
        });

        it("should call publishVideoStream at the correct time", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.streamingVideo;
            jest.spyOn(gameCron, "publishVideoStream");

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.publishVideoStream).toHaveBeenCalled();
        });

        it("should publish video stream at the correct time", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.streamingVideo;
            gameCron.gameData.result = {
                firstHalfVideo: "http://marble-football/watch?v=HH",
                secondHalfVideo: "http://marble-football/watch?v=AA",
            };

            // act
            await gameCron.proceed();

            // assert
            expect(runningRoundInfoPublisher.publishToAllUsers).toHaveBeenCalledWith({
                videoResult: {
                    firstHalfVideo: "http://marble-football/watch?v=HH",
                    secondHalfVideo: "http://marble-football/watch?v=AA",
                },
            });
        });

        describe("when the remaining time is less than 0", () => {
            it("should reset remaining time", async () => {
                // arrange
                gameCron.gameData.remainingTime = -1;
                (definition.settle as jest.Mock).mockReturnValue({ draw: false });

                // act
                await gameCron.proceed();

                // assert
                expect(gameCron.gameData.remainingTime).toBe(definition.durations.wholeRound);
            });

            it("should settle round", async () => {
                // arrange
                gameCron.gameData.remainingTime = -1;
                (definition.settle as jest.Mock).mockReturnValue({ draw: false });

                // act
                await gameCron.proceed();

                // assert
                expect(settleGameConsumer.settleRound).toHaveBeenCalled();
            });

            it("should update tournament", async () => {
                // arrange
                gameCron.gameData.remainingTime = -1;
                (definition.settle as jest.Mock).mockReturnValue({ draw: false });

                // act
                await gameCron.proceed();

                // assert
                expect(tournament.updateMatchResult).toHaveBeenCalled();
            });
        });

        it("should run bot and publish running round info during bet time", async () => {
            // arrange
            gameCron.gameData.remainingTime = 100;

            // act
            await gameCron.proceed();

            // assert
            expect(bot.run).toHaveBeenCalled();
            expect(runningRoundInfoPublisher.publish).toHaveBeenCalled();
        });

        it("should not decrement remaining time if game is disabled", async () => {
            // arrange
            gameCron.gameData.remainingTime = 5;
            gameCron.gameData.disabled = true;

            // act
            await gameCron.proceed();

            // assert
            expect(gameCron.gameData.remainingTime).toBe(5);
        });

        it("should not run bot if remaining time is not during bet time", async () => {
            // arrange
            gameCron.gameData.remainingTime = 6;

            // act
            await gameCron.proceed();

            // assert
            expect(bot.run).not.toHaveBeenCalled();
        });

        it("should not publish running round info if remaining time is not during bet time", async () => {
            // arrange
            gameCron.gameData.remainingTime = 6;

            // act
            await gameCron.proceed();

            // assert
            expect(runningRoundInfoPublisher.publish).not.toHaveBeenCalled();
        });
    });

    describe("getVideoTimelineForHalf", () => {
        it("should return an empty array when the fetch response is not ok", async () => {
            // Arrange
            const videoName = "test-video";
            const mockResponse = {
                ok: false,
                status: 404,
            };
            global.fetch = jest.fn().mockResolvedValue(mockResponse);
            gameCron.appConfigs = { liveStreamServer: "http://example.com/" } as any;
            gameCron.logService = jest.fn();

            // Act
            const result = await gameCron.getVideoTimelineForHalf(videoName);

            // Assert
            expect(global.fetch).toHaveBeenCalledWith(new URL("http://example.com/test-video.json"));
            expect(result).toEqual([]);
            expect(gameCron.logService).toHaveBeenCalledWith(
                "Failed to fetch video timeline http://example.com/test-video.json with error: 404"
            );
        });

        it("should handle and log errors when the fetch operation fails", async () => {
            // Arrange
            const videoName = "test-video";
            const mockError = new Error("Network error");
            global.fetch = jest.fn().mockRejectedValue(mockError);
            gameCron.appConfigs = { liveStreamServer: "http://example.com/" } as any;
            gameCron.logService = jest.fn();

            // Act
            const result = await gameCron.getVideoTimelineForHalf(videoName);

            // Assert
            expect(global.fetch).toHaveBeenCalledWith(new URL("http://example.com/test-video.json"));
            expect(result).toEqual([]);
            expect(gameCron.logService).toHaveBeenCalledWith(
                "Failed to get video timeline http://example.com/test-video.json with error: Error: Network error"
            );
        });

        it("should return the correct timeline data when the fetch is successful", async () => {
            // Arrange
            const videoName = "test-video";
            const mockTimeline = [
                { time: 0, event: "start" },
                { time: 10, event: "goal" },
            ];
            const mockResponse = {
                ok: true,
                json: jest.fn().mockResolvedValue({ timeLine: mockTimeline }),
            };
            global.fetch = jest.fn().mockResolvedValue(mockResponse);
            gameCron.appConfigs = { liveStreamServer: "http://example.com/" } as any;

            // Act
            const result = await gameCron.getVideoTimelineForHalf(videoName);

            // Assert
            expect(global.fetch).toHaveBeenCalledWith(new URL("http://example.com/test-video.json"));
            expect(result).toEqual(mockTimeline);
        });
    });

    describe("getVideoTimeline", () => {
        it("should correctly set firstHalfTimeline and secondHalfTimeline properties in gameData.result", async () => {
            // Arrange
            const mockFirstHalfTimeline = [
                { time: 0, event: "start" },
                { time: 10, event: "goal" },
            ];
            const mockSecondHalfTimeline = [
                { time: 0, event: "start" },
                { time: 15, event: "goal" },
            ];
            gameCron.gameData.result = {
                firstHalfVideo: "first-half-video",
                secondHalfVideo: "second-half-video",
            };
            jest.spyOn(gameCron, "getVideoTimelineForHalf")
                .mockResolvedValueOnce(mockFirstHalfTimeline)
                .mockResolvedValueOnce(mockSecondHalfTimeline);

            // Act
            await gameCron.getVideoTimeline();

            // Assert
            expect(gameCron.getVideoTimelineForHalf).toHaveBeenCalledTimes(2);
            expect(gameCron.getVideoTimelineForHalf).toHaveBeenCalledWith("first-half-video");
            expect(gameCron.getVideoTimelineForHalf).toHaveBeenCalledWith("second-half-video");
            expect(gameCron.gameData.result.firstHalfTimeline).toEqual(mockFirstHalfTimeline);
            expect(gameCron.gameData.result.secondHalfTimeline).toEqual(mockSecondHalfTimeline);
        });
    });
});
