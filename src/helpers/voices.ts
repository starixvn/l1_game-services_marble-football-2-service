export type VoiceGenerationArgs = {
    isFirstHalf: boolean;
    timeline: number[];
    result: string;
}

export type VoiceGenerationResult = {
    timeline: number[];
    voice: string[];
}

export function generateVoice(args: VoiceGenerationArgs): VoiceGenerationResult {
    return {
        timeline: [9, 13, 17],
        voice: ['goal_1_1', 'goal_1_2', 'goal_1_3'],
    }
}

const FAST_GOAL_TIME = 5;

type TrackingStas = {
    totalGoal: number;
    homeScore: number;
    awayScore: number;
    consecutiveGoal: number;
    currentTimeGoal?: number;
    previousTimeGoal?: number;
    nextTimeGoal?: number;
}

function isDraw(stats: TrackingStas, scoreEachTeam: number): boolean {
    return stats.homeScore === stats.awayScore && stats.homeScore === scoreEachTeam;
}

function isConsecutiveGoal(stats: TrackingStas, targetScore: number): boolean {
    return stats.consecutiveGoal === targetScore;
}

function isFastGoal(stats: TrackingStas): boolean {
    return Boolean(stats.currentTimeGoal && stats.currentTimeGoal < FAST_GOAL_TIME);
}

function isFirstGoal(stats: TrackingStas): boolean {
    return Boolean(!stats.previousTimeGoal && stats.currentTimeGoal && stats.currentTimeGoal < FAST_GOAL_TIME);
}

function isLastGoal(stats: TrackingStas, isSecondHalf: boolean): boolean {
    return Boolean(isSecondHalf && stats.currentTimeGoal && stats.currentTimeGoal > 2 * FAST_GOAL_TIME);
}
