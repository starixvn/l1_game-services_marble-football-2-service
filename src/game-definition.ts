import { TableGameDefinition } from "sc-game-base/src/table";
import { Duration as BaseDuration } from "sc-game-base/src/core/game-definition";
export default class GameDefinition extends TableGameDefinition {
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

export type SoccerDuration = {
    startingRound: number;
    streamingVideo: number;
    placingBetSecondHalf: number;
    lockingBetSecondHalf: number;
    streamingVideoSecondHalf: number;
}

export type Duration = BaseDuration & SoccerDuration;
