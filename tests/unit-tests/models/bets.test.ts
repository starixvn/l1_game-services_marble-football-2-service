import { bets } from "../../../src/models";
import { mongo } from "mongoose";

describe("Bets", () => {
    describe("when create the new instance of Bet", () => {
        it("should create a bet with default properties", () => {
            // Arrange
            const mockId = new mongo.ObjectId("672452f978c8cd0e08122643");

            const expected = {
                _id: mockId,
                betwin: 0,
                freeBet: false,
                paid: false,
                totalAmount: 0,
            };

            // Act
            const actual = new bets({ _id: "672452f978c8cd0e08122643" });

            // Assert
            expect(actual.toObject()).toStrictEqual(expected);
        });

        it("should verify the required properties", () => {
            // Arrange
            const actual = new bets({});

            // Act
            const error = actual.validateSync() as any;

            // Assert
            expect(error.message).toBe(
                `marblefootball_bets validation failed: rate: Path \`rate\` is required., name: Path \`name\` is required., uid: Path \`uid\` is required., roundId: Path \`roundId\` is required.`
            );
        });
    });
});
