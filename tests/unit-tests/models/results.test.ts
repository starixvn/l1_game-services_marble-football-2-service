import { results } from "../../../src/models";
import { mongo } from "mongoose";

describe("Results", () => {
    describe("when create the new instance of Results", () => {
        it("should create a result with default properties", () => {
            // Arrange
            const mockId = new mongo.ObjectId("672452f978c8cd0e08122643");
            const today = new Date("2024-01-01");

            jest.useFakeTimers().setSystemTime(today);

            const expected = {
                _id: mockId,
                time: today,
            };

            // Act
            const actual = new results({ _id: "672452f978c8cd0e08122643" });

            // Assert
            expect(actual.toObject()).toStrictEqual(expected);
        });

        it("should verify the required properties", () => {
            // Arrange
            const actual = new results({});

            // Act
            const error = actual.validateSync() as any;

            // Assert
            expect(error.message).toBe(`marblefootball_results validation failed: roundId: Path \`roundId\` is required.`);
        });
    });
});
