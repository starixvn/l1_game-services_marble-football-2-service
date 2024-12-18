export const BET_CHOICES = {
    home: "home",
    away: "away",
    draw: "draw",
    over: "over",
    under: "under",
    odd: "odd",
    even: "even",
};

export const DEFAULT_MARGIN = 0.02;

export const IS_DEV_ENV = process.env.NODE_ENV === "development";

export const POOL_SIZE = 10_000;

export const NUMBER_OF_VIDEOS: Record<string, number> = {
    AAAA: 2,
    AAAH: 3,
    AAA: 10,
    AAHA: 3,
    AAHH: 3,
    AAH: 6,
    AA: 18,
    AHAA: 3,
    AHAH: 3,
    AHA: 6,
    AHHA: 3,
    AHHH: 3,
    AHH: 6,
    AH: 19,
    A: 27,
    HAAA: 2,
    HAAH: 3,
    HAA: 6,
    HAHA: 2,
    HAHH: 3,
    HAH: 6,
    HA: 19,
    HHAA: 2,
    HHAH: 3,
    HHA: 6,
    HHHA: 3,
    HHHH: 3,
    HHH: 10,
    HH: 17,
    H: 27,
    "0": 27,
};
