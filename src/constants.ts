export const PRE_MATCH_BET_CHOICES = {
    home: "home",
    away: "away",
    draw: "draw",
    over: "over",
    under: "under",
    odd: "odd",
    even: "even",
};

export const LIVE_BET_CHOICES = {
    homeLive: "homeLive",
    awayLive: "awayLive",
    drawLive: "drawLive",
    overLive: "overLive",
    underLive: "underLive",
    oddLive: "oddLive",
    evenLive: "evenLive",
};

export const BET_CHOICES = {
    ...PRE_MATCH_BET_CHOICES,
    ...LIVE_BET_CHOICES,
};

export const ODDS_TYPE = {
    ...BET_CHOICES,
};

export const BET_CHOICE_ENUM = {
    home: 1,
    away: 2,
    draw: 3,
    over: 4,
    under: 5,
    odd: 6,
    even: 7,
    homeLive: 8,
    awayLive: 9,
    drawLive: 10,
    overLive: 11,
    underLive: 12,
    oddLive: 13,
    evenLive: 14,
};

export const DEFAULT_MARGIN = 0.02;

export const ODDS_FOR_DRAW_4 = 50;

export const MAX_ODDS = 100;

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
