import { Chance } from "chance";

enum EVENT_NAMES {
    GOAL_H = "goal_H",
    GOAL_A = "goal_A",
    GLOVE_B = "hit_glove_B",
    GLOVE_R = "hit_glove_R",
}

type Event = {
    eventName: string;
    eventTime: number;
}

type TrackingStas = {
    totalGoal: number;
    homeScore: number;
    awayScore: number;
    consecutiveGoal: number;
    currentEvent?: Event;
    previousEvent?: Event;
    nextEvent?: Event;
    previousVoiceEndTime?: number;
    prevGoal?: {
        time?: number;
        team: "H" | "A";
    }
    currentGoal?: {
        time?: number;
        team: "H" | "A";
    },
    isFirstHalf: boolean;
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

type VoiceChoiceConfig = {
    limitDuration?: number;
}

export const DEFAULT_VOICE_DURATION_CONFIG: VoiceDurationConfig = {
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
    },
    goal2nd: {
        2:3,
        3:3,
        4:1
    },
    goal3rd: {
        2:3,
        3:3,
        4:4
    },
    goal4th: {
        2:4,
        3:4,
        4:1
    },
    goal5th: {
        2:4,
        3:2,
        4:1
    },
    fastGoal: {
        2:1,
        3:4,
        4:1
    },
    save: {
        1: 1,
        2: 10,
        3: 5,
        4: 2
    },
    noGoal: {
        2:6,
        3:4
    }
}

const TIME_WITHIN_TO_BE_CONSIDERED_AS_FAST_GOAL = 5;
const GOAL_COUNT_TO_BE_CONSIDERED_AS_FAST_GOAL = 2;
const TIME_TO_BE_CONSIDERED_AS_LAST_GOAL = 25;
const TIME_TO_BE_CONSIDERED_AS_NO_GOAL_WITHIN = 15;

export function generateVoiceWithEventTimeline(args: EventTimelineArgs, config: VoiceDurationConfig): VoiceGenerationResult {
    const events = args.eventName;

    const { initialVoice, initialTracker } = initVoiceEvents(args, config);
    let tracker = initialTracker;
    const { timeline, voice } = initialVoice;
    
    events.forEach((event, index) => {
        const eventTime = args.timeline[index];
        const eventName = event;
        const possibleEventNames: string[] = [];

        const nextEvent = events[index + 1] ? {
            eventName: events[index + 1],
            eventTime: args.timeline[index + 1]
        } : undefined;

        tracker = trackEventBeforeProcess(tracker, {
            eventName,
            eventTime
        }, nextEvent);

        const durationLimit = nextEvent?.eventTime ? Math.ceil(nextEvent.eventTime - eventTime) : undefined;

        if (isNoGoalWithinTime(tracker, TIME_TO_BE_CONSIDERED_AS_NO_GOAL_WITHIN) && !isPreviousEventPassedTime(tracker, TIME_TO_BE_CONSIDERED_AS_NO_GOAL_WITHIN)) {
            const noGoalVoices = getPossibleVoiceArray(config, "noGoal", {
                limitDuration: durationLimit
            });
            const chance = new Chance();
            const chosenVoice = chance.pickone(noGoalVoices);
            if (chosenVoice) {
                timeline.push(TIME_TO_BE_CONSIDERED_AS_NO_GOAL_WITHIN);
                voice.push(chosenVoice.file);
                tracker = trackEventOnVoiceChosen(tracker, TIME_TO_BE_CONSIDERED_AS_NO_GOAL_WITHIN, chosenVoice);
            }
        }

        if (isGoal(eventName)) {
            tracker = trackGoal(tracker, {
                eventTime,
                eventName
            });
            possibleEventNames.push(...getPossibleEventForGoal(tracker, config));

        } else if (isGlove(eventName)) {
            possibleEventNames.push(...getPossibleEventName(config, "save"));

        }

        if (isOverlappingPrevious(tracker)) {
            if (isGoalAndPreviousIsNotGoal(tracker)) {
                const ignoredVoice = voice.pop();
                const ignoredTimeline = timeline.pop();
                console.log(`Ignored voice: ${ignoredVoice} at ${ignoredTimeline}`);
            } else {
                return;
            }
        }
        
        const chance = new Chance();
        const chosenEvent = chance.pickone(possibleEventNames);
        const possibleVoices = getPossibleVoiceArray(config, chosenEvent, {
            limitDuration: durationLimit
        });
        const chosenVoice = chance.pickone(possibleVoices);
        if (chosenVoice) {
            timeline.push(eventTime);
            voice.push(chosenVoice.file);
            tracker = trackEventOnVoiceChosen(tracker, eventTime, chosenVoice);
        }
    });
    return {
        timeline,
        voice
    }
}

