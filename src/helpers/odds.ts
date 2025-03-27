import { GameData } from "sc-game-base/src/core";
import { OddsType } from "../match-configs";
import { FIRST_HALF_ODDS_TYPE, SECOND_HALF_ODDS_TYPE } from "../constants";

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

export function omitOddsBasedOnHalf(target: Record<string, any>, isFirstHalf: boolean) {
    if (isFirstHalf) {
        return omitOdds(target, Object.keys(SECOND_HALF_ODDS_TYPE));
    }

    return omitOdds(target, Object.keys(FIRST_HALF_ODDS_TYPE));
}

function omitOdds(target: Record<string, any>, oddTypes: string[] = []) {
    return Object.fromEntries(Object.entries(target).filter(([key]) => !oddTypes.includes(key)));
}
