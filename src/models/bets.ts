import mongoose from "mongoose";
import { IS_DEV_ENV } from "../constants";

const modelName = IS_DEV_ENV ? "marblefootball_dev_bets" : "marblefootball_bets";
const tmpModelName = IS_DEV_ENV ? "marblefootball_dev_tmpbets" : "marblefootball_tmpbets";

const bet = {
    roundId: { type: Number, required: true },
    uid: { type: String, required: true },
    name: { type: String, required: true },
    betwin: { type: Number, default: 0 },
    time: { type: Date },
    totalAmount: { type: Number, default: 0 },
    odds: { type: Object },
    siteId: { type: String },
    freeBet: { type: Boolean, default: false },
    playerId: { type: String },
    operatorId: { type: String, required: false },
    currency: { type: String, required: false },
    rate: { type: Number, required: false },
    paid: { type: Boolean, default: false },
};

const bets = mongoose.model(
    modelName,
    new mongoose.Schema({
        ...bet,
        currency: { type: String },
        rate: { type: Number, required: true },
    })
);

const tmpBets = mongoose.model(tmpModelName, new mongoose.Schema(bet));

export { bets, tmpBets };