function initTracker(firstHalfScoreSequence = "") {
    const tracker: TrackingStas = {
        totalGoal: 0,
        homeScore: 0,
        awayScore: 0,
        consecutiveGoal: 0,
        isFirstHalf: firstHalfScoreSequence === "",
    }

    firstHalfScoreSequence.split("").forEach((score, index, scores) => {
        tracker.totalGoal++;
        tracker.homeScore += score === "H" ? 1 : 0;
        tracker.awayScore += score === "A" ? 1 : 0;
        if (index > 0 && scores[index - 1] !== score) {
            tracker.consecutiveGoal = 0;
        }
        tracker.consecutiveGoal++;
        tracker.currentGoal = {
            team: score as "H" | "A"
        }
    });

    return tracker;
}

function trackGoal(tracker: TrackingStas, {
    eventTime,
    eventName
}: {
    eventTime: number,
    eventName: string
}) {
    const newTracker = { ...tracker }
    newTracker.prevGoal = newTracker.currentGoal;
    newTracker.currentGoal = {
        time: eventTime,
        team: isHomeGoal(eventName) ? "H" : "A"
    }

    if (!isConsecutiveGoal(newTracker)) {
        newTracker.consecutiveGoal = 0;
    }
    newTracker.consecutiveGoal++;
    newTracker.totalGoal++;
    newTracker.awayScore += isAwayGoal(eventName) ? 1 : 0;
    newTracker.homeScore += isHomeGoal(eventName) ? 1 : 0;

    return newTracker;
}

function trackEventBeforeProcess(tracker: TrackingStas, event: Event, nextEvent?: Event) {
    const newTracker = { ...tracker }
    newTracker.previousEvent = newTracker.currentEvent;
    newTracker.currentEvent = event;
    newTracker.nextEvent = nextEvent;
    newTracker.prevGoal = newTracker.currentGoal;
    return newTracker;
}

function trackEventOnVoiceChosen(tracker: TrackingStas, eventTime: number, chosenVoice: Voice) {
    const newTracker = { ...tracker }
    const voiceDuration = chosenVoice?.duration ?? 0;
    newTracker.previousVoiceEndTime = eventTime + voiceDuration;
    return newTracker;
}

function isConsecutiveGoal(tracker: TrackingStas) {
    return tracker.prevGoal && tracker.prevGoal.team === tracker.currentGoal?.team;
}

function isFastGoal(tracker: TrackingStas, timeForConsideration: number, goalCountForConsideration: number) {
    return tracker.totalGoal === goalCountForConsideration && tracker.currentGoal?.time && tracker.currentGoal?.time < timeForConsideration;
}

function getPossibleVoiceArray(config: VoiceDurationConfig, key: string, extraConfigs: VoiceChoiceConfig = {}) {
    const possibeVoices: { file: string, duration: number, index: number, key: string }[] = []
    if (!Object.hasOwn(config, key)) {
        return possibeVoices;
    }
    const durationList: string[] = Object.keys(config[key]).sort((a, b) => parseInt(a) - parseInt(b));
    for (const duration of durationList) {
        const durationNumber = parseInt(duration);
        if (extraConfigs.limitDuration && durationNumber > extraConfigs.limitDuration) {
            if (possibeVoices.length > 0) {
                break;
            }
        }
        for (let i = 1; i <= config[key][durationNumber]; i++) {
            possibeVoices.push({
                key,
                file: `${key}_${duration}_${i}`,
                duration: durationNumber,
                index: i
            });
        }
    }

    return possibeVoices;
}

