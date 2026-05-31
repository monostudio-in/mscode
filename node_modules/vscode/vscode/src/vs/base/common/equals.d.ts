/** Represents a function that decides if two values are equal. */
export type EqualityComparer<T> = (a: T, b: T) => boolean;
export interface IEquatable<T> {
    equals(other: T): boolean;
}
/**
 * Compares two items for equality using strict equality.
*/
export declare function strictEquals<T>(a: T, b: T): boolean;
export declare function strictEqualsC<T>(): EqualityComparer<T>;
/**
 * Checks if the items of two arrays are equal.
 * By default, strict equality is used to compare elements, but a custom equality comparer can be provided.
 */
export declare function arrayEquals<T>(a: readonly T[], b: readonly T[], itemEquals?: EqualityComparer<T>): boolean;
/**
 * Checks if the items of two arrays are equal.
 * By default, strict equality is used to compare elements, but a custom equality comparer can be provided.
 */
export declare function arrayEqualsC<T>(itemEquals?: EqualityComparer<T>): EqualityComparer<readonly T[]>;
/**
 * Drills into arrays (items ordered) and objects (keys unordered) and uses strict equality on everything else.
*/
export declare function structuralEquals<T>(a: T, b: T): boolean;
export declare function structuralEqualsC<T>(): EqualityComparer<T>;
/**
 * `getStructuralKey(a) === getStructuralKey(b) <=> structuralEquals(a, b)`
 * (assuming that a and b are not cyclic structures and nothing extends globalThis Array).
*/
export declare function getStructuralKey(t: unknown): string;
/**
 * Two items are considered equal, if their stringified representations are equal.
*/
export declare function jsonStringifyEquals<T>(a: T, b: T): boolean;
/**
 * Two items are considered equal, if their stringified representations are equal.
*/
export declare function jsonStringifyEqualsC<T>(): EqualityComparer<T>;
/**
 * Uses `item.equals(other)` to determine equality.
 */
export declare function thisEqualsC<T extends IEquatable<T>>(): EqualityComparer<T>;
/**
 * Checks if two items are both null or undefined, or are equal according to the provided equality comparer.
*/
export declare function equalsIfDefined<T>(v1: T | undefined | null, v2: T | undefined | null, equals: EqualityComparer<T>): boolean;
/**
 * Returns an equality comparer that checks if two items are both null or undefined, or are equal according to the provided equality comparer.
*/
export declare function equalsIfDefinedC<T>(equals: EqualityComparer<T>): EqualityComparer<T | undefined | null>;
/**
 * Each function in this file which offers an equality comparison, has an accompanying
 * `*C` variant which returns an EqualityComparer function.
 *
 * The `*C` variant allows for easier composition of equality comparers and improved type-inference.
*/
export declare namespace equals {
    const strict: typeof strictEquals;
    const strictC: typeof strictEqualsC;
    const array: typeof arrayEquals;
    const arrayC: typeof arrayEqualsC;
    const structural: typeof structuralEquals;
    const structuralC: typeof structuralEqualsC;
    const jsonStringify: typeof jsonStringifyEquals;
    const jsonStringifyC: typeof jsonStringifyEqualsC;
    const thisC: typeof thisEqualsC;
    const ifDefined: typeof equalsIfDefined;
    const ifDefinedC: typeof equalsIfDefinedC;
}
