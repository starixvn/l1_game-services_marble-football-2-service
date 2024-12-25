import { BET_CHOICES } from "./constants";

export default {
    id: 104,
    name: "MarbleFootball",
    configName: "marblefootball",
    durations: {
        wholeRound: 151,
        startingRound: 141,
        placingBets: 136,
        lockingBet: 109,
        streamingVideo: 108,
    },
    choices: Object.values(BET_CHOICES),
    choicesMapper: { home: 1, away: 2, draw: 3, over: 4, under: 5, odd: 6, even: 7 },
    hedgeBetGroups: [
        [BET_CHOICES.home, BET_CHOICES.away],
        [BET_CHOICES.over, BET_CHOICES.under],
        [BET_CHOICES.odd, BET_CHOICES.even],
    ],
    provablyFair: false,
    historyPageSize: 8,
    defaultBetTracks: {},
    botSettings: {
        ratio: { mainOpts: 60, subOpts: 40 },
        mainOpts: [BET_CHOICES.home, BET_CHOICES.away],
        subOpts: [BET_CHOICES.draw, BET_CHOICES.over, BET_CHOICES.under, BET_CHOICES.odd, BET_CHOICES.even],
    },
};
