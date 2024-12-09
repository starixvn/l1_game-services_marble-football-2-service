import {
    generateResult,
    generateResultFromAdminRawResult,
    getSettlementResult,
    getScoreFromRate,
    generateVideoName,
} from "../../../src/helpers/result-helper";
import { MatchConfigType } from "../../../src/match-configs";
import { ResultType } from "../../../src/models/rounds";

jest.mock("chance", () => {
    return function () {
        return {
            integer: jest.fn().mockReturnValue(1),
            bool: jest.fn().mockReturnValue(true),
            weighted: jest.fn().mockImplementation((arr) => arr[0]),
        };
    };
});

jest.mock("../../../src/helpers/shuffle", () => ({
    shuffle: jest.fn((array) => array),
}));

describe("Result Helper", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("generateResult", () => {
        it("should generate a result based on match configuration", () => {
            // Arrange
            const matchConfig: MatchConfigType = {
                firstHalf: {
                    scoreRate: { "1-0": 1, "0-1": 1 },
                    ou: 1.5,
                } as any,

                secondHalf: {
                    scoreRate: { "1-0": 1, "0-1": 1 },
                } as any,

                ou: 2.5,
            };

            jest.spyOn(require("../../../src/helpers/result-helper"), "getScoreFromRate")
                .mockReturnValueOnce("1-0")
                .mockReturnValueOnce("0-0");

            // Act
            const result = generateResult(matchConfig);

            // Assert
            expect(result.firstHalf).toBe("H");
            expect(result.secondHalf).toBe("0");
            expect(result.overUnderValue).toBe(2.5);
            expect(result.homeWinsOnDraw).toBe(true);
            expect(result.firstHalfVideo).toBeDefined();
            expect(result.secondHalfVideo).toBeDefined();
            expect(result.penalty).toStrictEqual({ home: 2, away: 1 });
        });
    });

    describe("getSettlementResult", () => {
        it("should calculate settlement result based on round result", () => {
            const roundResult: ResultType = {
                firstHalf: "HH",
                secondHalf: "AA",
                overUnderValue: 3.5,
                firstHalfVideo: "http://marble-football/watch?v=HH",
                secondHalfVideo: "http://marble-football/watch?v=AA",
                homeWinsOnDraw: false,
                penalty: { home: 0, away: 0 },
            };

            const settlementResult = getSettlementResult(roundResult);

            expect(settlementResult.home).toBe(false);
            expect(settlementResult.away).toBe(false);
            expect(settlementResult.draw).toBe(true);
            expect(settlementResult.over).toBe(true);
            expect(settlementResult.under).toBe(false);
            expect(settlementResult.odd).toBe(false);
            expect(settlementResult.even).toBe(true);
        });
    });

    describe("generateResultFromAdminRawResult", () => {
        it("should generate a result from admin raw result", () => {
            const matchConfig: MatchConfigType = {
                firstHalf: {
                    scoreRate: { "1-0": 1, "0-1": 1 },
                    ou: 1.5,
                } as any,

                secondHalf: {
                    scoreRate: { "1-0": 1, "0-1": 1 },
                } as any,

                ou: 2.5,
            };

            const roundResult = {
                firstHalf: "HAAA",
                secondHalf: "AHHH",
                homeWinsOnDraw: false,
            } as ResultType;

            const result = generateResultFromAdminRawResult(matchConfig, roundResult);

            expect(result.firstHalf).toBe("HAAA");
            expect(result.secondHalf).toBe("AHHH");
            expect(result.overUnderValue).toBe(2.5);
        });
    });

    describe("getScoreFromRate", () => {
        it("should return a score based on rate", () => {
            const scores = ["1-0", "0-1", "2-0"];
            const rates = [0, 0, 1];

            const score = getScoreFromRate(scores, rates);

            expect(score).toBe("1-0");
        });
    });

    describe("generateVideoName", () => {
        it("should generate a video name based on result", () => {
            // Arrange
            const result = "HAA";

            // Act
            const videoName = generateVideoName(result);

            // Assert
            expect(videoName).toBe("ab4e46235565c9b63b6c1dae2367a318e6c2605a8645ca575cf0063417d23db3");
        });
    });
});
