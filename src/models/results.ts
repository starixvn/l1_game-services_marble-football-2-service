import mongoose from "mongoose";

export interface IResult {
    roundId: number;
    encryptedResultHash: { iv: string; content: string };
    encryptedResult: { iv: string; content: string };
    time: Date;
}

const ResultSchema = new mongoose.Schema({
    roundId: { type: Number, required: true },
    encryptedResultHash: { iv: { type: String }, content: { type: String } },
    encryptedResult: { iv: { type: String }, content: { type: String } },
    time: { type: Date, default: () => new Date() },
});

const Result = mongoose.model("marblefootball_results", ResultSchema);

export default Result;
