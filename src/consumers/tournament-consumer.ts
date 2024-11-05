import type appConfigs from "../app-configs";
import { shuffle } from "../helpers";
import generate from "../helpers/tournament/generate";
import updateNext from "../helpers/tournament/update-next";
import type { tournament } from "../models";
import type { ITournament } from "../models/tournaments";

export default class TournamentConsumer {
    tournamentRepository: typeof tournament;
    appConfigs: typeof appConfigs;

    constructor(container: any) {
        this.tournamentRepository = container.tournamentRepository;
        this.appConfigs = container.appConfigs;
    }

    async updateMatchResult(roundId: number, tournamentId: string, homeWin: boolean) {
        const tournament: ITournament = await this.tournamentRepository.findById(tournamentId).lean().exec();

        if (tournament) {
            const match = tournament.matches[tournament.currentMatch];
            const team = homeWin ? match.home : match.away;
            const ended = tournament.currentMatch + 1 >= tournament.matches.length;

            if (!ended) {
                updateNext(tournament.matches, tournament.currentMatch, team);

                tournament.matches[tournament.currentMatch].id = roundId;
            }

            await this.tournamentRepository.updateOne(
                { _id: tournament._id },
                {
                    matches: tournament.matches,
                    ended: ended,
                    currentMatch: tournament.currentMatch + 1,
                }
            );
        }
    }

    async getCurrentTournamentId(): Promise<string> {
        const runningTournament: ITournament = await this.tournamentRepository.findOne({ ended: false }).lean().exec();

        if (runningTournament) {
            return runningTournament._id.toString();
        }

        const tournament = await this.createNewTournament();

        return tournament._id.toString();
    }

    private async createNewTournament() {
        const configs = await this.getTournamentConfigs();
        const teams = shuffle(configs.teams);

        return this.tournamentRepository.create({
            code: configs.code,
            matches: generate(teams),
            currentMatch: 0,
            ended: false,
        });
    }

    private async getTournamentConfigs() {
        return this.appConfigs.tournament;
    }
}
