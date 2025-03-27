import { Duration } from "../game-definition";

export function isFirstHalfOddsActive(remainingTime: number, durations: Duration) {
    const { placingBetsSecondHalf } = durations;

    return remainingTime > placingBetsSecondHalf;
}

export function isWithinBettingTime(remainingTime: number, durations: Duration) {
    return isWithinFirstHalfBettingTime(remainingTime, durations) || isWithinSecondHalfBettingTime(remainingTime, durations);
}

export function isWithinFirstHalfBettingTime(remainingTime: number, durations: Duration) {
    const { placingBetsFirstHalf, lockingBetFirstHalf } = durations;
    return isRemainingTimeWithinWindow(remainingTime, placingBetsFirstHalf, lockingBetFirstHalf);
}

export function isWithinSecondHalfBettingTime(remainingTime: number, durations: Duration) {
    const { placingBetsSecondHalf, lockingBetSecondHalf } = durations;

    return isRemainingTimeWithinWindow(remainingTime, placingBetsSecondHalf, lockingBetSecondHalf);
}

function isRemainingTimeWithinWindow(remainingTime: number, placingBets: number, lockingBet: number) {
    return remainingTime < placingBets && remainingTime >= lockingBet;
}
