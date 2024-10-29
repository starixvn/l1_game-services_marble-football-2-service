import { BaseEventConsumers } from "sc-game-base/src/core";
import GameData from "../game-data";
import GameDefinition from "../game-definition";

export type BetPayload = {
    roundId: number;
    amount: number;
    m: any;
    receivedTime: Date;
    mode: any;
    clientSentTime: Date;
    time: Date;
};

export default class PlaceBetConsumer extends BaseEventConsumers.PlaceBetConsumer {
    declare gameData: GameData;
    declare definition: GameDefinition;
}
