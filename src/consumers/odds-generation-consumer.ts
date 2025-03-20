import { OddsType } from "../match-configs";

export default class OddGenerationConsumer {
    public generateOdds(options: any): OddsType {
        return {
            firstHalfAway: 1,
            firstHalfDraw: 1,
            firstHalfDraw4: 1,
            firstHalfEven: 1,
            firstHalfHome: 1,
            firstHalfOdd: 1,
            firstHalfOver: 1,
            firstHalfUnder: 1,
            secondHalfAway: 1,
            secondHalfDraw: 1,
            secondHalfDraw4: 1,
            secondHalfEven: 1,
            secondHalfHome: 1,
            secondHalfOdd: 1,
            secondHalfOver: 1,
            secondHalfUnder: 1
        }
    }
}