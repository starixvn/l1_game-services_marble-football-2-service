import { betPercentage } from "../../../src/helpers";
import { BET_CHOICES } from "../../../src/constants";

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
            home: 0,
            draw: 0,
            away: 0,
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