function getPossibleEventName(config: VoiceDurationConfig, key: string) {
    if (!Object.hasOwn(config, key)) {
        return [];
    }
    return [key];
}

function getPossibleEventForGoal(tracker: TrackingStas, config: VoiceDurationConfig) {
    const possibleEventNames: string[] = [];
    possibleEventNames.push("goal");

    if (isEqualizer(tracker, tracker.homeScore)) {
        possibleEventNames.push(...getPossibleEventName(config, `draw${tracker.homeScore}`));
    }

    if (isConsecutive(tracker)) {
        const actualCheckNumber = tracker.consecutiveGoal > 5 ? 5 : tracker.consecutiveGoal;
        possibleEventNames.push(...getPossibleEventName(config, `goal${ordinal(actualCheckNumber)}`));
    }
    
    if (isFastGoal(tracker, TIME_WITHIN_TO_BE_CONSIDERED_AS_FAST_GOAL, GOAL_COUNT_TO_BE_CONSIDERED_AS_FAST_GOAL)) {
        possibleEventNames.push(...getPossibleEventName(config, `fastGoal`));
    }

    if (isFastGoal(tracker, TIME_WITHIN_TO_BE_CONSIDERED_AS_FAST_GOAL, 1)) {
        possibleEventNames.push(...getPossibleEventName(config, `firstGoal`));
    }

    if (isLastGoal(tracker)) {
        possibleEventNames.push(...getPossibleEventName(config, `lastGoal`));
    }
    
    return possibleEventNames;
}

function isLastGoal(tracker: TrackingStas) {
    return !tracker.isFirstHalf && tracker.currentGoal?.time && tracker.currentGoal?.time > TIME_TO_BE_CONSIDERED_AS_LAST_GOAL;
}

function isEqualizer(tracker: TrackingStas, checkNumber: number) {
    return tracker.homeScore === checkNumber && tracker.awayScore === checkNumber;
}

function isConsecutive(tracker: TrackingStas) {
    return tracker.consecutiveGoal > 0;
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

function isOverlappingPrevious(tracker: TrackingStas) {
    return tracker.previousVoiceEndTime && tracker.currentEvent && tracker.previousVoiceEndTime > tracker.currentEvent?.eventTime;
}

function isGoalAndPreviousIsNotGoal(tracker: TrackingStas) {
    return isGoal(tracker.currentEvent?.eventName ?? "") && !isGoal(tracker.previousEvent?.eventName ?? "");
}

function ordinal(number: number) {
    const digitMap: Record<number, string> = {
        1: "st",
        2: "nd",
        3: "rd"
    }

    return `${number}${Object.hasOwn(digitMap, number) ? digitMap[number] : "th"}`;
}

function initVoiceEvents(args: EventTimelineArgs, config: VoiceDurationConfig): {
    initialVoice: VoiceGenerationResult,
    initialTracker: TrackingStas
} {
    const tracker = initTracker(args.firstHalfScore);

    return {
        initialVoice: {
            timeline: [],
            voice: []
        },
        initialTracker: tracker
    }

}

function isPassedTime(tracker: TrackingStas, time: number) {
    return tracker.currentEvent?.eventTime && tracker.currentEvent?.eventTime > time;
}

function isNoGoalWithinTime(tracker: TrackingStas, time: number) {
    return tracker.totalGoal === 0 && isPassedTime(tracker, time);
}

function isPreviousEventPassedTime(tracker: TrackingStas, time: number) {
    return tracker.previousEvent?.eventTime && tracker.previousEvent?.eventTime >= time;
}
