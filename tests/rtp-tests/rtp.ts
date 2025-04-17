import path from "path";
import fs from "fs/promises"; // Using promises version for better async handling
import { generateResult, getSettlementResult } from "../../src/helpers/result-helper";
import { firstHalfConfig, secondHalfConfigs } from "../../src/match-configs";
import { securePickOne } from "sc-core-rng";
import { calculateLiveOdds, calculatePreMatchOdds } from "../../src/helpers/odds-helper";
import { BET_CHOICES } from "../../src/constants";

type BetResults = Record<keyof typeof BET_CHOICES, number>;

const margins = [
    {
        max: 99,
        home: 0.02,
        homeLive: 0.02,
        away: 0.02,
        awayLive: 0.02,
        draw: 0.02,
        drawLive: 0.02,
        over: 0.05,
        overLive: 0.04,
        under: 0.05,
        underLive: 0.04,
        odd: 0.05,
        oddLive: 0.05,
        even: 0.05,
        evenLive: 0.05,
    },
];

// Constants
const INITIAL_RESULTS: BetResults = {
    home: 0,
    away: 0,
    draw: 0,
    over: 0,
    under: 0,
    odd: 0,
    even: 0,
    homeLive: 0,
    awayLive: 0,
    drawLive: 0,
    overLive: 0,
    underLive: 0,
    oddLive: 0,
    evenLive: 0,
};

const choices = Object.values(BET_CHOICES);

// Helper functions
async function saveData(filename: string, data: any): Promise<void> {
    try {
        const dirname = path.dirname(filename);
        const filePath = path.join(dirname, "tests", "rtp-tests", "result", filename);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Data saved as ${filename}`);
    } catch (err) {
        console.error("Error writing data:", err);
        throw err;
    }
}

function calculateOdds(preMatchOdds: any, liveOdds: any) {
    return {
        [BET_CHOICES.home]: preMatchOdds[BET_CHOICES.home],
        [BET_CHOICES.away]: preMatchOdds[BET_CHOICES.away],
        [BET_CHOICES.draw]: preMatchOdds[BET_CHOICES.draw],
        [BET_CHOICES.over]: preMatchOdds[BET_CHOICES.over],
        [BET_CHOICES.under]: preMatchOdds[BET_CHOICES.under],
        [BET_CHOICES.odd]: preMatchOdds[BET_CHOICES.odd],
        [BET_CHOICES.even]: preMatchOdds[BET_CHOICES.even],
        [BET_CHOICES.homeLive]: liveOdds[BET_CHOICES.homeLive],
        [BET_CHOICES.awayLive]: liveOdds[BET_CHOICES.awayLive],
        [BET_CHOICES.drawLive]: liveOdds[BET_CHOICES.drawLive],
        [BET_CHOICES.overLive]: liveOdds[BET_CHOICES.overLive],
        [BET_CHOICES.underLive]: liveOdds[BET_CHOICES.underLive],
        [BET_CHOICES.oddLive]: liveOdds[BET_CHOICES.oddLive],
        [BET_CHOICES.evenLive]: liveOdds[BET_CHOICES.evenLive],
    };
}

function calculateRTP(wins: BetResults, bets: BetResults): BetResults {
    return Object.keys(wins).reduce(
        (acc, key) => ({
            ...acc,
            [key]: wins[key as keyof BetResults] / bets[key as keyof BetResults],
        }),
        { ...INITIAL_RESULTS }
    );
}

// Main RTP calculation function
function calculateRoundRTP(turn: number, allRoundWin: any, allRoundBets: any): any {
    const totalTurnWin = { ...INITIAL_RESULTS } as any;
    const totalTurnBets = { ...INITIAL_RESULTS } as any;

    for (let i = 0; i < turn; i++) {
        const matchConfig = {
            firstHalfConfig,
            secondHalfConfig: securePickOne(secondHalfConfigs),
        };

        const preMatchOdds = calculatePreMatchOdds(matchConfig, margins);
        const result = generateResult({ matchConfig, numberOfVideos: {} });
        const liveOdds = calculateLiveOdds(matchConfig.secondHalfConfig, result.firstHalf, margins);
        const odds = calculateOdds(preMatchOdds, liveOdds);
        const settlementResult = getSettlementResult(result) as any;

        choices.forEach((choice) => {
            if (odds[choice] > 1 && odds[choice] <= 50) {
                const betAmount = 1;
                totalTurnBets[choice] += betAmount;
                allRoundBets[choice] += betAmount;

                if (settlementResult[choice]) {
                    totalTurnWin[choice] += odds[choice] * betAmount;
                    allRoundWin[choice] += odds[choice] * betAmount;
                }
            }
        });
    }

    return { rtp: calculateRTP(totalTurnWin, totalTurnBets) };
}

// Main execution
async function main() {
    console.time("RTP");

    const ROUND_IN_BATCH = 1000;
    const TOTAL_BATCHES = 100;

    const allRoundWin = { ...INITIAL_RESULTS };
    const allRoundBets = { ...INITIAL_RESULTS };
    const rtpResults: any[] = [];

    Array.from({ length: TOTAL_BATCHES }, () => {
        const { rtp } = calculateRoundRTP(ROUND_IN_BATCH, allRoundWin, allRoundBets);
        rtpResults.push(rtp);
    });

    const finalRTP = calculateRTP(allRoundWin, allRoundBets);

    console.timeEnd("RTP");

    await Promise.all([saveData("all_win_real.json", finalRTP), saveData("rtp_real.json", rtpResults)]);
}

// Execute and handle errors
main().catch(console.error);
