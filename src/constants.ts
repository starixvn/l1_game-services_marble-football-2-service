export const HALF_TIME_BET_CHOICES = {
    firstHalfHome: "firstHalfHome",
    firstHalfAway: "firstHalfAway",
    firstHalfDraw: "firstHalfDraw",
    firstHalfOver: "firstHalfOver",
    firstHalfUnder: "firstHalfUnder",
};

export const FULL_TIME_BET_CHOICES = {
    home: "home",
    away: "away",
    draw: "draw",
    over: "over",
    under: "under",
};

export const BET_CHOICES = { ...HALF_TIME_BET_CHOICES, ...FULL_TIME_BET_CHOICES };

export const DEFAULT_MARGIN = 0.02;

export const IS_DEV_ENV = process.env.NODE_ENV === "development";
