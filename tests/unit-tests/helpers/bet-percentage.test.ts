import { betPercentage } from "../../../src/helpers";
import { BET_CHOICES } from "../../../src/constants";

describe("roundUserBetPercentage", () => {
    it("should set both home and away to 0 if neither is provided", () => {
        const percentage = {};
        const result = betPercentage.roundUserBetPercentage(percentage);
        expect(result[BET_CHOICES.home]).toBe(0);
        expect(result[BET_CHOICES.away]).toBe(0);
    });

    it("should round home percentage and calculate away percentage", () => {
        const percentage = { [BET_CHOICES.home]: 45.67 };
        const result = betPercentage.roundUserBetPercentage(percentage);
        expect(result[BET_CHOICES.home]).toBe(45);
        expect(result[BET_CHOICES.away]).toBe(55);
    });

    it("should round away percentage and calculate home percentage", () => {
        const percentage = { [BET_CHOICES.away]: 60.89 };
        const result = betPercentage.roundUserBetPercentage(percentage);
        expect(result[BET_CHOICES.away]).toBe(60);
        expect(result[BET_CHOICES.home]).toBe(40);
    });
});

describe("calculateUserBetPercentage", () => {
    it("should calculate the correct percentages for each choice", () => {
        const playerBetCount = {
            [BET_CHOICES.home]: ["player1", "player2"],
            [BET_CHOICES.away]: ["player3"],
        };
        const result = betPercentage.calculateUserBetPercentage(playerBetCount);
        expect(result[BET_CHOICES.home]).toBe(66.67);
        expect(result[BET_CHOICES.away]).toBe(33.33);
    });

    it("should handle empty playerBetCount", () => {
        const playerBetCount = {};
        const result = betPercentage.calculateUserBetPercentage(playerBetCount);
        expect(result).toEqual({});
    });

    it("should handle zero total bets", () => {
        const playerBetCount = {
            [BET_CHOICES.home]: [],
            [BET_CHOICES.away]: [],
        };
        const result = betPercentage.calculateUserBetPercentage(playerBetCount);
        expect(result[BET_CHOICES.home]).toBeNaN();
        expect(result[BET_CHOICES.away]).toBeNaN();
    });
});
