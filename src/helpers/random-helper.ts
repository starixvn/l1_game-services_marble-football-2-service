import { randomInt, randomBytes, randomUUID } from "node:crypto";

/**
 * Securely shuffles an array using the Fisher-Yates algorithm with crypto.randomInt
 */
export function secureShuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Generates a cryptographically secure random boolean
 */
export function secureRandomBool(): boolean {
    return randomInt(0, 2) === 1;
}

/**
 * Generates a cryptographically secure random number between 0 and 1
 */
export function secureRandomFloat(): number {
    // Use 4 bytes (32 bits) for good precision
    const buffer = randomBytes(4);
    // Convert to a 32-bit unsigned int and divide by max uint32
    return buffer.readUInt32BE() / 0xffffffff;
}

/**
 * Generates a cryptographically secure random integer between min and max (inclusive)
 * using the full range of available entropy
 */
export function secureRandomRange(min: number, max: number): number {
    if (min > max) {
        throw new Error("Min cannot be greater than max");
    }

    if (!Number.isInteger(min) || !Number.isInteger(max)) {
        throw new Error("Min and max must be integers");
    }

    const range = max - min + 1;
    if (range <= 0) {
        throw new Error("Range is too large");
    }

    // Use randomInt for small ranges as it's optimized for this case
    if (range <= 281474976710656) {
        // 2^48, max safe range for randomInt
        return randomInt(min, max + 1);
    }

    // For larger ranges, use randomBytes for full entropy
    const bytes = randomBytes(6); // 48 bits
    const value = bytes.readUIntBE(0, 6);
    return min + (value % range);
}

/**
 * Generates a cryptographically secure v4 UUID
 */
export function secureUUID(): string {
    return randomUUID();
}

/**
 * Securely picks n unique items from an array
 */
export function securePickSet<T>(array: T[], count: number): T[] {
    if (count < 0) {
        throw new Error("Count must be non-negative");
    }

    if (count > array.length) {
        throw new Error("Count cannot exceed array length");
    }

    return secureShuffle(array).slice(0, count);
}

/**
 * Securely picks one random item from an array
 */
export function securePickOne<T>(array: T[]): T {
    if (array.length === 0) {
        throw new Error("Array cannot be empty");
    }

    return array[randomInt(0, array.length)];
}

export function secureWeightedPick<T>(array: T[], weights: number[]): T {
    if (array.length === 0) {
        throw new Error("Array cannot be empty");
    }

    if (array.length !== weights.length) {
        throw new Error("Array and weights must have the same length");
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    const randomValue = secureRandomFloat() * totalWeight;

    let cumulativeWeight = 0;

    for (let i = 0; i < array.length; i++) {
        cumulativeWeight += weights[i];

        if (randomValue <= cumulativeWeight) {
            return array[i];
        }
    }

    // If we exit the loop without returning, something went wrong
    throw new Error("Failed to pick an item from the array");
}
