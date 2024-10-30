import { BET_CHOICES } from "./constants";

export default {
    id: 104,
    name: "MarbleFootball",
    configName: "marblefootball",
    durations: {
        wholeRound: 126,
        placingBets: 120,
        lockingBet: 90,
        showingResult: 3,
        startingRound: 3,
    },
    choices: Object.values(BET_CHOICES),
    choicesMapper: { home: 1, away: 2, draw: 3, over: 4, under: 5 },
    hedgeBetGroups: [
        [BET_CHOICES.home, BET_CHOICES.away],
        [BET_CHOICES.over, BET_CHOICES.under],
    ],
    provablyFair: false,
    historyPageSize: 100,
    defaultBetTracks: {},
    botSettings: {
        ratio: { mainOpts: 60, subOpts: 40 },
        mainOpts: [BET_CHOICES.home, BET_CHOICES.away],
        subOpts: [BET_CHOICES.away, BET_CHOICES.over, BET_CHOICES.under],
    },
};
