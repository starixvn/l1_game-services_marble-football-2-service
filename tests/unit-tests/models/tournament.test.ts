import { tournament } from "../../../src/models";
import { mongo } from "mongoose";

describe("Tournament", () => {
    describe("when create the new instance of Tournament", () => {
        it("should create a tournament with default properties", () => {
            // Arrange
            const mockId = new mongo.ObjectId("672452f978c8cd0e08122643");
            const today = new Date("2024-01-01");

            jest.useFakeTimers().setSystemTime(today);

            const expected = {
                _id: mockId,
                currentMatch: 0,
                ended: false,
                matches: [],
                time: today,
                code: "code",
            };

            // Act
            const actual = new tournament({ _id: "672452f978c8cd0e08122643", code: "code" });

            // Assert
            expect(actual.toObject()).toStrictEqual(expected);
        });

        it("should verify the required properties", () => {
            // Arrange
            const actual = new tournament({});

            // Act
            const error = actual.validateSync();

            // Assert
            expect(error.message).toBe(`marblefootball_tournaments validation failed: code: Path \`code\` is required.`);
        });
    });
});
