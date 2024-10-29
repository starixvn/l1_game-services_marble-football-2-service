import { BET_CHOICES } from "./constants";

export default {
    id: 104,
    name: "MarbleFootball",
    configName: "marblefootball",
    durations: {
        wholeRound: 120,
        placingBets: 30,
        lockingBet: 3,
        showingResult: 3,
        startingRound: 4,
    },
    choices: Object.values(BET_CHOICES),
    choicesMapper: { home: 1, away: 2, draw: 3, over: 4, under: 5 },
    hedgeBetGroups: [
        ["over", "under"],
        ["home", "away"],
    ],
    provablyFair: false,
    historyPageSize: 30,
    defaultBetTracks: {},
};
