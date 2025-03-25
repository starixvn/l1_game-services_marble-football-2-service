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
        describe("when not in place bet time", () => {

            it("should should not publish odds", () => {
                // Arrange
                const dynamicOdds = {
                    firstHalfHome: 1.7,
                    firstHalfAway: 2.7,
                    firstHalfDraw: 3.2,
                    secondHalfHome: 2.0,
                    secondHalfAway: 2.4,
                    secondHalfDraw: 3.0
                };
                gameData.dynamicOdds = dynamicOdds;
                gameData.remainingTime = definition.durations.placingBetsFirstHalf + 1;
    
                // Act
                publisher.publishDynamicOddsStatus();
    
                // Assert
                expect(publisher.publishToAllUsers).toHaveBeenCalledWith({
                    odds: {}
                });
            });
        })
        
        describe("when in first half placing bet time", () => {

            beforeEach(() => {
                gameData.remainingTime = definition.durations.placingBetsFirstHalf;
            })

            it("should publish only first half odds from dynamicOdds", () => {
                // Arrange
                
                gameData.dynamicOdds = { ...sampleOdds };
    
                // Act
                publisher.publishDynamicOddsStatus();
    
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

            it("should publish only first half odds from config odds when dynamicOdds is not available", () => {
                // Arrange
                gameData.dynamicOdds = undefined;
    
                // Act
                publisher.publishDynamicOddsStatus();
    
                // Assert
                expect(publisher.publishToAllUsers).toHaveBeenCalledWith({
                    odds: {
                        firstHalfHome: 1.4,
                        firstHalfAway: 2.4,
                        firstHalfDraw: 2.9
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
                publisher.publishDynamicOddsStatus();
    
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

            it("should publish only second half odds from config odds when dynamicOdds is not available", () => {
                // Arrange
                gameData.dynamicOdds = undefined;
    
                // Act
                publisher.publishDynamicOddsStatus();
    
                // Assert
                expect(publisher.publishToAllUsers).toHaveBeenCalledWith({
                    odds: {
                        secondHalfHome: 1.7,
                        secondHalfAway: 2.1,
                        secondHalfDraw: 2.7
                    }
                });
            });
        });
    });
});
