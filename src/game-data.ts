import { HalfConfigType } from "./match-configs";
import { TableGameData } from "sc-game-base/src/table";

export default class GameData extends TableGameData {
    declare realPlayers: { [playerId: string]: RealPlayer };

    constructor(remainingTime: number) {
        super(remainingTime);
        this.playerBetCount = {};
    }
    playerBetCount: Record<string, string[]> = {};
    matchConfig: MatchConfigType = {} as MatchConfigType;
}

export type RealPlayer = {
    UID: string;
    profile: { name: string; minBet: number; maxBet: number };
    session: any;
    socketClient: any;
};

export type MatchConfigType = {
    firstHalf: HalfConfigType;
    secondHalf: HalfConfigType;
    ou: number;
};
