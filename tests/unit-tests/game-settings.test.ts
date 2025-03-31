import gameSettings from "../../src/game-settings";
import { BET_CHOICES } from "../../src/constants";

describe("gameSettings", () => {
    it("should have the correct id", () => {
        expect(gameSettings.id).toBe(114);
    });

    it("should have the correct name", () => {
        expect(gameSettings.name).toBe("MarbleFootball2");
    });

    it("should have the correct configName", () => {
        expect(gameSettings.configName).toBe("marblefootball2");
    });

    it("durations should be in the correct order", () => {
        const {
            wholeRound,
            placingBetsFirstHalf,
            lockingBetFirstHalf,
            streamingVideoFirstHalf,
            placingBetsSecondHalf,
            lockingBetSecondHalf,
            streamingVideoSecondHalf,
        } = gameSettings.durations;

        expect(wholeRound).toBeGreaterThan(placingBetsFirstHalf);
        expect(placingBetsFirstHalf).toBeGreaterThan(lockingBetFirstHalf);
        expect(lockingBetFirstHalf).toBeGreaterThan(streamingVideoFirstHalf);
        expect(wholeRound).toBe(124);
        expect(placingBetsFirstHalf).toBe(107);
        expect(lockingBetFirstHalf).toBe(90);
        expect(streamingVideoFirstHalf).toBe(89);
        expect(wholeRound).toBeGreaterThan(placingBetsSecondHalf);
        expect(placingBetsSecondHalf).toBeGreaterThan(lockingBetSecondHalf);
        expect(lockingBetSecondHalf).toBeGreaterThan(streamingVideoSecondHalf);
        expect(wholeRound).toBe(124);
        expect(placingBetsSecondHalf).toBe(54);
        expect(lockingBetSecondHalf).toBe(37);
        expect(streamingVideoSecondHalf).toBe(36);
    });

    it("should have the correct choices", () => {
        expect(gameSettings.choices).toEqual(Object.values(BET_CHOICES));
    });

    it("should have the correct choicesMapper", () => {
        expect(gameSettings.choicesMapper).toEqual({
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
        });
    });

    it("should have the correct hedgeBetGroups", () => {
        expect(gameSettings.hedgeBetGroups).toEqual([
            [BET_CHOICES.firstHalfHome, BET_CHOICES.firstHalfAway],
            [BET_CHOICES.firstHalfOver, BET_CHOICES.firstHalfUnder],
            [BET_CHOICES.firstHalfOdd, BET_CHOICES.firstHalfEven],
            [BET_CHOICES.secondHalfHome, BET_CHOICES.secondHalfAway],
            [BET_CHOICES.secondHalfOver, BET_CHOICES.secondHalfUnder],
            [BET_CHOICES.secondHalfOdd, BET_CHOICES.secondHalfEven],
        ]);
    });

    it("should have provablyFair set to false", () => {
        expect(gameSettings.provablyFair).toBe(false);
    });

    it("should have the correct historyPageSize", () => {
        expect(gameSettings.historyPageSize).toBe(8);
    });

    it("should have the correct defaultBetTracks", () => {
        expect(gameSettings.defaultBetTracks).toEqual({});
    });

    it("should have the correct botSettings", () => {
        expect(gameSettings.botSettings).toEqual({
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
        });
    });
});
