import crypto from "crypto";
import appConfigs from "../app-configs";
import fs from "fs";
import path from "path";

import { DEFAULT_VOICE_DURATION_CONFIG, generateVoiceWithEventTimeline } from "../helpers/voices";

type EventTimeline = { timeLine: number[], eventName: string[] }

const NUMBER_OF_VIDEOS: Record<string, number> = {
    AAAA: 2,
    AAAH: 6,
    AAA: 2,
    AAHA: 2,
    AAHH: 2,
    AAH: 2,
    AA: 2,
    AHAA: 3,
    AHAH: 3,
    AHA: 2,
    AHHA: 4,
    AHHH: 5,
    AHH: 2,
    AH: 15,
    A: 15,
    HAAA: 2,
    HAAH: 2,
    HAA: 11,
    HAHA: 2,
    HAHH: 2,
    HAH: 12,
    HA: 2,
    HHAA: 2,
    HHAH: 3,
    HHA: 8,
    HHHA: 2,
    HHHH: 2,
    HHH: 2,
    HH: 4,
    H: 19
  }

const voiceConfig = DEFAULT_VOICE_DURATION_CONFIG;

async function generateVoiceData() {
    const matches = generateMatch();

    for (const [index, match] of matches.entries()) {
        processMatch(match, index);
    }

    console.log("END OF PROCESSING, TOTAL: ", matches.length);
}

function generateAllPossibleResults() {
    const results = [];
    for (const key in NUMBER_OF_VIDEOS) {
        const numberOfVideos = NUMBER_OF_VIDEOS[key];
        for (let i = 0; i < numberOfVideos; i++) {
            results.push(`${key}-${i}`);
        }
    }

    return results;
}

function generateMatch() {
    const results = generateAllPossibleResults();
    
    const matchCombinations = [];
    
    for (const firstHalf of results) {
        for (const secondHalf of results) {
            matchCombinations.push({
                firstHalf,
                secondHalf
            });
        }
    }
    
    return matchCombinations;
}
function processMatch(match: { firstHalf: string, secondHalf: string }, index: number) {
    console.log("MATCH NUMBER : ", index)
    const firstHalfVideoName = getVideoName(match.firstHalf);
    const secondHalfVideoName = getVideoName(match.secondHalf);
    const eventMapObject = readJsonFile("event-map.json");

    const firstHalfTimeline = getVideoTimelineFromObject(eventMapObject, match.firstHalf);
    const secondHalfTimeline = getVideoTimelineFromObject(eventMapObject, match.secondHalf);

    console.log("--------- FIRST HALF ---------");
    console.log("Result: ", match.firstHalf);
    console.log("Video: ", firstHalfVideoName);
    console.log("Events:", firstHalfTimeline.eventName);
    console.log("Timeline:", firstHalfTimeline.timeLine);

    const firstHalfVoiceTimeline = generateVoiceWithEventTimeline({
        eventName: firstHalfTimeline.eventName,
        timeline: firstHalfTimeline.timeLine,
    }, voiceConfig);


    console.log("VOICES:");
    console.log("Voice Events: ", firstHalfVoiceTimeline.voice);
    console.log("Voice Timeline: ", firstHalfVoiceTimeline.timeline);

    console.log("--------- SECOND HALF ---------");
    console.log("Result: ", match.secondHalf);
    console.log("Video: ", secondHalfVideoName);
    console.log("Events:", secondHalfTimeline.eventName);
    console.log("Timeline:", secondHalfTimeline.timeLine);
    const secondHalfVoiceTimeline = generateVoiceWithEventTimeline({
        eventName: secondHalfTimeline.eventName,
        timeline: secondHalfTimeline.timeLine,
        firstHalfVoices: firstHalfVoiceTimeline.voice,
        firstHalfScore: match.firstHalf
    }, voiceConfig);
    console.log("VOICES:");
    console.log("Voice Events: ", secondHalfVoiceTimeline.voice);
    console.log("Voice Timeline: ", secondHalfVoiceTimeline.timeline);
}

function getVideoName(indexedResult: string) {
    return crypto.createHash("sha256").update(`${indexedResult}`).digest("hex");
}

function getVideoTimelineFromObject(object: Record<string, EventTimeline>, result: string) {
    const eventTimeline = object[result];
    return eventTimeline;
}

async function getEventTimeline(videoName: string): Promise<{ timeLine: number[], eventName: string[] }> {
    const url = new URL(`event_${videoName}.json`, appConfigs.liveStreamServer);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            console.log(`Failed to fetch video timeline ${url} with error: ${response.status}`);
            return { timeLine: [], eventName: [] };
        }

        return response.json();
    } catch (error) {
        console.log(`Failed to get video timeline ${url} with error: ${error}`);
        return { timeLine: [], eventName: [] };
    }
}

async function saveAllEventTimeline() {
    console.log("Getting event timeline map from stream server");
    const results = generateAllPossibleResults();
    const resultEventTimelineMap: Record<string, any> = {};
    for (const result of results) {
        const videoName = getVideoName(result);
        const eventTimeline = await getEventTimeline(videoName);
        resultEventTimelineMap[result] = eventTimeline;
    }

    saveFiles("event-map.json", JSON.stringify(resultEventTimelineMap, null, 2));
}

function readJsonFile(filename: string) {
    const dirname = path.dirname(filename);
    const filePath = path.join(dirname, "src", "timelines", filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}


function saveFiles(filename: string, data: string) {
    const dirname = path.dirname(filename);
    const filePath = path.join(dirname, "src", "timelines", filename);

    fs.writeFile(filePath, data, (err) => {
        if (err) {
            console.error("Error writing data to file", err);
        } else {
            console.log(`File saved as ${filename}`);
        }
    });
}

(async () => {
    await saveAllEventTimeline();
    await generateVoiceData();
})();