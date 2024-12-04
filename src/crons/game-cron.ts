import { Table } from "sc-game-base";
import GameData from "../game-data";
import GameDefinition from "../game-definition";
import AppConfigs from "../app-configs";
import { TournamentConsumer } from "../consumers";

export default class GameCron extends Table.Crons.TableGameCron {
    declare gameData: GameData;
    declare definition: GameDefinition;
    declare appConfigs: typeof AppConfigs;

    tournamentConsumer: TournamentConsumer;

    constructor(container: any) {
        super(container);

        this.gameData.liveStreamServer = this.appConfigs.liveStreamServer;
        this.tournamentConsumer = container.tournamentConsumer;
    }

    override resetForNewRound() {
        super.resetForNewRound();
        this.gameData.playerBetCount = {};
    }

    async getVideoTimelineForHalf(videoName: string) {
        const url = new URL(`${videoName}.json`, this.appConfigs.liveStreamServer);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                this.logService.logError(`Failed to fetch video timeline ${url} with error: ${response.status}`);
                return [];
            }

            const data = await response.json();

            return data.timeLine;
        } catch (error) {
            this.logService.logError(`Failed to get video timeline ${url} with error: ${error}`);
            return [];
        }
    }

    async getVideoTimeline() {
        this.gameData.result.firstHalfTimeline = await this.getVideoTimelineForHalf(this.gameData.result.firstHalfVideo);

        this.gameData.result.secondHalfTimeline = await this.getVideoTimelineForHalf(this.gameData.result.secondHalfVideo);
    }

    async generateRoundData() {
        await this.roundResultConsumer.generateResult();

        this.gameData.settlementResultFromAdmin = {};
    }

    publishVideoStream() {
        const videoResult = {
            firstHalfVideo: this.gameData.result.firstHalfVideo,
            secondHalfVideo: this.gameData.result.secondHalfVideo,
            firstHalfTimeline: this.gameData.result.firstHalfTimeline,
            secondHalfTimeline: this.gameData.result.secondHalfTimeline,
            firstHalf: this.gameData.result.firstHalf,
            secondHalf: this.gameData.result.secondHalf,
        };

        this.runningRoundInfoPublisher.publishToAllUsers({ videoResult });
    }

    async publishTournament() {
        const tournament = await this.tournamentConsumer.getCurrentTournament();

        this.runningRoundInfoPublisher.publishToAllUsers({ tournament });
    }

    override async proceed() {
        const { durations } = this.definition;

        if (this.gameData.remainingTime === durations.wholeRound) {
            await this.checkGameStatus();
        }

        if (!this.gameData.disabled) {
            this.gameData.remainingTime--;
        }

        const remainingTime = this.gameData.remainingTime;

        if (remainingTime === durations.startingRound) {
            await this.publishTournament();
        }

        if (this.isStartingTime(remainingTime, durations)) {
            this.resetForNewRound();
            this.bot?.reset();

            await this.generateRoundData();
        }

        if (remainingTime === durations.placingBets) {
            this.gameStatusPublisher.publishStartPlacingBetStatus();
        }

        if (remainingTime === durations.lockingBet - 1) {
            this.gameStatusPublisher.publishEndPlacingBetStatus();
        }

        if (remainingTime === durations.streamingVideo) {
            await this.getVideoTimeline();
            this.publishVideoStream();
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
