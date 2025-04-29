import { Chance } from "chance";

enum EVENT_NAMES {
    GOAL_H = "goal_H",
    GOAL_A = "goal_A",
    GLOVE_B = "hit_glove_B",
    GLOVE_R = "hit_glove_R",
}

type TrackingStas = {
    totalGoal: number;
    homeScore: number;
    awayScore: number;
    consecutiveGoal: number;
    currentEvent?: number;
    previousEvent?: number;
    nextEvent?: number;
    previousVoiceEndTime?: number;
    prevGoal?: {
        time: number;
        team: "H" | "A";
    }
    currentGoal?: {
        time: number;
        team: "H" | "A";
    }
}

export type VoiceGenerationArgs = {
    timeline: number[];
    result: string;
    firstHalfScoreSequence?: string;
}

export type EventTimelineArgs = {
    timeline: number[];
    eventName: string[];
    firstHalfScore?: string;
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

type Voice = {
    file: string;
    duration: number;
    index: number;
    key: string;
}

export const VOICE_DURATION_CONFIG: VoiceDurationConfig = {
    goal: {
        1: 7,
        2: 12,
        3: 4
    },
    draw1: {
        1: 2,
        2: 2,
        3: 5,
        4: 1
    },
    draw2: {
        2: 6,
        3: 4
    },
    draw3: {
        2: 4,
        3: 5,
        4: 1
    },
    draw4: {
        2: 3,
        3: 4,
        4: 2
    }
}


export function generateVoiceWithEventTimeline(args: EventTimelineArgs, config: VoiceDurationConfig): VoiceGenerationResult {
    console.log(args.eventName)
    console.log(args.timeline)

    const voice: string[] = [];
    const timeline: number[] = [];
    const tracker = initTracker(args.firstHalfScore);

    const events = args.eventName;

    events.forEach((event, index) => {
        const eventTime = args.timeline[index];
        const eventName = event;
        const possibleVoices: Voice[] = [];
        
        if (isGoal(eventName)) {
            tracker.prevGoal = tracker.currentGoal;

            tracker.currentGoal = {
                time: eventTime,
                team: isHomeGoal(eventName) ? "H" : "A"
            }

            if (tracker.prevGoal && tracker.prevGoal.team !== tracker.currentGoal?.team) {
                tracker.consecutiveGoal = 0;
            }
            tracker.consecutiveGoal++;
            tracker.totalGoal++;
            tracker.awayScore += isAwayGoal(eventName) ? 1 : 0;
            tracker.homeScore += isHomeGoal(eventName) ? 1 : 0;

            if (tracker.previousVoiceEndTime && tracker.previousVoiceEndTime > eventTime) {
                return;
            }

            possibleVoices.push(...getPossibleVoiceArray(config, "goal"));

            for (const checkNumber of [1,2,3,4]) {
                if (isEqualizer(tracker, checkNumber)) {
                    possibleVoices.push(...getPossibleVoiceArray(config, `draw${checkNumber}`));
                }
            }
        }
        
        const chance = new Chance();
        const chosenVoice = chance.pickone(possibleVoices);
        tracker.previousVoiceEndTime = eventTime + chosenVoice.duration;

        timeline.push(eventTime);
        voice.push(chosenVoice.file);
    });

    return {
        timeline,
        voice
    }
}

export function generateVoice(args: VoiceGenerationArgs, config: VoiceDurationConfig): VoiceGenerationResult {
    
    const timeline: number[] = []
    const voice: string[] = []
    const goalTimeline = args.timeline;

    const tracker = initTracker(args.firstHalfScoreSequence);

    goalTimeline.forEach((goal, index) => {
        tracker.totalGoal++;
        tracker.currentEvent = goal;
        tracker.homeScore += args.result[index] === "H" ? 1 : 0;
        tracker.awayScore += args.result[index] === "A" ? 1 : 0;

        if (index > 0) {
            tracker.previousEvent = goalTimeline[index - 1];
        }
        
        if (index < goalTimeline.length - 1) {
            tracker.nextEvent = goalTimeline[index + 1];
        }
        if (tracker.previousVoiceEndTime && tracker.previousVoiceEndTime > goal) {
            return;
        }

        const goalVoices = getPossibleVoiceArray(config, "goal");

        for (const checkNumber of [1,2,3,4]) {
            if (isEqualizer(tracker, checkNumber)) {
                goalVoices.push(...getPossibleVoiceArray(config, `draw${checkNumber}`));
            }
        }
        const chance = new Chance();
        const chosenVoice = chance.pickone(goalVoices);
        tracker.previousVoiceEndTime = goal + chosenVoice.duration;

        timeline.push(goal);
        voice.push(chosenVoice.file);

    });

    return {
        timeline,
        voice,
    }
}
function initTracker(firstHalfScoreSequence: string = "") {
    const tracker: TrackingStas = {
        totalGoal: 0,
        homeScore: 0,
        awayScore: 0,
        consecutiveGoal: 0,
    }

    firstHalfScoreSequence.split("").forEach((score, index, scores) => {
        tracker.totalGoal++;
        tracker.homeScore += score === "H" ? 1 : 0;
        tracker.awayScore += score === "A" ? 1 : 0;
        if (index > 0) {
            if (scores[index - 1] !== score) {
                tracker.consecutiveGoal = 0;
            }
        }
        tracker.consecutiveGoal++;
    });

    return tracker;
}


function getPossibleVoiceArray(config: VoiceDurationConfig, key: string, extraConfigs = {}) {
    const possibeVoices: { file: string, duration: number, index: number, key: string }[] = []
    if (!Object.hasOwn(config, key)) {
        return possibeVoices;
    }

    for (const duration in config[key]) {
        for (let i = 1; i <= config[key][duration]; i++) {
            possibeVoices.push({
                key,
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

function isGoal(eventName: string) {
    return eventName === EVENT_NAMES.GOAL_H || eventName === EVENT_NAMES.GOAL_A;
}

function isGlove(eventName: string) {
    return eventName === EVENT_NAMES.GLOVE_B || eventName === EVENT_NAMES.GLOVE_R;
}

function isHomeGoal(eventName: string) {
    return eventName === EVENT_NAMES.GOAL_H;
}

function isAwayGoal(eventName: string) {
    return eventName === EVENT_NAMES.GOAL_A;
}

