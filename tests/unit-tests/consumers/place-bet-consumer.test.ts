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
        placingBetSecondHalf: 120,
        lockingBetSecondHalf: 60,
    };

    beforeEach(() => {
        jest.spyOn(Core.BaseEventConsumers.PlaceBetConsumer.prototype, 'composeBetAmountValidationCriteria')
            .mockReturnValue([]);

        mockGameData = {
            remainingTime: 100
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

    describe("composeValidationCriteria", () => {
        const defaultTestParams = {
            player: {},
            amount: 100,
            freeBet: false,
            roundId: 1
        };

        describe("when within second half betting time", () => {
            beforeEach(() => {
                mockGameData.remainingTime = 90;
            });

            describe("when using second half bet choice", () => {
                it("should pass validation", () => {
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    const result = placeBetConsumer.composeValidationCriteria(
                        defaultTestParams.player,
                        betChoice,
                        defaultTestParams.amount,
                        defaultTestParams.freeBet,
                        defaultTestParams.roundId
                    );

                    expect(result[0].failure).toBe(false);
                });
            });

            describe("when using first half bet choice", () => {
                it("should fail validation", () => {
                    const betChoice = "firstHalfHome";

                    const result = placeBetConsumer.composeValidationCriteria(
                        defaultTestParams.player,
                        betChoice,
                        defaultTestParams.amount,
                        defaultTestParams.freeBet,
                        defaultTestParams.roundId
                    );

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
                    const betChoice = SECOND_HALF_BET_CHOICES.secondHalfHome;

                    const result = placeBetConsumer.composeValidationCriteria(
                        defaultTestParams.player,
                        betChoice,
                        defaultTestParams.amount,
                        defaultTestParams.freeBet,
                        defaultTestParams.roundId
                    );

                    expect(result[0].failure).toBe(false);
                    expect(result[0].notice).toEqual({ errorCode: "SB1935" });
                });
            });
        });
    });
});
