import { Table } from "sc-game-base";
import GameData from "../game-data";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    resetForNewRound() {
        super.resetForNewRound();
        this.gameData.playerBetCount = {};
    }

    override async getSettingForNewRound(): Promise<void> {
        await super.getSettingForNewRound();
    }
}
