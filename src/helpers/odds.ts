import { GameData } from "sc-game-base/src/core";
import { OddsType } from "../match-configs";

export type GenerateOddsOptions = {
    gameData: GameData;
};

export function generateOdds(options?: GenerateOddsOptions): OddsType {
    return {
        firstHalfAway: 1.4,
        firstHalfDraw: 1.4,
        firstHalfDraw4: 1.4,
        firstHalfEven: 1.4,
        firstHalfHome: 1.4,
        firstHalfOdd: 1.4,
        firstHalfOver: 1.4,
        firstHalfUnder: 1.4,
        secondHalfAway: 1.6,
        secondHalfDraw: 1.6,
        secondHalfDraw4: 1.6,
        secondHalfEven: 1.6,
        secondHalfHome: 1.6,
        secondHalfOdd: 1.6,
        secondHalfOver: 1.6,
        secondHalfUnder: 1.6,
    };
}
