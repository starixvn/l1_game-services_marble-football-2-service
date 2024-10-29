import { TableGameData } from "sc-game-base/src/table";

export default class GameData extends TableGameData {
    declare realPlayers: { [playerId: string]: RealPlayer };

    constructor(remainingTime: number) {
        super(remainingTime);
        this.playerBetCount = {};
    }
    playerBetCount: Record<string, string[]> = {};
    match: Match = { home: "", away: "", startTime: "" };
}

export type RealPlayer = {
    UID: string;
    profile: { name: string; minBet: number; maxBet: number };
    session: any;
    socketClient: any;
};

export type Match = {
    home: string;
    away: string;
    startTime: string;
};
