export const SECOND_HALF_BET_CHOICES = {
    secondHalfHome: "secondHalfHome",
    secondHalfAway: "secondHalfAway",
    secondHalfDraw: "secondHalfDraw",
    secondHalfOver: "secondHalfOver",
    secondHalfUnder: "secondHalfUnder",
    secondHalfOdd: "secondHalfOdd",
    secondHalfEven: "secondHalfEven",
};

export const FIRST_HALF_BET_CHOICES = {
    firstHalfHome: "firstHalfHome",
    firstHalfAway: "firstHalfAway",
    firstHalfDraw: "firstHalfDraw",
    firstHalfOver: "firstHalfOver",
    firstHalfUnder: "firstHalfUnder",
    firstHalfOdd: "firstHalfOdd",
    firstHalfEven: "firstHalfEven",
};

export const BET_CHOICES = {
    ...FIRST_HALF_BET_CHOICES,
    ...SECOND_HALF_BET_CHOICES,
};

export const ODDS_TYPE = {
    ...BET_CHOICES,
};

export const BET_CHOICE_ENUM = {
    firstHalfHome: 1,
    firstHalfAway: 2,
    firstHalfDraw: 3,
    firstHalfOver: 4,
    firstHalfUnder: 5,
    firstHalfOdd: 6,
    firstHalfEven: 7,
    secondHalfHome: 8,
    secondHalfAway: 9,
    secondHalfDraw: 10,
    secondHalfOver: 11,
    secondHalfUnder: 12,
    secondHalfOdd: 13,
    secondHalfEven: 14,
};

export const DEFAULT_MARGIN = 0.02;

export const ODDS_FOR_DRAW_4 = 50;

export const OVER_UNDER_VALUE = 4.5;

export const IS_DEV_ENV = process.env.NODE_ENV === "development";

export const GAME_NAME = "marblefootball2";

export const MODEL_NAME_PREFIX = IS_DEV_ENV ? `${GAME_NAME}_dev` : `${GAME_NAME}`;

export const DEFAULT_NUMBER_OF_VIDEOS: Record<string, number> = {
    AAAA: 10,
    AAAH: 12,
    AAA: 41,
    AAHA: 12,
    AAHH: 12,
    AAH: 31,
    AA: 102,
    AHAA: 12,
    AHAH: 12,
    AHA: 30,
    AHHA: 13,
    AHHH: 12,
    AHH: 30,
    AH: 109,
    A: 165,
    HAAA: 12,
    HAAH: 12,
    HAA: 30,
    HAHA: 12,
    HAHH: 12,
    HAH: 30,
    HA: 108,
    HHAA: 10,
    HHAH: 12,
    HHA: 31,
    HHHA: 11,
    HHHH: 12,
    HHH: 54,
    HH: 102,
    H: 167,
    "0": 145,
};

export const DEFAULT_TOURNAMENT_CODES = {
    code: "UCL",
    teams: ["MCI", "RMA", "BAR", "LIV", "ARS", "FCB", "INT", "LEV", "AVL", "ATA", "BVB", "JUV", "PSG", "SLB", "ATM", "MIL"],
};
