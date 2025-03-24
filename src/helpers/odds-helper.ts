import { DEFAULT_MARGIN, ODDS_FOR_DRAW_4 } from "../constants";
import { HalfConfigType, MatchConfigType, overUnderConfig } from "../match-configs";

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

export const calculateProbabilitiesForBetChoices = (scoreRates: Record<string, number>, ouValue: number, handicap: number = 0) => {
    const totalRates = Object.values(scoreRates).reduce((sum, rate) => sum + rate, 0);

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

        if (homeGoals + handicap > awayGoals) {
            home += rate;
        } else if (homeGoals + handicap < awayGoals) {
            away += rate;
        } else {
            draw += rate;
            if (homeGoals + handicap === 4) {
                draw4 += rate;
            }
        }
    }

    for (const [score, rate] of Object.entries(scoreRates)) {
        const [homeGoals, awayGoals] = parseScore(score);
        const totalGoals = homeGoals + awayGoals;

        if (totalGoals > ouValue) {
            over += rate;
        } else if (totalGoals < ouValue) {
            under += rate;
        }

        if ((totalGoals + handicap) % 2 === 0) {
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

export const calculateBetOdds = (probabilities: Record<string, number>, margins: Record<string, number>[] = []): Record<string, number> => {
    const sortedMargins = margins.toSorted((a, b) => a.max - b.max);

    const odds = Object.keys(probabilities)
        .filter((betChoice) => betChoice !== "draw4" && betChoice !== "draw")
        .reduce((result, betChoice) => {
            const prob = probabilities[betChoice];
            const originalOdds = probabilityToBetOdds(prob);
            const margin = sortedMargins.find((m) => originalOdds <= m.max)?.[betChoice] || 0;
            result[betChoice] = probabilityToBetOdds(prob, margin);
            return result;
        }, {} as Record<string, number>);

    odds.draw = calculateDrawOdds(probabilities, DEFAULT_MARGIN);

    return odds;
};

export const probabilityToBetOdds = (prob: number, margin = 0): number => {
    const odds = (1 - margin) / prob;
    return odds > 20 ? Math.floor(odds) : roundToPrecision(odds);
};

export const calculateFulltimeOdds = (matchConfig: MatchConfigType, margins: Record<string, number>[] = []) => {
    const fullTimeScoreRates = calculateFullTimeScoreRates(matchConfig.firstHalfConfig, matchConfig.secondHalfConfig);
    const { probabilities } = calculateProbabilitiesForBetChoices(fullTimeScoreRates, overUnderConfig.fulltime);

    const odds = calculateBetOdds(probabilities, margins);

    return { odds };
};

export const calculateHalfOdds = (halfConfig: HalfConfigType, margins: Record<string, number>[] = [], handicap: number) => {
    const { probabilities } = calculateProbabilitiesForBetChoices(halfConfig.scoreRate, overUnderConfig.halftime, handicap);
    const odds = calculateBetOdds(probabilities, margins);

    return { odds };
};

export const calculateDrawOdds = (probabilities: Record<string, number>, margin: number = DEFAULT_MARGIN) => {
    const drawProb = probabilities.draw;
    const drawProb4 = probabilities.draw4;
    const odds = (1 - margin - drawProb4 * ODDS_FOR_DRAW_4) / (drawProb - drawProb4);
    return roundToPrecision(odds);
};
