import { BET_CHOICES } from "./constants";

export type OddsType = {
    [key in keyof typeof BET_CHOICES]: number;
};

export type HalfConfigType = {
    scoreRate: Record<string, number>;
    odds: { [key in keyof typeof BET_CHOICES]: number };
    ou: number;
};

const halfConfig1: HalfConfigType = {
    scoreRate: {
        "0-0": 0.111,
        "1-0": 0.1142,
        "0-1": 0.1142,
        "1-1": 0.16,
        "2-0": 0.0741,
        "0-2": 0.0741,
        "2-1": 0.0648,
        "1-2": 0.0648,
        "3-0": 0.037,
        "0-3": 0.037,
        "2-2": 0.0558,
        "3-1": 0.0372,
        "1-3": 0.0372,
        "4-0": 0.0093,
        "0-4": 0.0093,
    },
    odds: {
        home: 1.93,
        draw: 3.87,
        away: 4.05,
        over: 2.12,
        under: 1.89,
        odd: 1.93,
        even: 1.93,
    },
    ou: 2.5,
};

const halfConfig2: HalfConfigType = {
    scoreRate: {
        "0-0": 0.105,
        "1-0": 0.095,
        "0-1": 0.095,
        "1-1": 0.115,
        "2-0": 0.065,
        "0-2": 0.065,
        "2-1": 0.095,
        "1-2": 0.095,
        "3-0": 0.035,
        "0-3": 0.035,
        "2-2": 0.06,
        "3-1": 0.055,
        "1-3": 0.055,
        "4-0": 0.015,
        "0-4": 0.015,
    },
    odds: {
        home: 2.85,
        draw: 3.23,
        away: 2.77,
        over: 2.31,
        under: 1.7,
        odd: 1.93,
        even: 1.93,
    },
    ou: 2.5,
};

const halfConfig3: HalfConfigType = {
    scoreRate: {
        "0-0": 0.1,
        "1-0": 0.1,
        "0-1": 0.1,
        "1-1": 0.14,
        "2-0": 0.07,
        "0-2": 0.07,
        "2-1": 0.085,
        "1-2": 0.085,
        "3-0": 0.03,
        "0-3": 0.03,
        "2-2": 0.07,
        "3-1": 0.04,
        "1-3": 0.04,
        "4-0": 0.02,
        "0-4": 0.02,
    },
    odds: {
        home: 2.85,
        draw: 3.23,
        away: 2.77,
        over: 2.31,
        under: 1.7,
        odd: 1.93,
        even: 1.93,
    },
    ou: 2.5,
};

const halfConfig4: HalfConfigType = {
    scoreRate: {
        "0-0": 0.05,
        "1-0": 0.07,
        "0-1": 0.07,
        "1-1": 0.1,
        "2-0": 0.06,
        "0-2": 0.06,
        "2-1": 0.08,
        "1-2": 0.08,
        "3-0": 0.09,
        "0-3": 0.09,
        "2-2": 0.05,
        "3-1": 0.05,
        "1-3": 0.05,
        "4-0": 0.05,
        "0-4": 0.05,
    },
    odds: { home: 3.12, draw: 3.37, away: 2.47, over: 2, under: 1.91, odd: 1.93, even: 1.93 },
    ou: 2.5,
};

const halfConfig5: HalfConfigType = {
    scoreRate: {
        "0-0": 0.08,
        "1-0": 0.085,
        "0-1": 0.085,
        "1-1": 0.125,
        "2-0": 0.075,
        "0-2": 0.075,
        "2-1": 0.1,
        "1-2": 0.1,
        "3-0": 0.035,
        "0-3": 0.035,
        "2-2": 0.085,
        "3-1": 0.05,
        "1-3": 0.05,
        "4-0": 0.01,
        "0-4": 0.01,
    },
    odds: { home: 3.12, draw: 3.37, away: 2.47, over: 2, under: 1.91, odd: 1.93, even: 1.93 },
    ou: 2.5,
};

export const halfConfigs: HalfConfigType[] = [halfConfig1, halfConfig2, halfConfig3, halfConfig4, halfConfig5];
