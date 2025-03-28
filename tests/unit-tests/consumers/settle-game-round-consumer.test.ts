import { Table } from "sc-game-base";
import SettleGameRoundConsumer from "../../../src/consumers/settle-game-round-consumer";
import GameData from "../../../src/game-data";
import {
    betsRepository,
    endGame,
    gameManagementApiClientFactory,
    roundResultPublisher,
    roundsRepository,
    tempBetsRepository,
    tournamentConsumer,
    userBetResultPublisher,
} from "../global-stubs";
import { stub } from "jest-auto-stub";
import GameDefinition from "../../../src/game-definition";
import { OddsType } from "../../../src/match-configs";

describe("SettleGameRoundConsumer", () => {
    let settleGameRoundConsumer: SettleGameRoundConsumer;
    let mockContainer: any;
    const gameData = stub<GameData>();
    const definition = stub<GameDefinition>();

    beforeEach(() => {
        mockContainer = {
            gameData: gameData,
            tournamentConsumer: tournamentConsumer,
            definition,
            roundResultPublisher,
            userBetResultPublisher,
            endGame,
            roundsRepository,
            betsRepository,
            gameManagementApiClientFactory,
            tempBetsRepository,
        };

        // Create the instance
        settleGameRoundConsumer = new SettleGameRoundConsumer(mockContainer);
    });

    describe("constructor", () => {
        it("should initialize with the provided container", () => {
            // Assert
            expect(settleGameRoundConsumer.tournamentConsumer).toBe(tournamentConsumer);
            expect(settleGameRoundConsumer.gameData).toBe(gameData);
        });
    });

    describe("settleRound", () => {
        it("should call super.settleRound and updateTournament", async () => {
            // Arrange
            const superSettleRoundSpy = jest
                .spyOn(Table.EventConsumers.TableSettleGameRoundConsumer.prototype, "settleRound")
                .mockResolvedValue();

            const updateTournamentSpy = jest.spyOn(settleGameRoundConsumer, "updateTournament").mockResolvedValue();

            // Act
            await settleGameRoundConsumer.settleRound();

            // Assert
            expect(superSettleRoundSpy).toHaveBeenCalledTimes(1);
            expect(updateTournamentSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("updateTournament", () => {
        it("should call tournamentConsumer.updateMatchResult with the correct argument (homeWins = true)", async () => {
            // Arrange
            settleGameRoundConsumer.definition = {
                settle: jest.fn(() => ({
                    draw: false,
                    home: true,
                })),
            } as any;

            gameData.result.homeWinsOnDraw = true;

            // Act
            await settleGameRoundConsumer.updateTournament();

            // Assert
            expect(settleGameRoundConsumer.definition.settle).toHaveBeenCalledWith(gameData.result);
            expect(tournamentConsumer.updateMatchResult).toHaveBeenCalledWith(true);
        });

        it("should call tournamentConsumer.updateMatchResult with the correct argument (homeWins = false)", async () => {
            // Arrange
            settleGameRoundConsumer.definition = {
                settle: jest.fn(() => ({
                    draw: true,
                    home: false,
                })),
            } as any;

            gameData.result.homeWinsOnDraw = false;

            // Act
            await settleGameRoundConsumer.updateTournament();

            // Assert
            expect(settleGameRoundConsumer.definition.settle).toHaveBeenCalledWith(gameData.result);
            expect(tournamentConsumer.updateMatchResult).toHaveBeenCalledWith(false);
        });
    });

    describe("calculateBetResult", () => {
        // Common test objects
        const defaultSettlementResult = {
            firstHalfHome: false,
            firstHalfAway: false,
            firstHalfDraw: false,
            firstHalfOver: false,
            firstHalfUnder: false,
            firstHalfOdd: false,
            firstHalfEven: false,
            secondHalfHome: false,
            secondHalfAway: false,
            secondHalfDraw: false,
            secondHalfOver: false,
            secondHalfUnder: false,
            secondHalfOdd: false,
            secondHalfEven: false,
        };

        const odds = {
            firstHalfHome: 2.0,
            firstHalfAway: 2.0,
            firstHalfDraw: 2.0,
            firstHalfOver: 2.0,
            firstHalfUnder: 2.0,
            firstHalfOdd: 2.0,
            firstHalfEven: 2.0,
        } as OddsType;

        it("should calculate bet result correctly for a winning bet", () => {
            // Arrange
            const settlementResult = { ...defaultSettlementResult, firstHalfHome: true };
            const bet = { firstHalfHome: 100, freeBet: false };

            // Act
            const result = settleGameRoundConsumer.calculateBetResult(settlementResult, bet, odds);

            // Assert
            expect(result.totalBetAmount).toBe(100);
            expect(result.totalWin).toBe(200);
            expect(result.netWin).toBe(100);
            expect((result.winningByChoices as any).firstHalfHome).toEqual(200);
        });

        it("should calculate bet result correctly for a losing bet", () => {
            // Arrange
            const settlementResult = { ...defaultSettlementResult, firstHalfAway: true };
            const bet = { firstHalfHome: 100, freeBet: false };

            // Act
            const result = settleGameRoundConsumer.calculateBetResult(settlementResult, bet, odds);

            // Assert
            expect(result.totalBetAmount).toBe(100);
            expect(result.totalWin).toBe(0);
            expect((result.winningByChoices as any).firstHalfAway).toEqual(0);
        });

        it("should handle free bets correctly", () => {
            // Arrange
            const settlementResult = { ...defaultSettlementResult, firstHalfHome: true };
            const bet = { firstHalfHome: 100, freeBet: true };

            // Act
            const result = settleGameRoundConsumer.calculateBetResult(settlementResult, bet, odds);

            // Assert
            expect(result.totalBetAmount).toBe(100);
            expect(result.totalWin).toBe(100);
            expect(result.netWin).toBe(0);
            expect((result.winningByChoices as any).firstHalfHome).toEqual(100);
        });

        it("should handle multiple bets correctly", () => {
            // Arrange
            const settlementResult = { ...defaultSettlementResult, firstHalfHome: true, firstHalfOver: true };
            const bet = { firstHalfHome: 100, firstHalfOver: 50, freeBet: false };

            // Act
            const result = settleGameRoundConsumer.calculateBetResult(settlementResult, bet, odds);

            // Assert
            expect(result.totalBetAmount).toBe(150);
            expect(result.totalWin).toBe(300);
            expect(result.netWin).toBe(150);
            expect((result.winningByChoices as any).firstHalfHome).toEqual(200);
            expect((result.winningByChoices as any).firstHalfOver).toEqual(100);
        });

        it("should round results to 2 decimal places", () => {
            // Arrange
            const settlementResult = { ...defaultSettlementResult, firstHalfHome: true };
            const bet = { firstHalfHome: 100, freeBet: false };

            // Act
            const result = settleGameRoundConsumer.calculateBetResult(settlementResult, bet, odds);

            // Assert
            expect(result.totalWin).toBe(200);
            expect(result.netWin).toBe(100);
        });
    });
});
