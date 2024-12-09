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
});
