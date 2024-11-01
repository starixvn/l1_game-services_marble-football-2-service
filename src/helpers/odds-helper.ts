import { DEFAULT_MARGIN } from "../constants";
import { MatchConfigType } from "../game-data";
import { HalfConfigType } from "../match-configs";

export const parseScore = (score: string): [number, number] => {
    const [home, away] = score.split("-").map(Number);
    return [home, away];
};

export const roundToPrecision = (value: number, precision = 100) => {
    return Math.round(value * precision) / precision;
};

export const calculateFullTimeScoreRates = (firstHalf: HalfConfigType, secondHalf: HalfConfigType): Record<string, number> => {
    const fulltimeScoreRates: Record<string, number> = {};

    for (const [fhScore, fhRate] of Object.entries(firstHalf.scoreRate)) {
        const [fhHome, fhAway] = parseScore(fhScore);

        for (const [shScore, shRate] of Object.entries(secondHalf.scoreRate)) {
            const [shHome, shAway] = parseScore(shScore);
            const finalScore = `${fhHome + shHome}-${fhAway + shAway}`;
            const combinedRate = fhRate * shRate;

            fulltimeScoreRates[finalScore] = (fulltimeScoreRates[finalScore] || 0) + roundToPrecision(combinedRate, 100000);
        }
    }

    return fulltimeScoreRates;
};

export const calculateProbabilitiesForBetChoices = (scoreRates: Record<string, number>) => {
    const totalRates = Object.values(scoreRates).reduce((sum, rate) => sum + rate, 0);

    let homeScore = 0,
        awayScore = 0,
        home = 0,
        away = 0,
        draw = 0,
        over = 0,
        under = 0;

    for (const [score, rate] of Object.entries(scoreRates)) {
        const [homeGoals, awayGoals] = parseScore(score);
        homeScore += homeGoals * rate;
        awayScore += awayGoals * rate;

        if (homeGoals > awayGoals) {
            home += rate;
        } else if (homeGoals < awayGoals) {
            away += rate;
        } else {
            draw += rate;
        }
    }

    homeScore /= totalRates;
    awayScore /= totalRates;

    let ou = Math.floor((homeScore + awayScore) / 0.5) * 0.5;

    if (Math.round(ou * 2) % 2 === 0) {
        ou += 0.5;
    }

    for (const [score, rate] of Object.entries(scoreRates)) {
        const [homeGoals, awayGoals] = parseScore(score);
        const totalGoals = homeGoals + awayGoals;

        if (totalGoals > ou) {
            over += rate;
        } else if (totalGoals < ou) {
            under += rate;
        }
    }

    return {
        probabilities: {
            home: home / totalRates,
            away: away / totalRates,
            draw: draw / totalRates,
            over: over / totalRates,
            under: under / totalRates,
        },
        ou,
    };
};

export const calculateBetOdds = (probabilities: Record<string, number>, margins: Record<string, number>[] = []): Record<string, number> => {
    const sortedMargins = margins.toSorted((a, b) => a.max - b.max);

    return Object.keys(probabilities).reduce((result, betChoice) => {
        const prob = probabilities[betChoice];
        const originalOdds = probabilityToBetOdds(prob);
        const margin = sortedMargins.find((m) => originalOdds <= m.max)?.[betChoice] || DEFAULT_MARGIN;
        result[betChoice] = probabilityToBetOdds(prob, margin);
        return result;
    }, {} as Record<string, number>);
};

export const probabilityToBetOdds = (prob: number, margin = DEFAULT_MARGIN): number => {
    const odds = (1 - margin) / prob;
    return odds > 20 ? Math.floor(odds) : roundToPrecision(odds);
};

export const calculateFulltimeOdds = (matchConfig: MatchConfigType, margins: Record<string, number>[] = []) => {
    const fullTimeScoreRates = calculateFullTimeScoreRates(matchConfig.firstHalf, matchConfig.secondHalf);
    const { probabilities, ou } = calculateProbabilitiesForBetChoices(fullTimeScoreRates);

    const odds = calculateBetOdds(probabilities, margins);

    return { odds, ou };
};

export const calculateHalfOdds = (halfConfig: HalfConfigType, margins: Record<string, number>[] = []) => {
    const { probabilities, ou } = calculateProbabilitiesForBetChoices(halfConfig.scoreRate);

    const odds = calculateBetOdds(probabilities, margins);

    return { odds, ou };
};
