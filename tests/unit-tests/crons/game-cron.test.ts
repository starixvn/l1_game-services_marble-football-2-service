import GameCron from "../../../src/crons/game-cron";
import { Table } from "sc-game-base";
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
    logService,
    tournamentConsumer,
} from "../global-stubs";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import crypto from "crypto";
import { PRE_MATCH_BET_CHOICES, LIVE_BET_CHOICES } from "../../../src/constants";
jest.mock("../../../src/timelines/video-timelines", () => ({
    "22841ea360fc3c3676a38502aa9a90a1ae1fbdac1d937746358efe559d349b6f_0": [],
    "53e5fe7054fb5c4867e0277e8867c0c08f9ca8be43fdac0d3b6c6ea5c7d656a2_AAAA": [1.8, 19.033333333333335, 33.8, 42.43333333333333],
    cc682a8a1c7d8184524fbb91f04e5ca13e5ea9500960e271f0343e0f18643043_AAAH: [3.8666666666666667, 18.066666666666666, 25.6, 34],
    "1cfbaffb0d00aa024775152621561732337e66109d8885f39612a44d2b99251a_AAA": [5.466666666666667, 19.466666666666665, 37.733333333333334],
    "0d24c9bd7c63dbab23c1f4d827509ee43a17100faeb3284555e60530fb1c1b7b_AAHA": [
        2.6333333333333333, 20.033333333333335, 26.2, 35.266666666666666,
    ],
    c20a85328513d3c79d6d66919175d0a1d112d0c6c660359e4731c444700c21f4_AAHH: [11.5, 26.166666666666668, 33.86666666666667, 41.56666666666667],
    "4b7c786db2cc35db7b37343c0290c083a548044106fecfd206454332ce0ddeea_AAH": [19.166666666666668, 26.9, 40.766666666666666],
    "7a67a3e74e83cbfd65185e1828aa09b85f76bad052538cd1f030f5af06ce2928_AA": [3.7333333333333334, 42],
    "4abd1b067acf617a255861fb3a5d8bb0838c89ec4eac1cc25538583568fdf985_AHAA": [
        2.566666666666667, 18.966666666666665, 29.133333333333333, 37,
    ],
    "7044e5388c3d625e1e95f46a9dfde0b4abc1eeeb7687e3c9e4ac58e13184ce04_AHAH": [2.7, 10.233333333333333, 19.3, 25.6],
    "01099e7f5e7bda327aebc9b027b70fa122c20f65d7eb30833051126580311f88_AHA": [18.333333333333332, 26.6, 35.7],
    "8e626c2af2d112ad3a7a8c0a09898bccde2bdb988ad789d38d1a8c0a51d6104d_AHHA": [
        5.966666666666667, 18.366666666666667, 24.933333333333334, 31.166666666666668,
    ],
    "79ce0aa56795de56ff40f2789f68276f4d3ad703a391b2d39bc780b15479a854_AHHH": [4.1, 10.5, 22.633333333333333, 39.46666666666667],
    "2bec7228ad358ad1e65496edd7a6607c8db04a9aaf80070d754f1de9b47da68b_AHH": [2.9, 11.833333333333334, 25.1],
    c89550cefa212faa7dd7421a06c28711434f6da5fc6093c4e19baaba29a4f960_AH: [13.133333333333333, 24.866666666666667],
    b4510afb170d8204b5ce6dc535770a39fbc66e1a65a8af2a22193b6d4104b49c_A: [37.46666666666667],
    "23b073f2deb8e68cd1e5879dae5e1bf54bb173e2f9646759df0243cf13e4cb94_HAAA": [5.4, 14.866666666666667, 24.9, 39.5],
    c64887d3730b5a52e96e39fb67972ca0f64e21da8aef0ba85517da0e3497584a_HAAH: [18.366666666666667, 27, 33.8, 40.2],
    ab4e46235565c9b63b6c1dae2367a318e6c2605a8645ca575cf0063417d23db3_HAA: [10.133333333333333, 18.9, 41.4],
    "3ff0610ea6b1620a3136fb41df7c2402e77fad6dfbecd88dc3493c3501ac82f7_HAHA": [4.1, 16.9, 25.7, 39.266666666666666],
    bb6e05bad5803753dbd34e8f1aad56e357437844955554b059ba90466a71a73d_HAHH: [5, 12.9, 26.166666666666668, 39.46666666666667],
    "4d29f01056b561efccf6a2bb54e4e5a02747b152d9b7736a1682a4fe81183e89_HAH": [10.866666666666667, 19.966666666666665, 29.5],
    a5ed9e3bdf040f0497132a2964bf16b6ddf17c2582882eb88e5d40bcc3a38e1b_HA: [28.5, 37.06666666666667],
    "847b2dc5fa761efd64fc6af330a8316ef7192457f1e19c29a384d336f3849bab_HHAA": [
        2.8333333333333335, 17.966666666666665, 32.46666666666667, 41.5,
    ],
    ae29dae888d7ac7670cd45e55e056857c13d6fb20bda2fc77dd11872b26864c8_HHAH: [6.3, 26.866666666666667, 33.06666666666667, 41.733333333333334],
    "09bbbfffb623070ce8d9e9ec474457e0a2994458f7178696a4d49a7d077ebef6_HHA": [19.2, 29.966666666666665, 39.86666666666667],
    "33a9416c68b765630961e6f43f980b492c91fbf0dc722a2223941cf3834aa220_HHHA": [
        18.166666666666668, 24.233333333333334, 32.5, 40.03333333333333,
    ],
    "529722ee2e00df1acf61aa94f8194ab24f98ce7325c571f4efda68e57e6a24d2_HHHH": [
        6.8, 12.566666666666666, 26.866666666666667, 36.266666666666666,
    ],
    c9bc635dd734e24c6ba8b47af4628a6b705945c68adbebbf393212376c99d365_HHH: [10.966666666666667, 30.466666666666665, 39.96666666666667],
    "6cd3e090b30fb5a3a3c2c0496d142afc678d8c02131f63b8aa8b60ed813ce8eb_HH": [11.2, 27],
    "4bba7d1cd4adb14007764406ba64b1da5720aeccddc5782940741ec477cd8b03_H": [22.366666666666667],
}));

