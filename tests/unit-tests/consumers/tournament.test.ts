import appConfigs from "../../../src/app-configs";
import { TournamentConsumer } from "../../../src/consumers";
import { tournamentRepository } from "../global-stubs";

describe(TournamentConsumer.name, () => {
    let consumer: TournamentConsumer;

    beforeEach(() => {
        consumer = new TournamentConsumer({
            tournamentRepository: tournamentRepository,
            appConfigs: appConfigs,
        });
    });

    describe("getCurrentTournamentId", () => {
        it("should find the running tournament", async () => {
            // Arrange
            (tournamentRepository as any).exec.mockReturnValue({ _id: "fake_id" });

            // Act
            await consumer.getCurrentTournament();

            // Assert
            expect(tournamentRepository.findOne).toHaveBeenCalledWith({ ended: false });
        });

        describe("when found the running tournament", () => {
            it("should return its id", async () => {
                // Arrange
                (tournamentRepository as any).exec.mockReturnValue({ _id: "6729922bdbdc9fc5fb25d98d" });

                // Act
                const actual = await consumer.getCurrentTournament();

                // Assert
                expect(actual).toBe("6729922bdbdc9fc5fb25d98d");
            });
        });

        describe("when the running tournament is not found", () => {
            it("should create the new tournament", async () => {
                // Arrange
                (tournamentRepository as any).exec.mockReturnValue(null);
                (tournamentRepository as any).create.mockReturnValue({ _id: "6729922bdbdc9fc5fb25d98d" });

                // Act
                await consumer.getCurrentTournament();

                // Assert
                expect(tournamentRepository.create).toHaveBeenCalledWith({
                    code: appConfigs.tournament.code,
                    matches: expect.any(Array),
                    currentMatch: 0,
                    ended: false,
                });
            });

            it("should return the id of the new tournament", async () => {
                // Arrange
                (tournamentRepository as any).exec.mockReturnValue(null);
                (tournamentRepository as any).create.mockReturnValue({ _id: "6729922bdbdc9fc5fb25d98d" });

                // Act
                const actual = await consumer.getCurrentTournament();

                // Assert
                expect(actual).toBe("6729922bdbdc9fc5fb25d98d");
            });
        });
    });

    describe("updateMatchResult", () => {
        it("should find the tournament", async () => {
            // Arrange
            (tournamentRepository as any).exec.mockReturnValue(null);

            // Act
            await consumer.updateMatchResult(0, "tournament_id", false);

            // Assert
            expect(tournamentRepository.findById).toHaveBeenCalledWith("tournament_id");
        });

        describe("when found the tournament", () => {
            beforeEach(() => {
                (tournamentRepository as any).exec.mockReturnValue({
                    _id: "672988e6610ec92d5204aaf4",
                    matches: [
                        {
                            home: "VNM",
                            away: "SGP",
                        },
                        {
                            home: "PHL",
                            away: "TWN",
                        },
                        {
                            home: "HKG",
                            away: "THA",
                        },
                        {
                            home: "IDN",
                            away: "TLS",
                        },
                        {
                            home: "JPN",
                            away: "KOR",
                        },
                        {
                            home: "CHN",
                            away: "LAO",
                        },
                        {
                            home: "BRN",
                            away: "IND",
                        },
                        {
                            home: "KHM",
                            away: "MYS",
                        },
                        {
                            home: "",
                            away: "",
                        },
                        {
                            home: "",
                            away: "",
                        },
                        {
                            home: "",
                            away: "",
                        },
                        {
                            home: "",
                            away: "",
                        },
                        {
                            home: "",
                            away: "",
                        },
                        {
                            home: "",
                            away: "",
                        },
                        {
                            home: "",
                            away: "",
                        },
                    ],
                    currentMatch: 0,
                    ended: false,
                    code: "SEAOC",
                    time: new Date("2024-11-05T02:54:30.011Z"),
                });
            });

            it("should update the state of tournament", async () => {
                // Arrange
                const expectedMatches = [
                    {
                        home: "VNM",
                        away: "SGP",
                        id: 0,
                    },
                    {
                        home: "PHL",
                        away: "TWN",
                    },
                    {
                        home: "HKG",
                        away: "THA",
                    },
                    {
                        home: "IDN",
                        away: "TLS",
                    },
                    {
                        home: "JPN",
                        away: "KOR",
                    },
                    {
                        home: "CHN",
                        away: "LAO",
                    },
                    {
                        home: "BRN",
                        away: "IND",
                    },
                    {
                        home: "KHM",
                        away: "MYS",
                    },
                    {
                        home: "SGP",
                        away: "",
                    },
                    {
                        home: "",
                        away: "",
                    },
                    {
                        home: "",
                        away: "",
                    },
                    {
                        home: "",
                        away: "",
                    },
                    {
                        home: "",
                        away: "",
                    },
                    {
                        home: "",
                        away: "",
                    },
                    {
                        home: "",
                        away: "",
                    },
                ];

                // Act
                await consumer.updateMatchResult(0, "tournament_id", false);

                // Assert
                expect(tournamentRepository.updateOne).toHaveBeenCalledWith(
                    { _id: "672988e6610ec92d5204aaf4" },
                    {
                        matches: expectedMatches,
                        ended: false,
                        currentMatch: 1,
                    }
                );
            });
        });
    });
});
