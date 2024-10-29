import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import GameDefinition from "../game-definition";
import GameManagementApiClientFactory from "sc-game-base/src/core/game-management-api";
import { Core } from "sc-game-base";
import { RoundQuery } from "sc-game-base/src/core/query-apis";

export default class InGameConsumer extends TableInGameConsumer {
    declare gameData: GameData;
    declare definition: GameDefinition;

    constructor(
        definition: GameDefinition,
        gameData: GameData,
        roundQuery: RoundQuery,
        publisher: Core.BaseEventPublishers.BaseEventPublisher,
        getBalance: any,
        gameManagementApiClientFactory: GameManagementApiClientFactory
    ) {
        super(definition, gameData, roundQuery, publisher, getBalance, gameManagementApiClientFactory);
    }
}
