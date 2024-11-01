import { halfConfigs } from "./../match-configs";
import { Table } from "sc-game-base";
import GameData, { MatchConfigType } from "../game-data";
import Chance from "chance";
import { calculateFulltimeOdds, calculateHalfOdds } from "../helpers/odds-helper";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    chance = new Chance();

    override resetForNewRound() {
        super.resetForNewRound();
        this.gameData.playerBetCount = {};
    }

    getMatchConfig(): MatchConfigType {
        const firstHalf = this.chance.pickone(halfConfigs);
        const secondHalf = this.chance.pickone(halfConfigs);

        return {
            firstHalf,
            secondHalf,
            ou: firstHalf.ou + secondHalf.ou,
        };
    }

    calculateOdds() {
        const matchConfig = this.gameData.matchConfig;
        const firstHalfOdds = calculateHalfOdds(matchConfig.firstHalf, this.gameData.gameConfigs?.margin);
        const fulltimeOdds = calculateFulltimeOdds(this.gameData.matchConfig, this.gameData.gameConfigs?.margin);

        const odds = {
            home: fulltimeOdds.odds.home,
            draw: fulltimeOdds.odds.draw,
            away: fulltimeOdds.odds.away,
            over: fulltimeOdds.odds.over,
            under: fulltimeOdds.odds.under,
            firstHalfHome: firstHalfOdds.odds.home,
            firstHalfDraw: firstHalfOdds.odds.draw,
            firstHalfAway: firstHalfOdds.odds.away,
            firstHalfOver: firstHalfOdds.odds.over,
            firstHalfUnder: firstHalfOdds.odds.under,
        };

        return {
            odds,
            overUnderValue: fulltimeOdds.ou,
            firstHalfOverUnderValue: firstHalfOdds.ou,
        };
    }

    async generateRoundData() {
        this.gameData.matchConfig = this.getMatchConfig();

        const { odds, overUnderValue, firstHalfOverUnderValue } = this.calculateOdds();

        this.gameData.matchConfig.firstHalf.ou = firstHalfOverUnderValue;
        this.gameData.matchConfig.ou = overUnderValue;
        this.gameData.odds = odds;

        await this.roundResultConsumer.generateResult();

        this.gameData.settlementResultFromAdmin = {};
    }

    publishRoundData() {}

    override async proceed() {
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.wholeRound) {
            await this.checkGameStatus();
        }

        const remainingTime = this.gameData.remainingTime;

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        if (this.isStartingTime(remainingTime, durations)) {
            this.resetForNewRound();
            this.bot && this.bot.reset();
            this.appConfigs.enabledBoostedOdds && (await this.updatePromotionOddsAndNotify());

            await this.generateRoundData();
        }

        if (remainingTime === durations.placingBets + 1) {
            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (remainingTime === durations.lockingBet) {
            this.gameStatusPublisher.publishEndPlacingBetStatus();
            this.publishRoundData();
        }

        if (remainingTime < 0) {
            this.gameData.remainingTime = durations.wholeRound;

            await this.settleGameRoundConsumer.settleRound();
        }

        if (this.isDuringBetTime(remainingTime)) {
            this.bot && (await this.bot.run());
            this.runningRoundInfoPublisher.publish();
        }
    }

    isDuringBetTime(remainingTime: number) {
        const { placingBets, lockingBet } = this.definition.durations;

        return remainingTime < placingBets && remainingTime > lockingBet;
    }
}
