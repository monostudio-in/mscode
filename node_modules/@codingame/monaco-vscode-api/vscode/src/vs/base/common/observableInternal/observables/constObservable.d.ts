import { IObservable } from "../base.js";
/**
 * Represents an efficient observable whose value never changes.
 */
export declare function constObservable<T>(value: T): IObservable<T>;
