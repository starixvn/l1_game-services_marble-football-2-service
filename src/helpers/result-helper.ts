import { MatchConfigType } from "../game-data";
import { HalfConfigType } from "../match-configs";
import { ResultType, SettlementResultType } from "../models/rounds";
import Chance from "chance";
import { shuffle } from "./shuffle";

export const generateResult = (matchConfig: MatchConfigType): ResultType => {
    const chance = new Chance();

    const firstHalf = generateResultForHalf(matchConfig.firstHalf);
    const secondHalf = generateResultForHalf(matchConfig.secondHalf);
    const videoInfo = getVideoInfoFromResult(firstHalf, secondHalf);
    const homeWinsOnDraw = chance.bool();

    return {
        firstHalf,
        secondHalf,
        ...videoInfo,
        overUnderValue: matchConfig.ou,
        firstHalfOverUnderValue: matchConfig.firstHalf.ou,
        homeWinsOnDraw,
    };
};

export const getSettlementResult = (roundResult: ResultType): SettlementResultType => {
    const { firstHalf, secondHalf } = roundResult;

    const firstHalfHomeGoals = firstHalf.split("H").length - 1;
    const firstHalfAwayGoals = firstHalf.split("A").length - 1;

    const secondHalfHomeGoals = secondHalf.split("H").length - 1;
    const secondHalfAwayGoals = secondHalf.split("A").length - 1;

    const homeGoals = firstHalfHomeGoals + secondHalfHomeGoals;
    const awayGoals = firstHalfAwayGoals + secondHalfAwayGoals;

    const isOver = homeGoals + awayGoals > roundResult.overUnderValue;
    const isFirstHalfOver = firstHalfHomeGoals + firstHalfAwayGoals > roundResult.firstHalfOverUnderValue;

    return {
        home: homeGoals > awayGoals,
        away: awayGoals > homeGoals,
        draw: homeGoals === awayGoals,
        over: isOver,
        under: !isOver,
        firstHalfHome: firstHalfHomeGoals > firstHalfAwayGoals,
        firstHalfAway: firstHalfAwayGoals > firstHalfHomeGoals,
        firstHalfDraw: firstHalfHomeGoals === firstHalfAwayGoals,
        firstHalfOver: isFirstHalfOver,
        firstHalfUnder: !isFirstHalfOver,
    };
};

export const generateRawResultForHash = () => {};

const generateResultForHalf = (halfConfig: HalfConfigType) => {
    const scores = Object.keys(halfConfig.scoreRate);
    const rates = Object.values(halfConfig.scoreRate);

    const scoreResult = getScoreFromRate(scores, rates);

    const [homeGoals, awayGoals] = scoreResult.split("-").map(Number);
    const sequence = Array(homeGoals).fill("H").concat(Array(awayGoals).fill("A"));

    const result = shuffle(sequence);

    return result.join("");
};

export const getScoreFromRate = (scores: string[], rates: number[]) => {
    const chance = new Chance();
    return chance.weighted(scores, rates);
};

const getVideoInfoFromResult = (firstHalf: string, secondHalf: string) => {
    return {
        firstHalfVideo: `http://marble-football/watch?v=${firstHalf}`,
        secondHalfVideo: `http://marble-football/watch?v=${secondHalf}`,
        firstHalfTimeline: [] as number[],
        secondHalfTimeline: [] as number[],
    };
};
