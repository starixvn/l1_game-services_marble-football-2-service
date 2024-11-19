import {
    generateResult,
    generateResultFromAdminRawResult,
    getSettlementResult,
    getScoreFromRate,
} from "../../../src/helpers/result-helper";
import { MatchConfigType } from "../../../src/game-data";
import { ResultType } from "../../../src/models/rounds";

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
                .mockReturnValueOnce("1-0") // For the first half
                .mockReturnValueOnce("0-1"); // For the second half

            // Act
            const result = generateResult(matchConfig);

            // Assert
            expect(result.firstHalf).toBe("H");
            expect(result.secondHalf).toBe("A");
            expect(result.overUnderValue).toBe(2.5);
            expect(result.firstHalfVideo).toBe("http://marble-football/watch?v=H");
            expect(result.secondHalfVideo).toBe("http://marble-football/watch?v=A");
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
                firstHalfTimeline: [],
                secondHalfTimeline: [],
                homeWinsOnDraw: false,
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
            expect(result.firstHalfVideo).toBe("http://marble-football/watch?v=HAAA");
            expect(result.secondHalfVideo).toBe("http://marble-football/watch?v=AHHH");
        });
    });

    describe("getScoreFromRate", () => {
        it("should return a score based on rate", () => {
            const scores = ["1-0", "0-1", "2-0"];
            const rates = [0, 0, 1];

            const score = getScoreFromRate(scores, rates);

            expect(score).toBe("2-0");
        });
    });
});
