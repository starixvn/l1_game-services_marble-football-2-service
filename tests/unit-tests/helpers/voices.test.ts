import Chance from 'chance';
import { generateVoice } from '../../../src/helpers/voices';

const chance = new Chance();

function mockPickone<T>(mockValues: T[]): () => void {
  const originalPickone = Chance.prototype.pickone;
  
  let currentIndex = 0;
  
  Chance.prototype.pickone = function<U>(_arr: U[]): U {
    const value = mockValues[currentIndex];
    currentIndex = (currentIndex + 1) % mockValues.length;
    return value as unknown as U;
  };
  
  return () => {
    Chance.prototype.pickone = originalPickone;
  };
}

describe('generateVoice', () => {
 describe('random goal', () => {

    const timeline = [6, 12];
    const result = "AA";


    it('should generate voice for goal', () => {
        // Arrange
        const mockVoices = [
            { file: 'goal_1_1', duration: 1, index: 1 },
            { file: 'goal_1_2', duration: 1, index: 2 }
        ];
        
        const restore = mockPickone(mockVoices);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 
                    1: 1,
                    2: 1,
                    3: 1
                }
            });

            // Assert
            expect(actual.voice).toEqual(['goal_1_1', 'goal_1_2']);
        } finally {
            restore();
        }
    });

    it('should not generate voice overlapping the previous voice', () => {
        // Arrange
        const mockVoice = { file: 'goal_3_1', duration: 3, index: 1 };
        
        const restore = mockPickone([mockVoice]);
        
        try {
            const closeTimeline = [5, 6];
            
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline: closeTimeline
            }, {
                goal: { 
                    3: 1
                }
            });

            // Assert
            expect(actual.voice.length).toBe(1);
            expect(actual.voice[0]).toBe('goal_3_1');
        } finally {
            restore();
        }
    });
 });

 describe("Equalizer 1 - 1", () => {
    it("should generate voice for equalizer 1 - 1", () =>{
        // To be implemented
    });

    it("should also randomly generate random goal too", () => {
        // To be implemented
    });
 });
});