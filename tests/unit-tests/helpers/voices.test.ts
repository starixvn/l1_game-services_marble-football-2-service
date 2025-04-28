import Chance from 'chance';
import { generateVoice } from '../../../src/helpers/voices';

const chance = new Chance();

function getAllPickoneRandomizationResult(callback: Function, length = 0) {
    if (length === 0) {
        return [];
    }
    
    const resultArr = [];
    
    const originalPickone = chance.pickone;
    
    try {
        (chance as any).pickone = function<T>(arr: T[]): T {
            return arr[0];
        };
        
        for (let i = 0; i < length; i++) {
            (chance as any).pickone = function<T>(arr: T[]): T {
                return arr[i % arr.length];
            };
            
            const result = callback();
            resultArr.push(result);
        }
    } finally {
        chance.pickone = originalPickone;
    }
    
    return resultArr;
}

describe('generateVoice', () => {
 describe('random goal', () => {

    const timeline = [6, 8];
    const result = "AA";


    it('should generate voice for goal', () => {
        const actual = generateVoice({
                isFirstHalf: true,
                result,
                timeline
            });

        expect(actual.voice).toContain('goal_1_1');
        expect(actual.voice).toContain('goal_1_2');
        expect(actual.voice).toContain('goal_1_3');
    });

    it('should not generate voice overlapping the previous voice', () => {

    });
 });

 describe("Equalizer 1 - 1", () => {
    it("should generate voice for equalizer 1 - 1", () =>{

    });

    it("should also randomly generate random goal too", () => {

    });
 });

 it("example testing random utils", () => {
    const result = getAllPickoneRandomizationResult(exampleTest, 10);
    console.log(result);
    expect(result).toEqual([1, 2, 3, 7, 9, 1, 2, 3, 7, 9]);
 });
});

function exampleTest() {
    const arr = [1, 2, 3, 7, 9]
    const one = chance.pickone(arr)
    return one;
}