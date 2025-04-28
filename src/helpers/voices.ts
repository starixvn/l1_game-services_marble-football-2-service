import { Chance } from "chance";

type TrackingStas = {
    totalGoal: number;
    homeScore: number;
    awayScore: number;
    consecutiveGoal: number;
    currentTimeGoal?: number;
    previousTimeGoal?: number;
    nextTimeGoal?: number;
    voiceEndIn?: number
}

export type VoiceGenerationArgs = {
    isFirstHalf: boolean;
    timeline: number[];
    result: string;
}

export type VoiceGenerationResult = {
    timeline: number[];
    voice: string[];
}

export type VoiceDurationConfig = {
    [key: string]: {
        [key: number]: number;
    }
}

export const VOICE_DURATION_CONFIG: VoiceDurationConfig = {
    goal: {
        1: 7,
        2: 12,
        3: 4
    },
}

export function generateVoice(args: VoiceGenerationArgs, config: VoiceDurationConfig): VoiceGenerationResult {

    const timeline: number[] = []
    const voice: string[] = []
    const goalTimeline = args.timeline;

    const tracker: TrackingStas = {
        totalGoal: 0,
        homeScore: 0,
        awayScore: 0,
        consecutiveGoal: 0,
    }

    goalTimeline.forEach((goal, index) => {
        tracker.totalGoal++;
        tracker.consecutiveGoal++;
        tracker.currentTimeGoal = goal;

        if (index > 0) {
            tracker.previousTimeGoal = goalTimeline[index - 1];
        }
        
        if (index < goalTimeline.length - 1) {
            tracker.nextTimeGoal = goalTimeline[index + 1];
        }
        if (tracker.voiceEndIn && tracker.voiceEndIn > goal) {
            return;
        }

        const goalVoices = getPossibleVoiceArray(config, "goal");

        const chance = new Chance();
        const chosenVoice = chance.pickone(goalVoices);
        tracker.voiceEndIn = goal + chosenVoice.duration;

        timeline.push(goal);
        voice.push(chosenVoice.file);

    });

    return {
        timeline,
        voice,
    }
}


function getPossibleVoiceArray(config: VoiceDurationConfig, key: string) {
    const possibeVoices = []

    for (const duration in config[key]) {
        for (let i = 1; i <= config[key][duration]; i++) {
            possibeVoices.push({
                file: `${key}_${duration}_${i}`,
                duration: parseInt(duration),
                index: i
            });
        }
    }

    return possibeVoices;
}

function isEqualizer(tracker: TrackingStas, checkNumber: number) {
    return tracker.homeScore === checkNumber && tracker.awayScore === checkNumber;
}
