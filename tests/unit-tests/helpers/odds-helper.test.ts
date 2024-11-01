import { MatchConfigType } from "../../../src/game-data";
import { HalfConfigType } from "../../../src/match-configs";
import { oddsHelper } from "../../../src/helpers";

describe("odds helper", () => {
    describe("oddsHelper.parseScore", () => {
        it("should parse a score string into two numbers", () => {
            // Arrange
            const scores = ["2-1", "0-0", "3-2"];

            // Act
            const results = scores.map((score) => oddsHelper.parseScore(score));

            // Assert
            expect(results[0]).toEqual([2, 1]);
            expect(results[1]).toEqual([0, 0]);
            expect(results[2]).toEqual([3, 2]);
        });
    });

    describe("oddsHelper.roundToPrecision", () => {
        it("should round a number to a specified precision", () => {
            // Arrange
            const numbers = [1.123456, 1.987654];
            const precisions = [100, 1000];

            // Act & Assert
            expect(oddsHelper.roundToPrecision(numbers[0], precisions[0])).toBeCloseTo(1.12);
            expect(oddsHelper.roundToPrecision(numbers[1], precisions[1])).toBeCloseTo(1.988);
        });
    });

    describe("oddsHelper.calculateFullTimeScoreRates", () => {
        it("should calculate the combined score rates for full-time results", () => {
            // Arrange
            const firstHalf: HalfConfigType = {
                scoreRate: { "1-0": 0.1, "0-1": 0.1 },
                odds: { home: 1.9, draw: 3.5, away: 4.0, over: 2.0, under: 1.8 },
                ou: 2.5,
            };

            const secondHalf: HalfConfigType = {
                scoreRate: { "1-0": 0.2, "0-1": 0.3 },
                odds: { home: 2.0, draw: 3.4, away: 3.8, over: 2.1, under: 1.9 },
                ou: 2.5,
            };

            // Act
            const result = oddsHelper.calculateFullTimeScoreRates(firstHalf, secondHalf);

            // Assert
            expect(result["2-0"]).toBeCloseTo(0.02, 5);
            expect(result["1-1"]).toBeCloseTo(0.05, 5);
            expect(result["0-2"]).toBeCloseTo(0.03, 5);
        });
    });

    describe("oddsHelper.calculateProbabilitiesForBetChoices", () => {
        it("should calculate probabilities for bet choices", () => {
            // Arrange
            const scoreRates = {
                "2-0": 0.15,
                "1-1": 0.25,
                "0-2": 0.1,
            };

            // Act
            const result = oddsHelper.calculateProbabilitiesForBetChoices(scoreRates);

            // Assert
            expect(result.probabilities.home).toBeCloseTo(0.3);
            expect(result.probabilities.draw).toBeCloseTo(0.5);
            expect(result.probabilities.away).toBeCloseTo(0.2);
            expect(result.ou).toBeGreaterThan(0);
        });
    });

    describe("oddsHelper.calculateOddsFromProb", () => {
        it("should calculate odds from a given probability with a margin", () => {
            // Arrange
            const probabilities = [0.5, 0.3];
            const margins = [0.05, 0.1];

            // Act & Assert
            expect(oddsHelper.calculateOddsFromProb(probabilities[0], margins[0])).toBeCloseTo(1.9);
            expect(oddsHelper.calculateOddsFromProb(probabilities[1], margins[1])).toBeCloseTo(3.0);
        });
    });

    describe("oddsHelper.calculateOdds", () => {
        it("should calculate odds and over/under for a match", () => {
            // Arrange
            const matchConfig: MatchConfigType = {
                firstHalf: {
                    scoreRate: { "1-0": 0.1, "0-1": 0.2 },
                    odds: { home: 2.5, draw: 3.1, away: 2.9, over: 2.2, under: 1.75 },
                    ou: 2.5,
                },
                secondHalf: {
                    scoreRate: { "1-1": 0.3, "0-2": 0.1 },
                    odds: { home: 2.7, draw: 3.4, away: 2.6, over: 2.3, under: 1.8 },
                    ou: 2.5,
                },
                ou: 2.5,
            };
            const margin = 0.05;

            // Act
            const result = oddsHelper.calculateOdds(matchConfig, margin);

            // Assert
            expect(result.odds.home).toBeGreaterThan(0);
            expect(result.odds.away).toBeGreaterThan(0);
            expect(result.odds.draw).toBeGreaterThan(0);
            expect(result.ou).toBeGreaterThan(0);
        });
    });
});
