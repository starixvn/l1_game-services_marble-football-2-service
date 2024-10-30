import { GameDefinition as BaseGameDefinition } from "sc-game-base/src/core";
import { Duration } from "sc-game-base/src/core/game-definition";
export default class GameDefinition extends BaseGameDefinition {
    declare durations: Duration;
    constructor(gameSettings: GameSettings, generateResult: Function, settle: Function, generateRawResultForHash: Function) {
        super(gameSettings, generateResult, settle, generateRawResultForHash);
    }
}

export type GameSettings = {
    id: number;
    name: string;
    configName: string;
    durations: Duration;
    provablyFair?: boolean;
    choices: string[];
    choicesMapper: any;
    hedgeBetGroups: any[];
    numberOfRoundHistory: number;
    historyPageSize: number;
};
