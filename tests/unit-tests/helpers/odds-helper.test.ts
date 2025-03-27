import {
    parseScore,
    roundToPrecision,
    calculateFullTimeScoreRates,
    calculateProbabilitiesForBetChoices,
    calculateBetOdds,
    probabilityToBetOdds,
    calculateDrawOdds,
    calculatePreMatchOdds,
    calculateLiveOdds,
} from "../../../src/helpers/odds-helper";
import { HalfConfigType, MatchConfigType } from "../../../src/match-configs";

describe("odds-helper", () => {
    describe("parseScore", () => {
        it("should correctly parse score string into numbers", () => {
            expect(parseScore("2-1")).toEqual([2, 1]);
            expect(parseScore("0-0")).toEqual([0, 0]);
            expect(parseScore("5-3")).toEqual([5, 3]);
        });
    });

    describe("roundToPrecision", () => {
        it("should round numbers to specified precision", () => {
            expect(roundToPrecision(1.23456789)).toBe(1.23456);
            expect(roundToPrecision(2.5)).toBe(2.5);
            expect(roundToPrecision(3.14159, 1000)).toBe(3.141);
        });
    });

    describe("calculateFullTimeScoreRates", () => {
        const mockFirstHalf: HalfConfigType = {
            scoreRate: {
                "1-0": 0.5,
                "0-1": 0.5,
            },
        };

        const mockSecondHalf: HalfConfigType = {
            scoreRate: {
                "1-0": 0.5,
                "0-1": 0.5,
            },
        };

        it("should correctly combine first and second half scores", () => {
            const result = calculateFullTimeScoreRates(mockFirstHalf, mockSecondHalf);
            expect(result["2-0"]).toBe(0.25);
            expect(result["1-1"]).toBe(0.5);
            expect(result["0-2"]).toBe(0.25);
        });
    });

    describe("calculateProbabilitiesForBetChoices", () => {
        const mockScoreRates = {
            "1-0": 0.4,
            "0-1": 0.3,
            "1-1": 0.2,
            "3-3": 0.1,
        };

        it("should calculate correct probabilities for all bet choices", () => {
            const result = calculateProbabilitiesForBetChoices(mockScoreRates);
            const { probabilities } = result;

            expect(probabilities.home).toBeCloseTo(0.4);
            expect(probabilities.away).toBeCloseTo(0.3);
            expect(probabilities.draw).toBeCloseTo(0.3);
            expect(probabilities.draw4).toBeCloseTo(0);
            expect(probabilities.over).toBeCloseTo(0.1);
            expect(probabilities.under).toBeCloseTo(0.9);
            expect(probabilities.even).toBeCloseTo(0.3);
            expect(probabilities.odd).toBeCloseTo(0.7);
        });

        it("should handle adding score correctly", () => {
            const result = calculateProbabilitiesForBetChoices(mockScoreRates, "1-1");
            const { probabilities } = result;

            expect(probabilities.home).toBeCloseTo(0.4);
            expect(probabilities.away).toBeCloseTo(0.3);
            expect(probabilities.draw).toBeCloseTo(0.3);
            expect(probabilities.draw4).toBeCloseTo(0.1);
        });
    });

    describe("probabilityToBetOdds", () => {
        it("should convert probability to betting odds correctly", () => {
            expect(probabilityToBetOdds(0.5)).toBe(2);
            expect(probabilityToBetOdds(0.25)).toBe(4);
            expect(probabilityToBetOdds(0.1)).toBe(10);
        });

        it("should apply margin correctly", () => {
            expect(probabilityToBetOdds(0.5, 0.1)).toBe(1.8);
        });

        it("should floor odds above 20", () => {
            expect(probabilityToBetOdds(0.04)).toBe(25);
        });
    });

    describe("calculateBetOdds", () => {
        const mockProbabilities = {
            home: 0.5,
            away: 0.3,
            draw: 0.2,
            draw4: 0,
            over: 0.5,
            under: 0.5,
            even: 0.5,
            odd: 0.5,
        };

        it("should calculate betting odds correctly", () => {
            const result = calculateBetOdds(mockProbabilities);

            expect(result.home).toBeDefined();
            expect(result.away).toBeDefined();
            expect(result.draw).toBeDefined();
            expect(result.over).toBeDefined();
            expect(result.under).toBeDefined();
            expect(result.even).toBeDefined();
            expect(result.odd).toBeDefined();
        });

        it("should apply margins correctly", () => {
            const margins = [{ max: 2, home: 0.1, away: 0.1 }];
            const result = calculateBetOdds(mockProbabilities, margins);

            expect(result.home).toBeLessThan(2);
            expect(result.away).toBeLessThan(3.33);
        });
    });

    describe("calculateDrawOdds", () => {
        const mockProbabilities = {
            draw: 0.21,
            draw4: 0.01,
        };

        it("should calculate draw odds correctly", () => {
            const result = calculateDrawOdds(mockProbabilities);
            expect(result).toBeCloseTo(2.4);
        });
    });

    describe("calculatePreMatchOdds", () => {
        const mockMatchConfig: MatchConfigType = {
            firstHalfConfig: {
                scoreRate: {
                    "1-0": 0.5,
                    "0-1": 0.5,
                },
            },
            secondHalfConfig: {
                scoreRate: {
                    "1-0": 0.5,
                    "0-1": 0.5,
                },
            },
        };

        it("should return odds for all bet choices", () => {
            const result = calculatePreMatchOdds(mockMatchConfig);

            expect(result.home).toBeDefined();
            expect(result.away).toBeDefined();
            expect(result.draw).toBeDefined();
            expect(result.over).toBeDefined();
            expect(result.under).toBeDefined();
            expect(result.even).toBeDefined();
            expect(result.odd).toBeDefined();
        });
    });

    describe("calculateLiveOdds", () => {
        const mockHalfConfig: HalfConfigType = {
            scoreRate: {
                "1-0": 0.5,
                "0-1": 0.5,
            },
        };

        it("should return odds for all bet choices", () => {
            const result = calculateLiveOdds(mockHalfConfig, [], "1-0");

            expect(result.home).toBeDefined();
            expect(result.away).toBeDefined();
            expect(result.draw).toBeDefined();
            expect(result.over).toBeDefined();
            expect(result.under).toBeDefined();
            expect(result.even).toBeDefined();
            expect(result.odd).toBeDefined();
        });
    });
});
