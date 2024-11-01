import { betLogs } from "../../../src/models";
import mongoose from "mongoose";

describe("Bet Logs", () => {
    describe("when create the new instance of BetLogs", () => {
        it("should create a bet log with default properties", () => {
            // Arrange
            const mockId = new mongoose.Types.ObjectId();

            const expected = {
                _id: mockId,
                amount: 0,
                rebet: false,
                roundId: 0,
            };

            // Act
            const actual = new betLogs({ _id: mockId.toHexString() });

            // Assert
            expect(actual.toObject()).toStrictEqual(expected);
        });

        it("should verify the required properties", () => {
            // Arrange
            const actual = new betLogs({});

            // Act
            const error = actual.validateSync() as any;

            // Assert
            expect(error.message).toBe(
                `marblefootball_betlogs validation failed: operatorId: Path \`operatorId\` is required., rate: Path \`rate\` is required., currency: Path \`currency\` is required., name: Path \`name\` is required., uid: Path \`uid\` is required.`
            );
        });
    });
});
