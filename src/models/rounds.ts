import mongoose, { Schema } from "mongoose";
import { BET_CHOICES } from "../constants";

export type ResultType = {
    firstHalf: string;
    secondHalf: string;
    firstHalfVideo: string;
    secondHalfVideo: string;
    firstHalfTimeline: number[];
    secondHalfTimeline: number[];
    overUnderValue: number;
    firstHalfOverUnderValue: number;
};

const resultSchema = new mongoose.Schema<ResultType>(
    {
        firstHalf: { type: String },
        secondHalf: { type: String },
        firstHalfVideo: { type: String },
        secondHalfVideo: { type: String },
        firstHalfTimeline: { type: [Number] },
        secondHalfTimeline: { type: [Number] },
        overUnderValue: { type: Number },
        firstHalfOverUnderValue: { type: Number },
    },
    { _id: false }
);

export type SettlementResultType = {
    [key in keyof typeof BET_CHOICES]: boolean;
};

const settlementResultSchema = new mongoose.Schema<SettlementResultType>(
    {
        home: { type: Boolean },
        away: { type: Boolean },
        draw: { type: Boolean },
        over: { type: Boolean },
        under: { type: Boolean },
        firstHalfHome: { type: Boolean },
        firstHalfAway: { type: Boolean },
        firstHalfDraw: { type: Boolean },
        firstHalfOver: { type: Boolean },
        firstHalfUnder: { type: Boolean },
    },
    { _id: false }
);

export interface IRound {
    id: number;
    result: ResultType;
    settlementResult: SettlementResultType;
    time: Date;
    exchangeRateId: number;
}

const RoundSchema = new mongoose.Schema<IRound>({
    id: { type: Number, required: true },
    result: resultSchema,
    settlementResult: settlementResultSchema,
    time: { type: Schema.Types.Date, default: () => new Date() },
    exchangeRateId: { type: Number, required: true },
});

const Round = mongoose.model("marblefootball_rounds", RoundSchema);

export default Round;
