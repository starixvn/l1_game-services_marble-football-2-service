import { ODDS_TYPE } from "./constants";

export type OddsType = {
    [key in keyof typeof ODDS_TYPE]: number;
};

export type HalfConfigType = {
    scoreRate: Record<string, number>;
};

export type MatchConfigType = {
    firstHalfConfig: HalfConfigType;
    secondHalfConfig: HalfConfigType;
};

export const firstHalfConfig: HalfConfigType = {
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
};

const secondHalfConfig1: HalfConfigType = {
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
};

const secondHalfConfig2: HalfConfigType = {
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
};

const secondHalfConfig3: HalfConfigType = {
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
};

export const overUnderConfig = {
    fulltime: 4.5,
    halftime: 4.5,
};

export const secondHalfConfigs = [secondHalfConfig1, secondHalfConfig2, secondHalfConfig3];
