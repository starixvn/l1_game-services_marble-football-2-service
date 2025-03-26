import { DEFAULT_MARGIN, ODDS_FOR_DRAW_4, OVER_UNDER_VALUE } from "../constants";
import { HalfConfigType, MatchConfigType } from "../match-configs";

export type GeneratingOdds = {
    home: number;
    away: number;
    draw: number;
    over: number;
    under: number;
    even: number;
    odd: number;
};

export const parseScore = (score: string): [number, number] => {
    const [home, away] = score.split("-").map(Number);
    return [home, away];
};

export const roundToPrecision = (value: number, precision = 100000) => {
    return Math.floor(value * precision) / precision;
};

export const calculateFullTimeScoreRates = (firstHalf: HalfConfigType, secondHalf: HalfConfigType): Record<string, number> => {
    const fulltimeScoreRates: Record<string, number> = {};

    for (const [fhScore, fhRate] of Object.entries(firstHalf.scoreRate)) {
        const [fhHome, fhAway] = parseScore(fhScore);

        for (const [shScore, shRate] of Object.entries(secondHalf.scoreRate)) {
            const [shHome, shAway] = parseScore(shScore);
            const finalScore = `${fhHome + shHome}-${fhAway + shAway}`;
            const combinedRate = fhRate * shRate;

            fulltimeScoreRates[finalScore] = (fulltimeScoreRates[finalScore] || 0) + combinedRate;
        }
    }

    return fulltimeScoreRates;
};

export const calculateProbabilitiesForBetChoices = (scoreRates: Record<string, number>, addingScore: string = "0-0") => {
    const totalRates = Object.values(scoreRates).reduce((sum, rate) => sum + rate, 0);
    const [addingHome, addingAway] = parseScore(addingScore);

    let home = 0,
        away = 0,
        draw = 0,
        draw4 = 0,
        over = 0,
        under = 0,
        odd = 0,
        even = 0;

    for (const [score, rate] of Object.entries(scoreRates)) {
        const [homeGoals, awayGoals] = parseScore(score);

        if (homeGoals + addingHome > awayGoals + addingAway) {
            home += rate;
        } else if (homeGoals + addingHome < awayGoals + addingAway) {
            away += rate;
        } else {
            draw += rate;
            if (homeGoals + addingHome === 4) {
                draw4 += rate;
            }
        }
    }

    for (const [score, rate] of Object.entries(scoreRates)) {
        const [homeGoals, awayGoals] = parseScore(score);
        const totalGoals = homeGoals + awayGoals + addingHome + addingAway;

        if (totalGoals > OVER_UNDER_VALUE) {
            over += rate;
        } else if (totalGoals < OVER_UNDER_VALUE) {
            under += rate;
        }

        if (totalGoals % 2 === 0) {
            even += rate;
        } else {
            odd += rate;
        }
    }

    return {
        probabilities: {
            home: home / totalRates,
            away: away / totalRates,
            draw: draw / totalRates,
            draw4: draw4 / totalRates,
            over: over / totalRates,
            under: under / totalRates,
            even: even / totalRates,
            odd: odd / totalRates,
        },
    };
};

export const calculateBetOdds = (probabilities: Record<string, number>, margins: Record<string, number>[] = []): GeneratingOdds => {
    const sortedMargins = margins.toSorted((a, b) => a.max - b.max);

    const odds = Object.keys(probabilities)
        .filter((betChoice) => betChoice !== "draw4" && betChoice !== "draw")
        .reduce((result, betChoice) => {
            const prob = probabilities[betChoice];
            const originalOdds = probabilityToBetOdds(prob);
            const margin = sortedMargins.find((m) => originalOdds <= m.max)?.[betChoice] || DEFAULT_MARGIN;
            result[betChoice] = probabilityToBetOdds(prob, margin);
            return result;
        }, {} as Record<string, number>);

    odds.draw = calculateDrawOdds(probabilities, margins);

    return odds as GeneratingOdds;
};

export const probabilityToBetOdds = (prob: number, margin = 0): number => {
    const odds = (1 - margin) / prob;
    return odds > 20 ? Math.floor(odds) : roundToPrecision(odds);
};

export const calculatePreMatchOdds = (matchConfig: MatchConfigType, margins: Record<string, number>[] = []) => {
    const fullTimeScoreRates = calculateFullTimeScoreRates(matchConfig.firstHalfConfig, matchConfig.secondHalfConfig);
    const { probabilities } = calculateProbabilitiesForBetChoices(fullTimeScoreRates);

    const odds = calculateBetOdds(probabilities, margins);

    return odds;
};

export const calculateLiveOdds = (halfConfig: HalfConfigType, margins: Record<string, number>[] = [], firstHalfResult = "0-0") => {
    const { probabilities } = calculateProbabilitiesForBetChoices(halfConfig.scoreRate, firstHalfResult);
    const odds = calculateBetOdds(probabilities, margins);

    return odds;
};

export const calculateDrawOdds = (probabilities: Record<string, number>, margins: Record<string, number>[] = []) => {
    const drawProb = probabilities.draw;
    const drawProb4 = probabilities.draw4;
    const originalOdds = (1 - drawProb4 * ODDS_FOR_DRAW_4) / (drawProb - drawProb4);
    const margin = margins.find((m) => originalOdds <= m.max)?.draw || DEFAULT_MARGIN;
    const odds = (1 - margin - drawProb4 * ODDS_FOR_DRAW_4) / (drawProb - drawProb4);
    return roundToPrecision(odds);
};
