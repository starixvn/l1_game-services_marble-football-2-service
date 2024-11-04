import type appConfigs from "../app-configs";
import { shuffle } from "../helpers";
import generate from "../helpers/tournament/generate";
import type { tournament } from "../models";
import type { ITournament } from "../models/tournaments";

export default class TournamentConsumer {
    tournamentRepository: typeof tournament;
    appConfigs: typeof appConfigs;

    constructor(container: any) {
        this.tournamentRepository = container.tournamentRepository;
        this.appConfigs = container.appConfigs;
    }

    async getTournamentIdForNextRound(): Promise<string> {
        const runningTournament: ITournament = await this.tournamentRepository.findOne({ ended: false }).lean().exec();

        if (runningTournament) {
            await this.tournamentRepository.updateOne(
                { _id: runningTournament._id },
                {
                    ended: runningTournament.currentMatch + 1 >= runningTournament.matches.length,
                    currentMatch: runningTournament.currentMatch + 1,
                }
            );

            return runningTournament._id.toString();
        }

        const tournament = await this.createNewTournament();

        return tournament._id.toString();
    }

    async createNewTournament() {
        const configs = await this.getTournamentConfigs();
        const teams = shuffle(configs.teams);

        return this.tournamentRepository.create({
            code: configs.code,
            matches: generate(teams),
            currentMatch: 0,
            ended: false,
        });
    }

    async getTournamentConfigs() {
        return this.appConfigs.tournament;
    }
}
