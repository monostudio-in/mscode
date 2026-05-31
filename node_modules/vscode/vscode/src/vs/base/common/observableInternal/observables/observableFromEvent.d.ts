import { IObservable, ITransaction } from "../base.js";
import { EqualityComparer, Event } from "../commonFacade/deps.js";
import { DebugOwner, DebugNameData, IDebugNameData } from "../debugName.js";
import { BaseObservable } from "./baseObservable.js";
import { DebugLocation } from "../debugLocation.js";
export declare function observableFromEvent<T, TArgs = unknown>(owner: DebugOwner, event: Event<TArgs>, getValue: (args: TArgs | undefined) => T, debugLocation?: DebugLocation): IObservable<T>;
export declare function observableFromEvent<T, TArgs = unknown>(event: Event<TArgs>, getValue: (args: TArgs | undefined) => T): IObservable<T>;
export declare function observableFromEventOpts<T, TArgs = unknown>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    getTransaction?: () => ITransaction | undefined;
}, event: Event<TArgs>, getValue: (args: TArgs | undefined) => T, debugLocation?: DebugLocation): IObservable<T>;
export declare class FromEventObservable<TArgs, T> extends BaseObservable<T> {
    private readonly _debugNameData;
    private readonly event;
    readonly _getValue: (args: TArgs | undefined) => T;
    private readonly _getTransaction;
    private readonly _equalityComparator;
    static globalTransaction: ITransaction | undefined;
    private _value;
    private _hasValue;
    private _subscription;
    constructor(_debugNameData: DebugNameData, event: Event<TArgs>, _getValue: (args: TArgs | undefined) => T, _getTransaction: () => ITransaction | undefined, _equalityComparator: EqualityComparer<T>, debugLocation: DebugLocation);
    private getDebugName;
    get debugName(): string;
    protected onFirstObserverAdded(): void;
    private readonly handleEvent;
    protected onLastObserverRemoved(): void;
    get(): T;
    debugSetValue(value: unknown): void;
    debugGetState(): {
        value: T | undefined;
        hasValue: boolean;
    };
}
export declare namespace observableFromEvent {
    const Observer: typeof FromEventObservable;
    function batchEventsGlobally(tx: ITransaction, fn: () => void): void;
}
