import { BET_CHOICES, FULL_TIME_BET_CHOICES } from "./constants";

export type OddsType = {
    [key in keyof typeof BET_CHOICES]: number;
};

export type HalfConfigType = {
    scoreRate: Record<string, number>;
    odds: { [key in keyof typeof FULL_TIME_BET_CHOICES]: number };
    ou: number;
};

const halfConfig1: HalfConfigType = {
    scoreRate: {
        "2-1": 0.11,
        "1-0": 0.1,
        "2-0": 0.1,
        "3-1": 0.07,
        "3-0": 0.06,
        "4-0": 0.02,
        "1-1": 0.11,
        "2-2": 0.06,
        "0-0": 0.06,
        "0-1": 0.07,
        "1-2": 0.07,
        "0-2": 0.03,
        "1-3": 0.03,
        "0-3": 0.01,
        "0-4": 0.01,
    },
    odds: {
        home: 1.93,
        draw: 3.87,
        away: 4.05,
        over: 2.12,
        under: 1.89,
    },
    ou: 2.5,
};

const halfConfig2: HalfConfigType = {
    scoreRate: {
        "2-1": 0.08,
        "1-0": 0.1,
        "2-0": 0.07,
        "3-1": 0.04,
        "3-0": 0.03,
        "4-0": 0.02,
        "1-1": 0.14,
        "2-2": 0.07,
        "0-0": 0.09,
        "0-1": 0.1,
        "1-2": 0.09,
        "0-2": 0.07,
        "1-3": 0.04,
        "0-3": 0.03,
        "0-4": 0.02,
    },
    odds: {
        home: 2.85,
        draw: 3.23,
        away: 2.77,
        over: 2.31,
        under: 1.7,
    },
    ou: 2.5,
};

const halfConfig3: HalfConfigType = {
    scoreRate: {
        "2-1": 0.11,
        "1-0": 0.1,
        "2-0": 0.1,
        "3-1": 0.08,
        "3-0": 0.08,
        "4-0": 0.05,
        "1-1": 0.11,
        "2-2": 0.06,
        "0-0": 0.05,
        "0-1": 0.05,
        "1-2": 0.05,
        "0-2": 0.02,
        "1-3": 0.02,
        "0-3": 0.01,
        "0-4": 0.01,
    },
    odds: {
        home: 2.85,
        draw: 3.23,
        away: 2.77,
        over: 2.31,
        under: 1.7,
    },
    ou: 2.5,
};

const halfConfig4: HalfConfigType = {
    scoreRate: {
        "2-1": 0.08,
        "1-0": 0.07,
        "2-0": 0.05,
        "3-1": 0.04,
        "3-0": 0.02,
        "4-0": 0.01,
        "1-1": 0.12,
        "2-2": 0.08,
        "0-0": 0.05,
        "0-1": 0.08,
        "1-2": 0.1,
        "0-2": 0.07,
        "1-3": 0.05,
        "0-3": 0.03,
        "0-4": 0.01,
    },
    odds: { home: 3.12, away: 2.47, draw: 3.37, over: 2, under: 1.91 },
    ou: 2.5,
};

export const halfConfigs: HalfConfigType[] = [halfConfig1, halfConfig2, halfConfig3, halfConfig4];
