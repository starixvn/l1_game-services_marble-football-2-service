import { Core } from "sc-game-base";
import PlaceBetConsumer from "../../../src/consumers/place-bet-consumer";
import GameDefinition from "../../../src/game-definition";
import { SECOND_HALF_BET_CHOICES } from "../../../src/constants";

describe("PlaceBetConsumer", () => {
    let placeBetConsumer: PlaceBetConsumer;
    let mockGameDefinition: GameDefinition;
    let mockGameData: any;
    let mockEventPublisher: any;

    const DURATIONS = {
        placingBetsFirstHalf: 130,
        lockingBetFirstHalf: 100,
        placingBetsSecondHalf: 80,
        lockingBetSecondHalf: 60,
    };

    beforeEach(() => {
        jest.spyOn(Core.BaseEventConsumers.PlaceBetConsumer.prototype, "composeBetChoiceValidationCriteria").mockReturnValue([]);

        mockGameData = {
            remainingTime: 110,
            roundId: 1,
            gameConfigs: {
                enabled: true,
                tournamentConfig: {},
                videoStreamConfig: {
                    videoInfos: [],
                },
            },
        };

        mockGameDefinition = {
            durations: DURATIONS,
        } as GameDefinition;

        mockEventPublisher = {
            gameName: "test-game",
            gameData: mockGameData,
            publishToAllUsers: jest.fn(),
            publishToAllUsersExcept: jest.fn(),
            publishToUser: jest.fn(),
            publishToUsers: jest.fn(),
            publishToTable: jest.fn(),
            publishToTableExcept: jest.fn(),
        };

        placeBetConsumer = new PlaceBetConsumer(mockGameDefinition, mockGameData, mockEventPublisher);
        placeBetConsumer.definition = mockGameDefinition;
        placeBetConsumer.gameData = mockGameData;
    });

    describe("composeBettingTimeValidationCriteria", () => {
        const roundId = 1;
        describe("first half", () => {
            describe("betting boundary", () => {
                it("right before placingBets, should fail validation", () => {
                    // Arrange
                    mockGameData.remainingTime = 131;

                    // Act
                    const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                    // Assert
                    expect(result[2].failure).toBe(true);
                });

                it("exactly at placingBets, should fail validation", () => {
                    // Arrange
                    mockGameData.remainingTime = 130;

                    // Act
                    const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                    // Assert
                    expect(result[2].failure).toBe(true);
                });

                it("right after placingBets, should pass validation", () => {
                    // Arrange
                    mockGameData.remainingTime = 129;

                    // Act
                    const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                    // Assert
                    expect(result[2].failure).toBe(false);
                });
            });

            describe("locking boundary", () => {
                describe("right before lockingBet", () => {
                    it("right before lockingBet, should pass validation", () => {
                        // Arrange
                        mockGameData.remainingTime = 101;

                        // Act
                        const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                        // Assert
                        expect(result[2].failure).toBe(false);
                    });
                });
                describe("exactly at lockingBet", () => {
                    it("exactly at lockingBet, should pass validation", () => {
                        // Arrange
                        mockGameData.remainingTime = 100;

                        // Act
                        const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                        // Assert
                        expect(result[2].failure).toBe(false);
                    });
                });
                describe("right after lockingBet", () => {
                    it("right after lockingBet, should fail validation", () => {
                        // Arrange
                        mockGameData.remainingTime = 99;

                        // Act
                        const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                        // Assert
                        expect(result[2].failure).toBe(true);
                    });
                });
            });
        });

        describe("second half", () => {
            describe("betting boundary", () => {
                it("right before placingBets, should fail validation", () => {
                    // Arrange
                    mockGameData.remainingTime = 81;

                    // Act
                    const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                    // Assert
                    expect(result[2].failure).toBe(true);
                });

                it("exactly at placingBets, should fail validation", () => {
                    // Arrange
                    mockGameData.remainingTime = 80;

                    // Act
                    const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                    // Assert
                    expect(result[2].failure).toBe(true);
                });

                it("right after placingBets, should pass validation", () => {
                    // Arrange
                    mockGameData.remainingTime = 79;

                    // Act
                    const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                    // Assert
                    expect(result[2].failure).toBe(false);
                });
            });

            describe("locking boundary", () => {
                describe("right before lockingBet", () => {
                    it("right before lockingBet, should pass validation", () => {
                        // Arrange
                        mockGameData.remainingTime = 61;

                        // Act
                        const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                        // Assert
                        expect(result[2].failure).toBe(false);
                    });
                });
                describe("exactly at lockingBet", () => {
                    it("exactly at lockingBet, should pass validation", () => {
                        // Arrange
                        mockGameData.remainingTime = 60;

                        // Act
                        const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                        // Assert
                        expect(result[2].failure).toBe(false);
                    });
                });
                describe("right after lockingBet", () => {
                    it("right after lockingBet, should fail validation", () => {
                        // Arrange
                        mockGameData.remainingTime = 59;

                        // Act
                        const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                        // Assert
                        expect(result[2].failure).toBe(true);
                    });
                });
            });
        });
    });

    describe("composeBetChoiceValidationCriteria", () => {
        describe("first half", () => {
            describe("betting boundary", () => {
                it("right before placingBetsFirstHalf, should NOT validate first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 131;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right before placingBetsFirstHalf, should NOT validate second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 131;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("exactly at placingBetsFirstHalf, should NOT validate first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 130;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("exactly at placingBetsFirstHalf, should NOT validate second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 130;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right after placingBetsFirstHalf, should pass validation for first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 129;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("right after placingBetsFirstHalf, should fail validation for second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 129;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });

            describe("locking boundary", () => {
                it("right before lockingBetFirstHalf, should pass validation for first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 101;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("right before lockingBetFirstHalf, should fail validation for second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 101;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("exactly at lockingBetFirstHalf, should pass validation for first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 100;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("exactly at lockingBetFirstHalf, should fail validation for second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 100;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right after lockingBetFirstHalf, should NOT validate first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 99;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right after lockingBetFirstHalf, should NOT validate second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 99;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });
        });

        describe("second half", () => {
            describe("betting boundary", () => {
                it("right before placingBetsSecondHalf, should NOT validate first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 81;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right before placingBetsSecondHalf, should NOT validate second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 81;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("exactly at placingBetsSecondHalf, should NOT validate first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 80;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("exactly at placingBetsSecondHalf, should NOT validate second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 80;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("right after placingBetsSecondHalf, should fail validation for first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 79;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right after placingBetsSecondHalf, should pass validation for second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 79;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });
            });

            describe("locking boundary", () => {
                it("right before lockingBetSecondHalf, should fail validation for first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 61;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right before lockingBetSecondHalf, should pass validation for second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 61;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("exactly at lockingBetSecondHalf, should fail validation for first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 60;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("exactly at lockingBetSecondHalf, should pass validation for second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 60;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                });

                it("right after lockingBetSecondHalf, should NOT validate first half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 59;
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });

                it("right after lockingBetSecondHalf, should NOT validate second half bet choice", () => {
                    // Arrange
                    mockGameData.remainingTime = 59;
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(betChoice);

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });
        });
    });
});
