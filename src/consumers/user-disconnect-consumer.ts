import Bot from "../crons/bot";
import GameData from "../game-data";
import { Core } from "sc-game-base";

export default class UserDisconnectConsumer extends Core.BaseEventConsumers.UserDisconnectConsumer {
    declare gameData: GameData;
    bot: Bot;

    constructor(gameData: GameData, bot: Bot) {
        super(gameData);
        this.gameData = gameData;
        this.bot = bot;
    }
}
