import { Core } from "sc-game-base";
import PlaceBetConsumer from "../../../src/consumers/place-bet-consumer";
import GameDefinition from "../../../src/game-definition";
import { SECOND_HALF_BET_CHOICES } from "../../../src/constants";
import { helpers } from "sc-common";

describe("PlaceBetConsumer", () => {
    let placeBetConsumer: PlaceBetConsumer;
    let mockGameDefinition: GameDefinition;
    let mockGameData: any;
    let mockEventPublisher: any;

    const DURATIONS = {
        placingBets: 130,
        lockingBet: 100,
        placingBetSecondHalf: 80,
        lockingBetSecondHalf: 60,
    };

    beforeEach(() => {
        jest.spyOn(Core.BaseEventConsumers.PlaceBetConsumer.prototype, 'composeBetChoiceValidationCriteria')
            .mockReturnValue([]);

        mockGameData = {
            remainingTime: 110,
            roundId: 1,
            gameConfigs: {
                enabled: true,
                tournamentConfig: {},
                videoStreamConfig: {
                    videoInfos: []
                }
            }
        };

        mockGameDefinition = {
            durations: DURATIONS
        } as GameDefinition;

        mockEventPublisher = {
            gameName: "test-game",
            gameData: mockGameData,
            publishToAllUsers: jest.fn(),
            publishToAllUsersExcept: jest.fn(),
            publishToUser: jest.fn(),
            publishToUsers: jest.fn(),
            publishToTable: jest.fn(),
            publishToTableExcept: jest.fn()
        };

        placeBetConsumer = new PlaceBetConsumer(
            mockGameDefinition, 
            mockGameData, 
            mockEventPublisher);
        placeBetConsumer.definition = mockGameDefinition;
        placeBetConsumer.gameData = mockGameData;
    });

    describe("composeBetChoiceValidationCriteria", () => {

        describe("when within second half betting time", () => {
            beforeEach(() => {
                mockGameData.remainingTime = 70;
            });

            describe("when using second half bet choice", () => {
                it("should pass validation", () => {
                    // Arrange
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(
                        betChoice
                    );

                    // Assert
                    expect(result[0].failure).toBe(false);
                });
            });

            describe("when using first half bet choice", () => {
                it("should fail validation", () => {
                    // Arrange
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(
                        betChoice
                    );

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });
        });

        describe("when not within second half betting time", () => {
            beforeEach(() => {
                mockGameData.remainingTime = 30;
            });

            describe("when using second half bet choice", () => {
                it("should NOT fail validation", () => {
                    // Arrange
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(
                        betChoice
                    );

                    // Assert
                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });
        });

        describe("when within first half betting time", () => {
            beforeEach(() => {
                mockGameData.remainingTime = 110;
            });

            describe("when using first half bet choice", () => {
                it("should pass validation", () => {
                    // Arrange
                    const betChoice = "firstHalfHome";

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(
                        betChoice
                    );

                    // Assert
                    expect(result[0].failure).toBe(false);
                });
            });

            describe("when using second half bet choice", () => {
                it("should fail validation", () => {
                    // Arrange
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    // Act
                    const result = placeBetConsumer.composeBetChoiceValidationCriteria(
                        betChoice
                    );

                    // Assert
                    expect(result[0].failure).toBe(true);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });
        });
    });

    describe("composeBettingTimeValidationCriteria", () => {
        const roundId = 1;

        describe("before first half betting time", () => {
            it("should fail validation", () => {
                // Arrange
                mockGameData.remainingTime = 140;

                // Act
                const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                // Assert
                expect(result[2].failure).toBe(true);
            });
        });

        describe("during first half betting time", () => {
            it("should pass validation", () => {
                // Arrange
                mockGameData.remainingTime = 110;

                // Act
                const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                // Assert
                expect(result[2].failure).toBe(false);
            });
        });

        describe("after first half betting time and before second half betting time", () => {
            it("should fail validation", () => {
                // Arrange
                mockGameData.remainingTime = 90;

                // Act
                const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                // Assert
                expect(result[2].failure).toBe(true);
            });
        });

        describe("during second half betting time", () => {
            it("should pass validation", () => {
                // Arrange
                mockGameData.remainingTime = 70;

                // Act
                const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                // Assert
                expect(result[2].failure).toBe(false);
            });
        });

        describe("after second half betting time", () => {
            it("should fail validation", () => {
                // Arrange
                mockGameData.remainingTime = 50;

                // Act
                const result = placeBetConsumer.composeBettingTimeValidationCriteria(roundId);

                // Assert
                expect(result[2].failure).toBe(true);
            });
        });
    });
});
