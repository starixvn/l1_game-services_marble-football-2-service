import { BET_CHOICES } from "../constants";

export const roundUserBetPercentage = (percentage: Record<string, number>) => {
    if (!percentage[BET_CHOICES.home] && !percentage[BET_CHOICES.away]) {
        percentage[BET_CHOICES.home] = 0;
        percentage[BET_CHOICES.away] = 0;
    } else {
        percentage[BET_CHOICES.home] && (percentage[BET_CHOICES.home] = parseInt(percentage[BET_CHOICES.home].toString()));
        percentage[BET_CHOICES.away] && (percentage[BET_CHOICES.away] = parseInt(percentage[BET_CHOICES.away].toString()));
        if (percentage[BET_CHOICES.home] > 0) {
            percentage[BET_CHOICES.away] = 100 - (percentage[BET_CHOICES.home] ?? 0);
        } else {
            percentage[BET_CHOICES.home] = 100 - (percentage[BET_CHOICES.away] ?? 0);
        }
    }

    return percentage;
};

export const calculateUserBetPercentage = (playerBetCount: Record<string, string[]>): Record<string, number> => {
    const total = Object.values(playerBetCount).reduce((t, count) => t + count.length, 0);
    return Object.keys(playerBetCount).reduce((result, choice) => {
        result[choice] = parseFloat(((playerBetCount[choice].length * 100) / total).toFixed(2));
        return result;
    }, {} as Record<string, number>);
};
