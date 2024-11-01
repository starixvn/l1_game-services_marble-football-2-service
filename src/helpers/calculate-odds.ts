import { MatchConfigType } from "../game-data";
import { HalfConfigType } from "../match-configs";

const calculateFullTimeScoreRates = (firstHalf: HalfConfigType, secondHalf: HalfConfigType) => {
    const fulltimeScoreRates: Record<string, number> = {};
    const firstHalfScoreRates = Object.keys(firstHalf.scoreRate);
    const secondHalfScoreRates = Object.keys(secondHalf.scoreRate);

    firstHalfScoreRates.forEach((key) => {
        secondHalfScoreRates.forEach((key2) => {
            const newKey = `${parseInt(key[0], 10) + parseInt(key2[0], 10)}-${parseInt(key[2], 10) + parseInt(key2[2], 10)}`;
            const newValue = firstHalf.scoreRate[key] * secondHalf.scoreRate[key2];
            fulltimeScoreRates[newKey] = (fulltimeScoreRates[newKey] || 0) + newValue;
            fulltimeScoreRates[newKey] = Math.round(fulltimeScoreRates[newKey] * 100000) / 100000;
        });
    });

    return fulltimeScoreRates;
};

const calculateProbabilitiesForBetChoices = (scoreRates: Record<string, number>) => {
    const scoreRateKeys = Object.keys(scoreRates);
    const totalRates = scoreRateKeys.reduce((sum, key) => sum + scoreRates[key], 0);

    let homeScore = 0;
    let awayScore = 0;
    let home = 0;
    let away = 0;
    let draw = 0;

    scoreRateKeys.forEach((key) => {
        const homeGoals = parseInt(key[0], 10);
        const awayGoals = parseInt(key[2], 10);
        const rate = scoreRates[key];

        homeScore += homeGoals * rate;
        awayScore += awayGoals * rate;

        if (homeGoals > awayGoals) {
            home += rate;
        } else if (homeGoals < awayGoals) {
            away += rate;
        } else {
            draw += rate;
        }
    });

    homeScore /= totalRates;
    awayScore /= totalRates;
    home /= totalRates;
    away /= totalRates;

    let ou = Math.floor((homeScore + awayScore) / 0.5) * 0.5;
    if (Math.round(ou * 2) % 2 === 0) ou += 0.5;

    let over = 0;
    let under = 0;

    scoreRateKeys.forEach((key) => {
        const total = parseInt(key[0], 10) + parseInt(key[2], 10);
        const rate = scoreRates[key];

        if (total > ou) {
            over += rate;
        } else if (total < ou) {
            under += rate;
        }
    });

    over /= totalRates;
    under /= totalRates;

    return {
        probabilities: { home, away, draw, over, under },
        ou,
    };
};

const calculateOddsFromProb = (prob: number, margin: number) => {
    const odds = (1 - margin) / prob;
    return Math.floor(odds * 100) / 100;
};

export const calculateOdds = (matchConfig: MatchConfigType, margin: number) => {
    const fullTimeScoreRates = calculateFullTimeScoreRates(matchConfig.firstHalf, matchConfig.secondHalf);
    const { probabilities, ou } = calculateProbabilitiesForBetChoices(fullTimeScoreRates);

    const odds = (Object.keys(probabilities) as Array<keyof typeof probabilities>).reduce((acc, key) => {
        acc[key] = calculateOddsFromProb(probabilities[key], margin);
        return acc;
    }, {} as Record<string, number>);

    return { odds, ou };
};
