import { stub } from "jest-auto-stub";
import GameStatusPublisher from "../../../src/publishers/game-status-publisher";
import GameData from "../../../src/game-data";
import GameDefinition from "../../../src/game-definition";

describe("GameStatusPublisher", () => {
    let publisher: GameStatusPublisher;
    let gameData: GameData;
    let definition: GameDefinition;
    const sampleOdds = {
        firstHalfHome: 1.5,
        firstHalfAway: 2.5,
        firstHalfDraw: 3.0,
        secondHalfHome: 1.8,
        secondHalfAway: 2.2,
        secondHalfDraw: 2.8
    };

    const configOdds = {
        firstHalfHome: 1.4,
        firstHalfAway: 2.4,
        firstHalfDraw: 2.9,
        secondHalfHome: 1.7,
        secondHalfAway: 2.1,
        secondHalfDraw: 2.7
    };

    beforeEach(() => {
        gameData = stub<GameData>({
            remainingTime: 0,
            gameConfigs: {
                odds: { ...configOdds }
            }
        });

        definition = stub<GameDefinition>({
            durations: {
                placingBetsFirstHalf: 100,
                placingBetsSecondHalf: 50
            }
        });

        publisher = new GameStatusPublisher("marblefootball2", gameData, definition);
        publisher.publishToAllUsers = jest.fn();
    });

    describe("publishDynamicOddsStatus", () => {

        describe("when dynamicOdds is not generated", () => {
            it("should throw error", () => {
                // Arrange
                gameData.dynamicOdds = undefined;
                
                // Act
                const act = () => publisher.publishDynamicOddsStatus(true);
                
                // Assert
                expect(act).toThrow("Dynamic odds are not generated");
            });
        });

        
        describe("when in first half placing bet time", () => {

            beforeEach(() => {
                gameData.remainingTime = definition.durations.placingBetsFirstHalf;
            })

            it("should publish only first half odds from dynamicOdds", () => {
                // Arrange
                
                gameData.dynamicOdds = { ...sampleOdds };
    
                // Act
                publisher.publishDynamicOddsStatus(true);
    
                // Assert
                const publishedData = (publisher.publishToAllUsers as jest.Mock).mock.calls[0][0];
                
                expect(publishedData).toEqual({
                    odds: {
                        firstHalfHome: 1.5,
                        firstHalfAway: 2.5,
                        firstHalfDraw: 3.0
                    }
                });
            });
        });

        describe("when in second half placing bet time", () => {
            
            beforeEach(() => {
                gameData.remainingTime = definition.durations.placingBetsSecondHalf;
            });

            it("should publish only second half odds from dynamicOdds", () => {
                // Arrange
                gameData.dynamicOdds = { ...sampleOdds };
    
                // Act
                publisher.publishDynamicOddsStatus(false);
    
                // Assert
                const publishedData = (publisher.publishToAllUsers as jest.Mock).mock.calls[0][0];
                
                expect(publishedData).toEqual({
                    odds: {
                        secondHalfHome: 1.8,
                        secondHalfAway: 2.2,
                        secondHalfDraw: 2.8
                    }
                });
            });
        });
    });
});
