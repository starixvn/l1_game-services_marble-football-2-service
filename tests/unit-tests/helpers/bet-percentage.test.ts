import { betPercentage } from "../../../src/helpers";
import { BET_CHOICES } from "../../../src/constants";

describe("betPercentage", () => {
    describe("calculateUserBetPercentage", () => {
        const betChoices = ["home", "draw", "away"];

        it("should calculate the correct percentages for each choice of specific choices", () => {
            // Arrange
            const playerBetCount = {
                [BET_CHOICES.home]: ["player1", "player2"],
                [BET_CHOICES.away]: ["player3"],
                [BET_CHOICES.over]: ["player4"],
                [BET_CHOICES.under]: ["player5"],
            };

            // Act
            const result = betPercentage.calculatePlayerBetPercentage(playerBetCount, betChoices);

            // Assert
            expect(result[BET_CHOICES.home]).toBe(67);
            expect(result[BET_CHOICES.draw]).toBe(0);
            expect(result[BET_CHOICES.away]).toBe(33);
        });

        it("should handle empty playerBetCount", () => {
            // Arrange
            const playerBetCount = {};

            // Act
            const result = betPercentage.calculatePlayerBetPercentage(playerBetCount, betChoices);

            // Assert
            expect(result).toEqual({
                [BET_CHOICES.home]: 0,
                [BET_CHOICES.draw]: 0,
                [BET_CHOICES.away]: 0,
            });
        });

        it("should handle zero total bets", () => {
            // Arrange
            const playerBetCount = {
                [BET_CHOICES.home]: [],
                [BET_CHOICES.away]: [],
            };

            // Act
            const result = betPercentage.calculatePlayerBetPercentage(playerBetCount, betChoices);

            // Assert
            expect(result[BET_CHOICES.home]).toBe(0);
            expect(result[BET_CHOICES.away]).toBe(0);
            expect(result[BET_CHOICES.draw]).toBe(0);
        });
    });

    describe("getUserBetPercentage", () => {
        it("should calculate percentages using default bet choices", () => {
            // Arrange
            const playerBetCount = {
                [BET_CHOICES.home]: ["user1", "user2"],
                [BET_CHOICES.draw]: ["user3"],
                [BET_CHOICES.away]: ["user4", "user5", "user6"],
                [BET_CHOICES.homeLive]: ["user7"],
                [BET_CHOICES.drawLive]: ["user8", "user9"],
                [BET_CHOICES.awayLive]: ["user10", "user11", "user12"],
            };

            // Act
            const result = betPercentage.getUserBetPercentage(playerBetCount);

            // Assert
            expect(result).toEqual({
                [BET_CHOICES.home]: 17,
                [BET_CHOICES.draw]: 8,
                [BET_CHOICES.away]: 25,
                [BET_CHOICES.homeLive]: 8,
                [BET_CHOICES.drawLive]: 17,
                [BET_CHOICES.awayLive]: 25,
            });
        });

        it("should handle empty playerBetCount correctly", () => {
            // Arrange
            const playerBetCount = {};

            // Act
            const result = betPercentage.getUserBetPercentage(playerBetCount);

            // Assert
            expect(result).toEqual({
                [BET_CHOICES.home]: 0,
                [BET_CHOICES.draw]: 0,
                [BET_CHOICES.away]: 0,
                [BET_CHOICES.homeLive]: 0,
                [BET_CHOICES.drawLive]: 0,
                [BET_CHOICES.awayLive]: 0,
            });
        });

        it("should handle missing bet choices correctly", () => {
            // Arrange
            const playerBetCount = {
                [BET_CHOICES.home]: ["user1"],
                [BET_CHOICES.homeLive]: ["user2", "user3"],
            };

            // Act
            const result = betPercentage.getUserBetPercentage(playerBetCount);

            // Assert
            expect(result).toEqual({
                [BET_CHOICES.home]: 33,
                [BET_CHOICES.draw]: 0,
                [BET_CHOICES.away]: 0,
                [BET_CHOICES.homeLive]: 67,
                [BET_CHOICES.drawLive]: 0,
                [BET_CHOICES.awayLive]: 0,
            });
        });
    });
});
