import { TableInGameConsumer } from "sc-game-base/src/table/event-consumers";
import GameData from "../game-data";
import { calculateUserBetPercentage, roundUserBetPercentage } from "../helpers/bet-percentage";

export default class InGameConsumer extends TableInGameConsumer {
    declare gameData: GameData;

    async buildPayload(realPlayer: any) {
        const payload = await super.buildPayload(realPlayer);
        const { playerBetCount } = this.gameData;
        const userBetPercentage = this.getUserBetPercentage(playerBetCount);
        return { ...payload, userBetPercentage };
    }

    getUserBetPercentage(playerBetCount: Record<string, string[]>) {
        return roundUserBetPercentage(calculateUserBetPercentage(playerBetCount));
    }

    async consume(realPlayer: any) {
        const { remainingTime, gameConfigs, umMessages } = this.gameData;
        const disabled = !gameConfigs || !gameConfigs.enabled;
        if (disabled) {
            realPlayer.socketClient.emit(this.definition.name, { remainingTime, um: disabled, um_message: umMessages });
        }

        const payload = await this.buildPayload(realPlayer);
        const { red, avatarId, type, rate } = payload.user;
        const player = {
            id: realPlayer.UID,
            name: realPlayer.profile.name,
            red,
            avatarId,
            type,
            rate,
        };

        if (!this.gameData.players[realPlayer.UID]) {
            this.gameData.players[realPlayer.UID] = player;
        }

        realPlayer.socketClient.emit(this.definition.name, payload);
    }
}
