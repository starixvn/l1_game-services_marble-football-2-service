import { Duration } from "../../../src/game-definition";
import {
    isFirstHalfOddsActive,
    isWithinBettingTime,
    isWithinFirstHalfBettingTime,
    isWithinSecondHalfBettingTime,
} from "../../../src/helpers/game-timing";

describe("Game Timing Helpers", () => {
    // Arrange
    const mockDurations: Duration = {
        placingBets: 300,
        lockingBet: 60,
        wholeRound: 1800,
        placingBetsFirstHalf: 300,
        lockingBetFirstHalf: 60,
        startingRound: 1800,
        streamingVideoFirstHalf: 120,
        placingBetsSecondHalf: 300,
        lockingBetSecondHalf: 60,
        streamingVideoSecondHalf: 120,
    };

    describe("isFirstHalfOddsActive", () => {
        it("should return true when remaining time is greater than placingBetsSecondHalf", () => {
            // Arrange
            const remainingTime = 301;

            // Act
            const result = isFirstHalfOddsActive(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false when remaining time equals placingBetsSecondHalf", () => {
            // Arrange
            const remainingTime = 300;

            // Act
            const result = isFirstHalfOddsActive(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false when remaining time is less than placingBetsSecondHalf", () => {
            // Arrange
            const remainingTime = 299;

            // Act
            const result = isFirstHalfOddsActive(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("isWithinBettingTime", () => {
        it("should return true during first half betting window", () => {
            // Arrange
            const remainingTime = 200;

            // Act
            const result = isWithinBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return true during second half betting window", () => {
            // Arrange
            const remainingTime = 200;

            // Act
            const result = isWithinBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false before first half betting window", () => {
            // Arrange
            const remainingTime = 301;

            // Act
            const result = isWithinBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false after first half betting window", () => {
            // Arrange
            const remainingTime = 59;

            // Act
            const result = isWithinBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return true at exact boundary of first half betting window (locking time)", () => {
            // Arrange
            const remainingTime = 60;

            // Act
            const result = isWithinBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });
    });

    describe("isWithinFirstHalfBettingTime", () => {
        it("should return true within first half betting window", () => {
            // Arrange
            const remainingTime = 200;

            // Act
            const result = isWithinFirstHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false at upper boundary", () => {
            // Arrange
            const remainingTime = 300;

            // Act
            const result = isWithinFirstHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return true at lower boundary (locking time)", () => {
            // Arrange
            const remainingTime = 60;

            // Act
            const result = isWithinFirstHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false above upper boundary", () => {
            // Arrange
            const remainingTime = 301;

            // Act
            const result = isWithinFirstHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false below lower boundary", () => {
            // Arrange
            const remainingTime = 59;

            // Act
            const result = isWithinFirstHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });
    });

    describe("isWithinSecondHalfBettingTime", () => {
        it("should return true within second half betting window", () => {
            // Arrange
            const remainingTime = 200;

            // Act
            const result = isWithinSecondHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false at upper boundary", () => {
            // Arrange
            const remainingTime = 300;

            // Act
            const result = isWithinSecondHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return true at lower boundary (locking time)", () => {
            // Arrange
            const remainingTime = 60;

            // Act
            const result = isWithinSecondHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(true);
        });

        it("should return false above upper boundary", () => {
            // Arrange
            const remainingTime = 301;

            // Act
            const result = isWithinSecondHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });

        it("should return false below lower boundary", () => {
            // Arrange
            const remainingTime = 59;

            // Act
            const result = isWithinSecondHalfBettingTime(remainingTime, mockDurations);

            // Assert
            expect(result).toBe(false);
        });
    });
});
