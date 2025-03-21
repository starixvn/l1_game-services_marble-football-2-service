import { BET_CHOICE_ENUM, BET_CHOICES } from "./constants";

export default {
    id: 114,
    name: "MarbleFootball2",
    configName: "marblefootball2",
    durations: {
        wholeRound: 121,
        startingRound: 117,
        placingBetsFirstHalf: 114,
        lockingBetFirstHalf: 104,
        streamingVideo: 100,
        placingBetSecondHalf: 58,
        lockingBetSecondHalf: 39,
        streamingVideoSecondHalf: 38
    },
    choices: Object.values(BET_CHOICES),
    choicesMapper: BET_CHOICE_ENUM,
    hedgeBetGroups: [
        [BET_CHOICES.firstHalfHome, BET_CHOICES.firstHalfAway],
        [BET_CHOICES.firstHalfOver, BET_CHOICES.firstHalfUnder],
        [BET_CHOICES.firstHalfOdd, BET_CHOICES.firstHalfEven],
        [BET_CHOICES.secondHalfHome, BET_CHOICES.secondHalfAway],
        [BET_CHOICES.secondHalfOver, BET_CHOICES.secondHalfUnder],
        [BET_CHOICES.secondHalfOdd, BET_CHOICES.secondHalfEven],
    ],
    provablyFair: false,
    historyPageSize: 8,
    defaultBetTracks: {},
    botSettings: {
        ratio: { mainOpts: 80, subOpts: 20 },
        mainOpts: [BET_CHOICES.firstHalfHome, BET_CHOICES.firstHalfAway, BET_CHOICES.secondHalfHome, BET_CHOICES.secondHalfAway],
        subOpts: [
            BET_CHOICES.firstHalfOver,
            BET_CHOICES.firstHalfUnder,
            BET_CHOICES.firstHalfOdd,
            BET_CHOICES.firstHalfEven,
            BET_CHOICES.firstHalfDraw,
            BET_CHOICES.secondHalfOver,
            BET_CHOICES.secondHalfUnder,
            BET_CHOICES.secondHalfOdd,
            BET_CHOICES.secondHalfEven,
            BET_CHOICES.secondHalfDraw,
        ],
    },
};
