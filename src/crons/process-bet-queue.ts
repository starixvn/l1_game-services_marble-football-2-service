import { TableProcessBetQueue } from "sc-game-base/src/table/crons";
import GameData from "../game-data";
import { helpers } from "sc-common";
import { isWithinBettingTime } from "../helpers/game-timing";
import GameDefinition from "../game-definition";

type BetPayload = {
    amount: number;
    betChoice: string;
    roundId: number;
    clientSeed: Date;
    freeBet?: boolean;
    mode?: string;
};

export default class ProcessBetQueue extends TableProcessBetQueue {
    declare gameData: GameData;
    declare definition: GameDefinition;

    adjustTotalBets(player: any, bet: BetPayload, rate: number) {
        super.adjustTotalBets(player, bet, rate);
        this.adjustPlayerBetCount(player, bet.betChoice);
    }

    adjustPlayerBetCount(player: any, betChoice: string) {
        if (this.definition.choices.includes(betChoice)) {
            if (!this.gameData.playerBetCount[betChoice]) {
                this.gameData.playerBetCount[betChoice] = [];
            }
            !this.gameData.playerBetCount[betChoice].includes(player.UID) && this.gameData.playerBetCount[betChoice].push(player.UID);
        }
    }

    composeBettingTimeValidationCriteria(roundId: number): { failure: boolean; notice: { errorCode: string; }; }[] {
        return [
            {
                failure: roundId !== this.gameData.roundId,
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            },
            {
                failure: !isWithinBettingTime(this.gameData.remainingTime, this.definition.durations),
                notice: { errorCode: helpers.noticeHelper.placeBetNextRound },
            },
        ];
    }
}
