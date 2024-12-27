import { halfConfig, HalfConfigType, matchConfig } from "../match-configs";
import { ResultType, SettlementResultType } from "../models/rounds";
import Chance from "chance";
import { shuffle } from "./shuffle";
import crypto from "crypto";
import { NUMBER_OF_VIDEOS, POOL_SIZE } from "../constants";
import { randomHelper } from ".";

type DataResultType = {
    randomMode: number;
    pool?: string[];
};
export const generateResult = (data: DataResultType): ResultType => {
    const chance = new Chance();
    const pool = data.pool || createScorePool(halfConfig, POOL_SIZE);
    const randomMode = data.randomMode || 1;

    const firstHalf = generateResultForHalf({ randomMode, pool });
    const secondHalf = generateResultForHalf({ randomMode, pool });
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

export const generateResultFromAdminRawResult = (roundResult: ResultType): ResultType => {
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
        draw4: homeGoals === awayGoals && homeGoals === 4,
        over: isOver,
        under: !isOver,
        odd: isOdd,
        even: !isOdd,
    };
};

export const generateRawResultForHash = () => {};

const generateResultForHalf = (data: DataResultType) => {
    const scoreResult = getScoreFromRate(data);

    const [homeGoals, awayGoals] = scoreResult.split("-").map(Number);
    const sequence = Array(homeGoals).fill("H").concat(Array(awayGoals).fill("A"));

    const result = shuffle(sequence).join("");

    return result || "0";
};

export const getScoreFromRate = (data: DataResultType) => {
    const pool = data.pool || createScorePool(halfConfig, POOL_SIZE);

    const index = randomHelper.getRandomIndexFromArray(data.randomMode, POOL_SIZE);
    return pool[index];
};

const getVideoInfoFromResult = (firstHalf: string, secondHalf: string) => {
    const firstHalfVideo = generateVideoName(firstHalf);
    const secondHalfVideo = generateVideoName(secondHalf, false, firstHalfVideo);

    return {
        firstHalfVideo,
        secondHalfVideo,
    };
};

export const generateVideoName = (result: string, videoDefault = false, ignoredVideo = "") => {
    const chance = new Chance();
    const numberOfVideos = NUMBER_OF_VIDEOS[result] || 1;
    let videoIndex = videoDefault ? 0 : chance.integer({ min: 1, max: numberOfVideos }) - 1;
    let videoName = crypto.createHash("sha256").update(`${result}-${videoIndex}`).digest("hex");

    if (videoName === ignoredVideo && !videoDefault) {
        videoIndex = (videoIndex + 1) % numberOfVideos;
        videoName = crypto.createHash("sha256").update(`${result}-${videoIndex}`).digest("hex");
    }

    return videoName;
};

const generatePenaltyResult = (homeWinsOnDraw: boolean) => {
    const chance = new Chance();
    const maxLosingPenalty = 4;
    const losingTeamPenalty = chance.integer({ min: 0, max: maxLosingPenalty });
    const difference = losingTeamPenalty === maxLosingPenalty ? 1 : chance.integer({ min: 1, max: 2 });
    const winningTeamPenalty = losingTeamPenalty + difference;

    return homeWinsOnDraw ? { home: winningTeamPenalty, away: losingTeamPenalty } : { home: losingTeamPenalty, away: winningTeamPenalty };
};

export function createScorePool(config: HalfConfigType, poolSize: number): string[] {
    const pool: string[] = [];

    for (const [score, rate] of Object.entries(config.scoreRate)) {
        const count = Math.round(rate * poolSize);
        for (let i = 0; i < count; i++) {
            pool.push(score);
        }
    }

    return shuffle(shuffle(pool));
}
