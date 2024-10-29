import { TableGameConfigBot } from "sc-game-base/src/table/crons";
import GameData from "../game-data";

export default class Bot extends TableGameConfigBot {
    declare gameData: GameData;

    updateBalanceAndPublishBetPayload(botId: string, choice: string, amount: number, balance: number) {
        if (this.gameData.players[botId]) {
            this.gameData.players[botId].red = balance;
        }
        this.updatePlayerBetCount(botId, choice);
    }

    updatePlayerBetCount(playerId: string, choice: string) {
        if (this.definition.choices.includes(choice)) {
            if (!this.gameData.playerBetCount[choice]) {
                this.gameData.playerBetCount[choice] = [];
            }
            !this.gameData.playerBetCount[choice].includes(playerId) && this.gameData.playerBetCount[choice].push(playerId);
        }
    }

    override addToPlayersAndPublish(bot: any) {
        this.gameData.players[bot.id] = bot;
    }

    override removeBot(botId: string) {
        delete this.gameData.players[botId];
        delete (this.botsInRoom as any)[botId];
    }
}
