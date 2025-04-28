import Chance from 'chance';
import { generateVoice } from '../../../src/helpers/voices';

const chance = new Chance();

function mockPickoneIndices(indices: number[]): () => void {
  const originalPickone = Chance.prototype.pickone;
  
  let currentIndex = 0;
  
  Chance.prototype.pickone = function<T>(arr: T[]): T {
    const pickIndex = indices[currentIndex];
    currentIndex = (currentIndex + 1) % indices.length;
    return arr[pickIndex];
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
        const restore = mockPickoneIndices([0, 1]);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 
                    1: 2,
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
        const restore = mockPickoneIndices([0]);
        
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
    const timeline = [10, 20];
    const result = "HA";

    it("should generate voice for equalizer 1 - 1", () => {
        // Arrange
        const restore = mockPickoneIndices([0, 1]);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 1: 1 },
                draw1: { 1: 1 }
            });

            // Assert
            expect(actual.voice).toContain('draw1_1_1');
        } finally {
            restore();
        }
    });

    it("should also randomly generate random goal too", () => {
        // Arrange
        const restore = mockPickoneIndices([1, 2]);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 1: 2 },
                draw1: { 2: 1 }
            });

            // Assert
            expect(actual.voice).toContain('goal_1_2');
            expect(actual.voice).toContain('draw1_2_1');
        } finally {
            restore();
        }
    });
 });

 describe("Equalizer 2 - 2", () => {
    const timeline = [10, 20, 30, 40];
    const result = "HAHA";

    it("should generate voice for equalizer 2 - 2", () => {
        // Arrange
        const restore = mockPickoneIndices([0, 0, 0, 1]);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 1: 1 },
                draw2: { 2: 1 }
            });

            // Assert
            expect(actual.voice).toContain('draw2_2_1');
        } finally {
            restore();
        }
    });
 });

 describe("Equalizer 3 - 3", () => {
    const timeline = [10, 20, 30, 40, 50, 60];
    const result = "HAHAHA";

    it("should generate voice for equalizer 3 - 3", () => {
        // Arrange
        const restore = mockPickoneIndices([0, 0, 0, 0, 0, 1]);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 1: 1 },
                draw3: { 3: 1 }
            });

            // Assert
            expect(actual.voice).toContain('draw3_3_1');
        } finally {
            restore();
        }
    });
 });

 describe("Equalizer 4 - 4", () => {
    const timeline = [10, 20, 30, 40, 50, 60, 70, 80];
    const result = "HAHAHAHA";

    it("should generate voice for equalizer 4 - 4", () => {
        // Arrange
        const restore = mockPickoneIndices([0, 0, 0, 0, 0, 0, 0, 1]);
        
        try {
            // Act
            const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            }, {
                goal: { 1: 1 },
                draw4: { 4: 1 }
            });

            // Assert
            expect(actual.voice).toContain('draw4_4_1');
        } finally {
            restore();
        }
    });
 });
});