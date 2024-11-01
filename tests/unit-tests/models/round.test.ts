import { rounds } from "../../../src/models";
import mongoose from "mongoose";

describe("Round", () => {
    describe("when create the new instance of Round", () => {
        it("should create a round with default properties", () => {
            // Arrange
            const mockId = new mongoose.Types.ObjectId();
            const today = new Date("2024-01-01");

            jest.useFakeTimers().setSystemTime(today);

            const expected = {
                _id: mockId,
                time: today,
            };

            // Act
            const actual = new rounds({ _id: mockId.toHexString() });

            // Assert
            expect(actual.toObject()).toStrictEqual(expected);
        });

        it("should verify the required properties", () => {
            // Arrange
            const actual = new rounds({});

            // Act
            const error = actual.validateSync();

            // Assert
            expect(error.message).toBe(
                `marblefootball_rounds validation failed: exchangeRateId: Path \`exchangeRateId\` is required., id: Path \`id\` is required.`
            );
        });
    });
});
