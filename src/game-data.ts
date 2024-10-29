import { TableGameData } from "sc-game-base/src/table";

export default class GameData extends TableGameData {
    declare realPlayers: { [playerId: string]: RealPlayer };
}

export type RealPlayer = {
    UID: string;
    profile: { name: string; minBet: number; maxBet: number };
    session: any;
    socketClient: any;
};
