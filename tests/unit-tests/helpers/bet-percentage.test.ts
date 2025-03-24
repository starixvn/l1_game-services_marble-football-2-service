import { betPercentage } from "../../../src/helpers";
import { BET_CHOICES } from "../../../src/constants";

describe("betPercentage", () => {
    describe("calculateUserBetPercentage", () => {
        const betChoices = ["firstHalfHome", "firstHalfDraw", "firstHalfAway"];

        it("should calculate the correct percentages for each choice of specific choices", () => {
            // Arrange
            const playerBetCount = {
                [BET_CHOICES.firstHalfHome]: ["player1", "player2"],
                [BET_CHOICES.firstHalfAway]: ["player3"],
                [BET_CHOICES.firstHalfOver]: ["player4"],
                [BET_CHOICES.firstHalfUnder]: ["player5"],
            };

            // Act
            const result = betPercentage.calculatePlayerBetPercentage(playerBetCount, betChoices);

            // Assert
            expect(result[BET_CHOICES.firstHalfHome]).toBe(67);
            expect(result[BET_CHOICES.firstHalfDraw]).toBe(0);
            expect(result[BET_CHOICES.firstHalfAway]).toBe(33);
        });

        it("should handle empty playerBetCount", () => {
            // Arrange
            const playerBetCount = {};

            // Act
            const result = betPercentage.calculatePlayerBetPercentage(playerBetCount, betChoices);

            // Assert
            expect(result).toEqual({
                firstHalfHome: 0,
                firstHalfDraw: 0,
                firstHalfAway: 0,
            });
        });

        it("should handle zero total bets", () => {
            // Arrange
            const playerBetCount = {
                [BET_CHOICES.firstHalfHome]: [],
                [BET_CHOICES.firstHalfAway]: [],
            };

            // Act
            const result = betPercentage.calculatePlayerBetPercentage(playerBetCount, betChoices);

            // Assert
            expect(result[BET_CHOICES.firstHalfHome]).toBe(0);
            expect(result[BET_CHOICES.firstHalfAway]).toBe(0);
            expect(result[BET_CHOICES.firstHalfDraw]).toBe(0);
        });
    });

    describe("getUserBetPercentage", () => {
        it("should calculate percentages using default bet choices", () => {
            // Arrange
            const playerBetCount = {
                firstHalfHome: ["user1", "user2"],
                firstHalfDraw: ["user3"],
                firstHalfAway: ["user4", "user5", "user6"],
                secondHalfHome: ["user7"],
                secondHalfDraw: ["user8", "user9"],
                secondHalfAway: ["user10", "user11", "user12"],
            };

            // Act
            const result = betPercentage.getUserBetPercentage(playerBetCount);

            // Assert
            expect(result).toEqual({
                firstHalfHome: 17,
                firstHalfDraw: 8,
                firstHalfAway: 25,
                secondHalfHome: 8,
                secondHalfDraw: 17,
                secondHalfAway: 25,
            });
        });

        it("should handle empty playerBetCount correctly", () => {
            // Arrange
            const playerBetCount = {};

            // Act
            const result = betPercentage.getUserBetPercentage(playerBetCount);

            // Assert
            expect(result).toEqual({
                firstHalfHome: 0,
                firstHalfDraw: 0,
                firstHalfAway: 0,
                secondHalfHome: 0,
                secondHalfDraw: 0,
                secondHalfAway: 0,
            });
        });

        it("should handle missing bet choices correctly", () => {
            // Arrange
            const playerBetCount = {
                firstHalfHome: ["user1"],
                secondHalfHome: ["user2", "user3"],
            };

            // Act
            const result = betPercentage.getUserBetPercentage(playerBetCount);

            // Assert
            expect(result).toEqual({
                firstHalfHome: 33,
                firstHalfDraw: 0,
                firstHalfAway: 0,
                secondHalfHome: 67,
                secondHalfDraw: 0,
                secondHalfAway: 0,
            });
        });
    });
});
