import { HalfConfigType, MatchConfigType } from "../match-configs";
import { ResultType, SettlementResultType } from "../models/rounds";
import Chance from "chance";
import { shuffle } from "./shuffle";
import crypto from "crypto";

export const generateResult = (matchConfig: MatchConfigType): ResultType => {
    const chance = new Chance();

    const firstHalf = generateResultForHalf(matchConfig.firstHalf);
    const secondHalf = generateResultForHalf(matchConfig.secondHalf);
    const videoInfo = getVideoInfoFromResult(firstHalf, secondHalf);
    const homeWinsOnDraw = chance.bool();
    const penalty = generatePenaltyResult(homeWinsOnDraw);

    return {
        firstHalf,
        secondHalf,
        ...videoInfo,
        overUnderValue: matchConfig.ou,
        homeWinsOnDraw,
        penalty,
    };
};

export const generateResultFromAdminRawResult = (matchConfig: MatchConfigType, roundResult: ResultType): ResultType => {
    const firstHalf = roundResult.firstHalf || "0";
    const secondHalf = roundResult.secondHalf || "0";
    const videoInfo = getVideoInfoFromResult(firstHalf, secondHalf);
    const penalty = generatePenaltyResult(roundResult.homeWinsOnDraw);

    return {
        firstHalf,
        secondHalf,
        homeWinsOnDraw: roundResult.homeWinsOnDraw,
        penalty,
        ...videoInfo,
        overUnderValue: matchConfig.ou,
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
    const isOdd = (homeGoals + awayGoals) % 2 === 1;

    return {
        home: homeGoals > awayGoals,
        away: awayGoals > homeGoals,
        draw: homeGoals === awayGoals,
        over: isOver,
        under: !isOver,
        odd: isOdd,
        even: !isOdd,
    };
};

export const generateRawResultForHash = () => {};

const generateResultForHalf = (halfConfig: HalfConfigType) => {
    const scores = Object.keys(halfConfig.scoreRate);
    const rates = Object.values(halfConfig.scoreRate);

    const scoreResult = getScoreFromRate(scores, rates);

    const [homeGoals, awayGoals] = scoreResult.split("-").map(Number);
    const sequence = Array(homeGoals).fill("H").concat(Array(awayGoals).fill("A"));

    const result = shuffle(sequence).join("");

    return result || "0";
};

export const getScoreFromRate = (scores: string[], rates: number[]) => {
    const chance = new Chance();
    return chance.weighted(scores, rates);
};

const getVideoInfoFromResult = (firstHalf: string, secondHalf: string) => {
    const firstHalfVideo = generateVideoName(firstHalf);
    const secondHalfVideo = generateVideoName(secondHalf);

    return {
        firstHalfVideo,
        secondHalfVideo,
    };
};

export const generateVideoName = (result: string, numberOfVideos = 1) => {
    const videoIndex = numberOfVideos > 1 ? Math.floor(Math.random() * (numberOfVideos - 1)) - 1 : 0;

    return crypto.createHash("sha256").update(`${result}-${videoIndex}`).digest("hex");
};

const generatePenaltyResult = (homeWinsOnDraw: boolean) => {
    const chance = new Chance();
    const maxLosingPenalty = 4;
    const losingTeamPenalty = chance.integer({ min: 0, max: maxLosingPenalty });
    const difference = losingTeamPenalty === maxLosingPenalty ? 1 : chance.integer({ min: 1, max: 2 });
    const winningTeamPenalty = losingTeamPenalty + difference;

    return homeWinsOnDraw ? { home: winningTeamPenalty, away: losingTeamPenalty } : { home: losingTeamPenalty, away: winningTeamPenalty };
};
