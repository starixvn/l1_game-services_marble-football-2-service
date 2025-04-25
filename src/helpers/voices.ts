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
        timeline: [],
        voice: [],
    }
}
