import { asClass, asValue, AwilixContainer } from "awilix";
import { Table } from "sc-game-base";
import { InGameConsumer, TournamentConsumer, UserDisconnectConsumer, RoundResultConsumer } from "./consumers";
import { Bot, GameCron, ProcessBetQueue } from "./crons";
import { betLogs, bets, results, rounds, tmpBets, tournament } from "./models";

export default class ContainerRegistry extends Table.TableContainerRegistry {
    register(appConfigs: any, definition: any, gameData: any): AwilixContainer<any> {
        super.register(appConfigs, definition, gameData);

        return this.container;
    }

    registerModels() {
        super.registerModels();

        this.container.register({
            roundsRepository: asValue(rounds),
            betsRepository: asValue(bets),
            tempBetsRepository: asValue(tmpBets),
            betLogsRepository: asValue(betLogs),
            tournamentRepository: asValue(tournament),
            resultsRepository: asValue(results),
        });
    }

    registerCrons() {
        super.registerCrons();

        this.container.register({
            bot: asClass(Bot).singleton(),
            gameCron: asClass(GameCron).singleton().proxy(),
            processBetQueue: asClass(ProcessBetQueue).singleton().proxy(),
        });
    }

    registerConsumers() {
        super.registerConsumers();

        this.container.register({
            userDisconnectConsumer: asClass(UserDisconnectConsumer).singleton(),
            inGameConsumer: asClass(InGameConsumer).singleton(),
            tournamentConsumer: asClass(TournamentConsumer).singleton().proxy(),
            roundResultConsumer: asClass(RoundResultConsumer).singleton().proxy(),
        });
    }
}
