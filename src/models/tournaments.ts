import mongoose from "mongoose";

export type MatchType = {
    home: string;
    away: string;
};

export interface ITournaments {
    code: string;
    matches: MatchType[];
    currentMatch: number;
    ended: boolean;
    time: Date;
}

const Schema = new mongoose.Schema<ITournaments>({
    code: { type: String, required: true },
    matches: { type: [Object], required: true },
    currentMatch: { type: Number, default: 0 },
    ended: { type: Boolean, default: false },
    time: { type: Date, default: () => new Date() },
});

const Tournament = mongoose.model("marblefootball_tournaments", Schema);

export default Tournament;