// Add axios mock
jest.mock("axios");

describe("GameCron", () => {
    let gameCron: GameCron;

    const definition = stub<GameDefinition>();

    definition.durations = {
        wholeRound: 121,
        startingRound: 117,
        placingBetsFirstHalf: 114,
        lockingBetFirstHalf: 104,
        streamingVideoFirstHalf: 100,
        placingBetsSecondHalf: 58,
        lockingBetSecondHalf: 39,
        streamingVideoSecondHalf: 38,
        placingBets: 0,
        lockingBet: 0,
    };

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
            logService: logService as any,
            roundResultConsumer,
            resultsRepository: {} as any,
            appConfigs: {},
            gameManagementApiClientFactory,
            roundIdConsumer,
            provablyFairConsumer,
            unsettledRoundConsumer,
            tournamentConsumer,
        });

        gameCron.gameManagementApiClient = {
            notification: {
                getUmMessages: jest.fn(),
            },
        } as any;
    });

    afterEach(() => {
        jest.clearAllMocks();
        (axios.get as jest.Mock).mockReset();
    });

    describe("generateRoundData", () => {
        it("should generate round data and reset settlement result from admin", async () => {
            // act
            await gameCron.generateRoundData();

            // assert
            expect(roundResultConsumer.generateResult).toHaveBeenCalled();
            expect(gameCron.gameData.settlementResultFromAdmin).toEqual({});
        });
    });

    describe("proceed", () => {
        it("should reset player bet count for new round", () => {
            // act
            gameCron.resetForNewRound();

            // assert
            expect(gameCron.gameData.playerBetCount).toEqual({});
        });
        it("should reset dynamic odds for new round", () => {
            // act
            gameCron.resetForNewRound();

            // assert
            expect(gameCron.gameData.dynamicOdds).toEqual({});
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

        describe("first half", () => {
            it("should publish start placing bet status and calculate pre-match odds at placing bet time", async () => {
                // arrange
                gameCron.gameData.remainingTime = definition.durations.placingBetsFirstHalf + 1;
                gameCron.calculateAndPublishOddsPreMatch = jest.fn();
                gameCron.resetForNewRound = jest.fn();
                gameCron.bot = { reset: jest.fn() } as any;
                gameCron.updateNewMatchConfig = jest.fn();
                gameCron.generateRoundData = jest.fn().mockResolvedValue(null);

                // act
                await gameCron.proceed();

                // assert
                expect(gameCron.resetForNewRound).toHaveBeenCalled();
                expect(gameCron.bot.reset).toHaveBeenCalled();
                expect(gameCron.updateNewMatchConfig).toHaveBeenCalled();
                expect(gameCron.calculateAndPublishOddsPreMatch).toHaveBeenCalled();
                expect(gameCron.generateRoundData).toHaveBeenCalled();
                expect(gameStatusPublisher.publishStartPlacingBetStatus).toHaveBeenCalled();
            });

            it("should publish end placing bet status at locking bet time", async () => {
                // arrange
                gameCron.gameData.remainingTime = definition.durations.lockingBetFirstHalf;

                // act
                await gameCron.proceed();

                // assert
                expect(gameStatusPublisher.publishEndPlacingBetStatus).toHaveBeenCalled();
            });

            it("should run bot and publish running round info during bet time", async () => {
                // arrange
                gameCron.gameData.remainingTime = definition.durations.placingBetsFirstHalf - 1;

                // act
                await gameCron.proceed();

                // assert
                expect(bot.run).toHaveBeenCalled();
                expect(runningRoundInfoPublisher.publish).toHaveBeenCalled();
            });

            describe("at first half streaming time", () => {
                it("should call getVideoTimelineForFirstHalf", async () => {
                    // arrange
                    gameCron.gameData.remainingTime = definition.durations.streamingVideoFirstHalf + 1;
                    jest.spyOn(gameCron, "getVideoTimelineForFirstHalf").mockResolvedValue();

                    // act
                    await gameCron.proceed();

                    // assert
                    expect(gameCron.getVideoTimelineForFirstHalf).toHaveBeenCalled();
                });

                it("should publish video stream", async () => {
                    // arrange
                    gameCron.gameData.remainingTime = definition.durations.streamingVideoFirstHalf + 1;
                    gameCron.gameData.result = {
                        firstHalfVideo: "http://marble-football/watch?v=HH",
                        firstHalfTimeline: [1, 2, 3],
                        firstHalf: "HH",
                    } as any;

                    jest.spyOn(gameCron, "getVideoTimelineForFirstHalf").mockResolvedValue();

                    // act
                    await gameCron.proceed();

                    // assert
                    expect(runningRoundInfoPublisher.publishToAllUsers).toHaveBeenCalledWith({
                        videoResult: {
                            firstHalfVideo: "http://marble-football/watch?v=HH",
                            firstHalfTimeline: [1, 2, 3],
                            firstHalf: "HH",
                        },
                    });
                });
            });
        });

        describe("second half", () => {
            it("should publish start placing bet status and calculate live odds at placing bet time", async () => {
                // arrange
                gameCron.gameData.remainingTime = definition.durations.placingBetsSecondHalf + 1;
                gameCron.calculateAndPublishOddsLive = jest.fn();

                // act
                await gameCron.proceed();

                // assert
                expect(gameCron.calculateAndPublishOddsLive).toHaveBeenCalled();
                expect(gameStatusPublisher.publishStartPlacingBetStatus).toHaveBeenCalled();
            });

            it("should run bot and publish running round info during bet time", async () => {
                // arrange
                gameCron.gameData.remainingTime = definition.durations.placingBetsSecondHalf - 1;

                // act
                await gameCron.proceed();

                // assert
                expect(bot.run).toHaveBeenCalled();
                expect(runningRoundInfoPublisher.publish).toHaveBeenCalled();
            });

            it("should publish end placing bet status at locking bet time", async () => {
                // arrange
                gameCron.gameData.remainingTime = definition.durations.lockingBetSecondHalf;

                // act
                await gameCron.proceed();

                // assert
                expect(gameStatusPublisher.publishEndPlacingBetStatus).toHaveBeenCalled();
            });

            describe("at streaming time", () => {
                it("should call getVideoTimelineForSecondHalf", async () => {
                    // arrange
                    gameCron.gameData.remainingTime = definition.durations.streamingVideoSecondHalf + 1;
                    jest.spyOn(gameCron, "getVideoTimelineForSecondHalf").mockResolvedValue();

                    // act
                    await gameCron.proceed();

                    // assert
                    expect(gameCron.getVideoTimelineForSecondHalf).toHaveBeenCalled();
                });

                it("should publish video stream", async () => {
                    // arrange
                    gameCron.gameData.remainingTime = definition.durations.streamingVideoSecondHalf + 1;
                    gameCron.gameData.result = {
                        secondHalfVideo: "http://marble-football/watch?v=AA",
                        secondHalfTimeline: [4, 5, 6],
                        secondHalf: "AA",
                    } as any;

                    jest.spyOn(gameCron, "getVideoTimelineForSecondHalf").mockResolvedValue();

                    // act
                    await gameCron.proceed();

                    // assert
                    expect(runningRoundInfoPublisher.publishToAllUsers).toHaveBeenCalledWith({
                        videoResult: {
                            secondHalfVideo: "http://marble-football/watch?v=AA",
                            secondHalfTimeline: [4, 5, 6],
                            secondHalf: "AA",
                        },
                    });
                });
            });
        });

        it("should publish tournament at the round start time", async () => {
            // arrange
            gameCron.gameData.remainingTime = definition.durations.startingRound + 1;

            (tournamentConsumer.getCurrentTournament as any).mockResolvedValue("fake tournament");

            // act
            await gameCron.proceed();

            // assert
            expect(runningRoundInfoPublisher.publishToAllUsers).toHaveBeenCalledWith({ tournament: "fake tournament" });
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
    });

    describe("getVideoTimelineByVideoName", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should fetch timeline with proxy when enabled", async () => {
            // Arrange
            const videoName = "test-video";
            const mockTimeline = [1, 2, 3];
            gameCron.appConfigs = {
                liveStreamServer: "http://example.com/",
                proxyServer: {
                    enabled: true,
                    url: "http://proxy.com",
                },
            } as any;

            (axios.get as jest.Mock).mockResolvedValue({ data: { timeLine: mockTimeline } });

            // Act
            const result = await gameCron.getVideoTimelineByVideoName(videoName);

            // Assert
            expect(axios.get).toHaveBeenCalledWith("http://example.com/test-video.json", { httpsAgent: expect.any(HttpsProxyAgent) });
            expect(result).toEqual(mockTimeline);
        });

        it("should fetch timeline without proxy when disabled", async () => {
            // Arrange
            const videoName = "test-video";
            const mockTimeline = [1, 2, 3];
            gameCron.appConfigs = {
                liveStreamServer: "http://example.com/",
                proxyServer: {
                    enabled: false,
                },
            } as any;

            (axios.get as jest.Mock).mockResolvedValue({ data: { timeLine: mockTimeline } });

            // Act
            const result = await gameCron.getVideoTimelineByVideoName(videoName);

            // Assert
            expect(axios.get).toHaveBeenCalledWith("http://example.com/test-video.json", { httpsAgent: undefined });
            expect(result).toEqual(mockTimeline);
        });

        it("should handle and log errors when the request fails", async () => {
            // Arrange
            const videoName = "test-video";
            const mockError = new Error("Network error");
            gameCron.appConfigs = {
                liveStreamServer: "http://example.com/",
                proxyServer: { enabled: false },
            } as any;
            gameCron.gameData.roundId = 123;

            (axios.get as jest.Mock).mockRejectedValue(mockError);

            // Act & Assert
            await expect(gameCron.getVideoTimelineByVideoName(videoName)).rejects.toThrow(mockError);
            expect(logService.logError).toHaveBeenCalledWith(
                "In match 123, failed to get video timeline http://example.com/test-video.json with error: Error: Network error",
            );
        });
    });

    describe("getVideoTimelineWithRetry", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("should correctly return timeline", async () => {
            // Arrange
            const mockFirstHalfTimeline = [
                { time: 0, event: "start" },
                { time: 10, event: "goal" },
            ];

            jest.spyOn(gameCron, "getVideoTimelineByVideoName").mockResolvedValueOnce(mockFirstHalfTimeline);

            // Act
            const timeline = await gameCron.getVideoTimelineWithRetry("first-half-video", "0", true);

            // Assert
            expect(timeline).toEqual(mockFirstHalfTimeline);
        });

        it("should retry getting video timeline and fallback to default on failure", async () => {
            // Arrange
            const videoName = "test-video";
            const mockError = new Error("Network error");
            gameCron.gameData.roundId = 123;

            jest.spyOn(gameCron, "getVideoTimelineByVideoName").mockRejectedValue(mockError);

            // Act
            const result = await gameCron.getVideoTimelineWithRetry(videoName, "AAAA", true);

            // Assert
            expect(logService.logError).toHaveBeenCalledWith("In match 123, failed to fetch first half timeline: Error: Network error");
            expect(result).toEqual([1.8, 19.033333333333335, 33.8, 42.43333333333333]);
        });
    });

    describe("getVideoTimelineForFirstHalf", () => {
        it("should call getVideoTimelineWithRetry with correct arguments", async () => {
            // Arrange
            const videoName = "first-half-video";
            const isFirstHalf = true;
            const mockTimeline = [7, 8, 9];
            gameCron.gameData.result = {
                firstHalfVideo: videoName,
                firstHalf: "0",
            } as any;
            jest.spyOn(gameCron, "getVideoTimelineWithRetry").mockResolvedValueOnce(mockTimeline);

            // Act
            await gameCron.getVideoTimelineForFirstHalf();

            // Assert
            expect(gameCron.getVideoTimelineWithRetry).toHaveBeenCalledWith(videoName, "0", isFirstHalf);
            expect(gameCron.gameData.result.firstHalfTimeline).toEqual(mockTimeline);
        });
    });

    describe("getVideoTimelineForSecondHalf", () => {
        it("should call getVideoTimelineWithRetry with correct arguments", async () => {
            // Arrange
            const videoName = "second-half-video";
            const isFirstHalf = false;
            const mockTimeline = [7, 8, 9];
            gameCron.gameData.result = {
                secondHalfVideo: videoName,
                secondHalf: "0",
            } as any;
            jest.spyOn(gameCron, "getVideoTimelineWithRetry").mockResolvedValueOnce(mockTimeline);

            // Act
            await gameCron.getVideoTimelineForSecondHalf();

            // Assert
            expect(gameCron.getVideoTimelineWithRetry).toHaveBeenCalledWith(videoName, "0", isFirstHalf);
            expect(gameCron.gameData.result.secondHalfTimeline).toEqual(mockTimeline);
        });
    });

    describe("queryLastResult", () => {
        let superQueryLastResultSpy: any;

        beforeEach(() => {
            superQueryLastResultSpy = jest.spyOn(Table.Crons.TableGameCron.prototype, "queryLastResult").mockImplementation();
        });

        it("should call super.queryLastResult", async () => {
            // Act
            await gameCron.queryLastResult();

            // Assert
            expect(superQueryLastResultSpy).toHaveBeenCalled();
        });

        it("should set publishedTournament", async () => {
            // Arrange
            (tournamentConsumer.getLastTournament as any).mockResolvedValue("fake tournament");

            // Act
            await gameCron.queryLastResult();

            // Assert
            expect(gameCron.gameData.publishedTournament).toEqual("fake tournament");
        });
    });

    describe("getDefaultVideoTimeline", () => {
        it("should return correct default timeline for first half", () => {
            // Arrange
            const videoName = crypto.createHash("sha256").update(`HAA-0`).digest("hex");

            // Act
            const videoTimeline = gameCron.getDefaultVideoTimeline("HAA", true);

            // Assert
            expect(gameCron.gameData.result.firstHalfVideo).toEqual(videoName);
            expect(videoTimeline).toEqual([10.133333333333333, 18.9, 41.4]);
        });

        it("should return correct default timeline for second half", () => {
            // Arrange
            const videoName = crypto.createHash("sha256").update(`AAH-0`).digest("hex");

            // Act
            const videoTimeline = gameCron.getDefaultVideoTimeline("AAH", false);

            // Assert
            expect(gameCron.gameData.result.secondHalfVideo).toEqual(videoName);
            expect(videoTimeline).toEqual([19.166666666666668, 26.9, 40.766666666666666]);
        });
    });

    describe("timing helper methods", () => {
        it("should correctly identify first half betting time", () => {
            // Create test cases with different remaining times
            const { placingBetsFirstHalf, lockingBetFirstHalf } = definition.durations;

            // Should be true during first half betting window
            expect((gameCron as any).isDuringFirstHalfBettingTime(placingBetsFirstHalf - 1)).toBe(true);
            expect((gameCron as any).isDuringFirstHalfBettingTime(lockingBetFirstHalf + 1)).toBe(true);

            // Should be false outside first half betting window
            expect((gameCron as any).isDuringFirstHalfBettingTime(placingBetsFirstHalf)).toBe(false);
            expect((gameCron as any).isDuringFirstHalfBettingTime(lockingBetFirstHalf)).toBe(false);
        });

        it("should correctly identify second half betting time", () => {
            // Create test cases with different remaining times
            const { placingBetsSecondHalf, lockingBetSecondHalf } = definition.durations;

            // Should be true during second half betting window
            expect((gameCron as any).isDuringSecondHalfBettingTime(placingBetsSecondHalf - 1)).toBe(true);
            expect((gameCron as any).isDuringSecondHalfBettingTime(lockingBetSecondHalf + 1)).toBe(true);

            // Should be false outside second half betting window
            expect((gameCron as any).isDuringSecondHalfBettingTime(placingBetsSecondHalf)).toBe(false);
            expect((gameCron as any).isDuringSecondHalfBettingTime(lockingBetSecondHalf)).toBe(false);
        });

        it("should correctly identify start placing bet first half time", () => {
            const { placingBetsFirstHalf } = definition.durations;

            expect((gameCron as any).isStartPlacingBetFirstHalf(placingBetsFirstHalf)).toBe(true);
            expect((gameCron as any).isStartPlacingBetFirstHalf(placingBetsFirstHalf - 1)).toBe(false);
        });

        it("should correctly identify locking bet first half time", () => {
            const { lockingBetFirstHalf } = definition.durations;

            expect((gameCron as any).isLockingBetFirstHalf(lockingBetFirstHalf - 1)).toBe(true);
            expect((gameCron as any).isLockingBetFirstHalf(lockingBetFirstHalf)).toBe(false);
        });

        it("should correctly identify streaming video first half time", () => {
            const { streamingVideoFirstHalf } = definition.durations;

            expect((gameCron as any).isStreamingVideoFirstHalf(streamingVideoFirstHalf)).toBe(true);
            expect((gameCron as any).isStreamingVideoFirstHalf(streamingVideoFirstHalf - 1)).toBe(false);
        });

        it("should correctly identify start placing bet second half time", () => {
            const { placingBetsSecondHalf } = definition.durations;

            expect((gameCron as any).isStartPlacingBetSecondHalf(placingBetsSecondHalf)).toBe(true);
            expect((gameCron as any).isStartPlacingBetSecondHalf(placingBetsSecondHalf - 1)).toBe(false);
        });

        it("should correctly identify locking bet second half time", () => {
            const { lockingBetSecondHalf } = definition.durations;

            expect((gameCron as any).isLockingBetSecondHalf(lockingBetSecondHalf - 1)).toBe(true);
            expect((gameCron as any).isLockingBetSecondHalf(lockingBetSecondHalf)).toBe(false);
        });

        it("should correctly identify streaming video second half time", () => {
            const { streamingVideoSecondHalf } = definition.durations;

            expect((gameCron as any).isStreamingVideoSecondHalf(streamingVideoSecondHalf)).toBe(true);
            expect((gameCron as any).isStreamingVideoSecondHalf(streamingVideoSecondHalf - 1)).toBe(false);
        });
    });

    describe("updateNewMatchConfig", () => {
        it("should update match config with first half and random second half config", () => {
            // Act
            gameCron.updateNewMatchConfig();

            // Assert
            expect(gameCron.gameData.matchConfig).toBeDefined();
            expect(gameCron.gameData.matchConfig.firstHalfConfig).toBeDefined();
            expect(gameCron.gameData.matchConfig.secondHalfConfig).toBeDefined();
        });
    });

    describe("calculateAndPublishOddsPreMatch", () => {
        beforeEach(() => {
            jest.clearAllMocks();

            gameCron.gameData = {
                matchConfig: {
                    firstHalfConfig: {},
                    secondHalfConfig: {},
                },
                gameConfigs: {
                    margin: 0.05,
                },
            } as any;
        });

        it("should calculate pre-match odds and publish them", () => {
            // Arrange
            const mockOdds = {
                home: 2.0,
                away: 3.0,
                draw: 3.5,
                over: 1.9,
                under: 1.9,
                even: 1.95,
                odd: 1.95,
            };

            jest.spyOn(require("../../../src/helpers/odds-helper"), "calculatePreMatchOdds").mockReturnValue(mockOdds);

            // Act
            gameCron.calculateAndPublishOddsPreMatch();

            // Assert
            expect(gameStatusPublisher.publishOdds).toHaveBeenCalledWith({
                [PRE_MATCH_BET_CHOICES.home]: mockOdds.home,
                [PRE_MATCH_BET_CHOICES.away]: mockOdds.away,
                [PRE_MATCH_BET_CHOICES.draw]: mockOdds.draw,
                [PRE_MATCH_BET_CHOICES.over]: mockOdds.over,
                [PRE_MATCH_BET_CHOICES.under]: mockOdds.under,
                [PRE_MATCH_BET_CHOICES.even]: mockOdds.even,
                [PRE_MATCH_BET_CHOICES.odd]: mockOdds.odd,
            });
        });

        it("should pass correct parameters to calculatePreMatchOdds", () => {
            // Arrange
            const calculatePreMatchOddsSpy = jest.spyOn(require("../../../src/helpers/odds-helper"), "calculatePreMatchOdds");

            // Act
            gameCron.calculateAndPublishOddsPreMatch();

            // Assert
            expect(calculatePreMatchOddsSpy).toHaveBeenCalledWith(gameCron.gameData.matchConfig, gameCron.gameData.gameConfigs.margin);
        });
    });

    describe("calculateAndPublishOddsLive", () => {
        beforeEach(() => {
            // Reset mocks
            jest.clearAllMocks();

            // Setup test data
            gameCron.gameData = {
                matchConfig: {
                    secondHalfConfig: {},
                },
                gameConfigs: {
                    margin: 0.05,
                },
                result: {
                    firstHalf: "HH",
                },
            } as any;
        });

        it("should calculate live odds and publish them", () => {
            // Arrange
            const mockOdds = {
                [LIVE_BET_CHOICES.homeLive]: 2.5,
                [LIVE_BET_CHOICES.awayLive]: 2.8,
                [LIVE_BET_CHOICES.drawLive]: 3.2,
                [LIVE_BET_CHOICES.overLive]: 1.85,
                [LIVE_BET_CHOICES.underLive]: 1.95,
                [LIVE_BET_CHOICES.evenLive]: 1.92,
                [LIVE_BET_CHOICES.oddLive]: 1.92,
            };

            jest.spyOn(require("../../../src/helpers/odds-helper"), "calculateLiveOdds").mockReturnValue(mockOdds);

            // Act
            gameCron.calculateAndPublishOddsLive();

            // Assert
            expect(gameStatusPublisher.publishOdds).toHaveBeenCalledWith({
                [LIVE_BET_CHOICES.homeLive]: mockOdds[LIVE_BET_CHOICES.homeLive],
                [LIVE_BET_CHOICES.awayLive]: mockOdds[LIVE_BET_CHOICES.awayLive],
                [LIVE_BET_CHOICES.drawLive]: mockOdds[LIVE_BET_CHOICES.drawLive],
                [LIVE_BET_CHOICES.overLive]: mockOdds[LIVE_BET_CHOICES.overLive],
                [LIVE_BET_CHOICES.underLive]: mockOdds[LIVE_BET_CHOICES.underLive],
                [LIVE_BET_CHOICES.evenLive]: mockOdds[LIVE_BET_CHOICES.evenLive],
                [LIVE_BET_CHOICES.oddLive]: mockOdds[LIVE_BET_CHOICES.oddLive],
            });
        });

        it("should pass correct parameters to calculateLiveOdds", () => {
            // Arrange
            const calculateLiveOddsSpy = jest.spyOn(require("../../../src/helpers/odds-helper"), "calculateLiveOdds");

            // Act
            gameCron.calculateAndPublishOddsLive();

            // Assert
            expect(calculateLiveOddsSpy).toHaveBeenCalledWith(
                gameCron.gameData.matchConfig.secondHalfConfig,
                gameCron.gameData.result.firstHalf,
                gameCron.gameData.gameConfigs.margin,
            );
        });
    });
});
