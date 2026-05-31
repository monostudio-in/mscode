import { IObservable, IObservableWithChange, IObserver, IReader, ITransaction } from "../base.js";
import { DebugOwner } from "../debugName.js";
import { DisposableStore, Event, IDisposable } from "../commonFacade/deps.js";
import { DebugLocation } from "../debugLocation.js";
export declare function observableFromPromise<T>(promise: Promise<T>): IObservable<{
    value?: T;
}>;
export declare function signalFromObservable<T>(owner: DebugOwner | undefined, observable: IObservable<T>): IObservable<void>;
/**
 * Creates an observable that debounces the input observable.
 */
export declare function debouncedObservable<T>(observable: IObservable<T>, debounceMs: number | ((lastValue: T | undefined, newValue: T) => number), debugLocation?: DebugLocation): IObservable<T>;
/**
 * Creates an observable that throttles the input observable.
 * Unlike {@link debouncedObservable}, the timer starts on the first change
 * and is not reset by subsequent changes, preventing starvation.
 */
export declare function throttledObservable<T>(observable: IObservable<T>, throttleMs: number, debugLocation?: DebugLocation): IObservable<T>;
/**
 * Creates an observable that debounces the input observable.
 */
export declare function debouncedObservable2<T>(observable: IObservable<T>, debounceMs: number | ((currentValue: T | undefined, newValue: T) => number), debugLocation?: DebugLocation): IObservable<T>;
export declare function wasEventTriggeredRecently(event: Event<any>, timeoutMs: number, disposableStore: DisposableStore): IObservable<boolean>;
/**
 * This makes sure the observable is being observed and keeps its cache alive.
 */
export declare function keepObserved<T>(observable: IObservable<T>): IDisposable;
/**
 * This converts the given observable into an autorun.
 */
export declare function recomputeInitiallyAndOnChange<T>(observable: IObservable<T>, handleValue?: (value: T) => void): IDisposable;
export declare class KeepAliveObserver implements IObserver {
    private readonly _forceRecompute;
    private readonly _handleValue;
    private _counter;
    constructor(_forceRecompute: boolean, _handleValue: ((value: any) => void) | undefined);
    beginUpdate<T>(observable: IObservable<T>): void;
    endUpdate<T>(observable: IObservable<T>): void;
    handlePossibleChange<T>(observable: IObservable<T>): void;
    handleChange<T, TChange>(observable: IObservableWithChange<T, TChange>, change: TChange): void;
}
export declare function derivedObservableWithCache<T>(owner: DebugOwner, computeFn: (reader: IReader, lastValue: T | undefined) => T): IObservable<T>;
export declare function derivedObservableWithWritableCache<T>(owner: object, computeFn: (reader: IReader, lastValue: T | undefined) => T): IObservable<T> & {
    clearCache(transaction: ITransaction): void;
    setCache(newValue: T | undefined, tx: ITransaction | undefined): void;
};
/**
 * When the items array changes, referential equal items are not mapped again.
 */
export declare function mapObservableArrayCached<TIn, TOut, TKey = TIn>(owner: DebugOwner, items: IObservable<readonly TIn[]>, map: (input: TIn, store: DisposableStore) => TOut, keySelector?: (input: TIn) => TKey): IObservable<readonly TOut[]>;
export declare function isObservable<T>(obj: unknown): obj is IObservable<T>;
