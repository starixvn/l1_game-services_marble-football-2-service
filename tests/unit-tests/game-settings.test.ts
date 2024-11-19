import gameSettings from "../../src/game-settings";
import { BET_CHOICES } from "../../src/constants";

describe("gameSettings", () => {
    it("should have the correct id", () => {
        expect(gameSettings.id).toBe(104);
    });

    it("should have the correct name", () => {
        expect(gameSettings.name).toBe("MarbleFootball");
    });

    it("should have the correct configName", () => {
        expect(gameSettings.configName).toBe("marblefootball");
    });

    it("durations should be in the correct order", () => {
        const { wholeRound, placingBets, lockingBet, streamingVideo } = gameSettings.durations;

        expect(wholeRound).toBeGreaterThan(placingBets);
        expect(placingBets).toBeGreaterThan(lockingBet);
        expect(lockingBet).toBeGreaterThan(streamingVideo);
    });

    it("should have the correct choices", () => {
        expect(gameSettings.choices).toEqual(Object.values(BET_CHOICES));
    });

    it("should have the correct choicesMapper", () => {
        expect(gameSettings.choicesMapper).toEqual({ home: 1, away: 2, draw: 3, over: 4, under: 5 });
    });

    it("should have the correct hedgeBetGroups", () => {
        expect(gameSettings.hedgeBetGroups).toEqual([
            [BET_CHOICES.home, BET_CHOICES.away],
            [BET_CHOICES.over, BET_CHOICES.under],
            [BET_CHOICES.odd, BET_CHOICES.even],
        ]);
    });

    it("should have provablyFair set to false", () => {
        expect(gameSettings.provablyFair).toBe(false);
    });

    it("should have the correct historyPageSize", () => {
        expect(gameSettings.historyPageSize).toBe(100);
    });

    it("should have the correct defaultBetTracks", () => {
        expect(gameSettings.defaultBetTracks).toEqual({});
    });

    it("should have the correct botSettings", () => {
        expect(gameSettings.botSettings).toEqual({
            ratio: { mainOpts: 60, subOpts: 40 },
            mainOpts: [BET_CHOICES.home, BET_CHOICES.away],
            subOpts: [BET_CHOICES.draw, BET_CHOICES.over, BET_CHOICES.under, BET_CHOICES.odd, BET_CHOICES.even],
        });
    });
});
