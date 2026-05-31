import { IObservable } from "../base.js";
import { Event, IValueWithChangeEvent } from "../commonFacade/deps.js";
import { DebugOwner } from "../debugName.js";
export declare class ValueWithChangeEventFromObservable<T> implements IValueWithChangeEvent<T> {
    readonly observable: IObservable<T>;
    constructor(observable: IObservable<T>);
    get onDidChange(): Event<void>;
    get value(): T;
}
export declare function observableFromValueWithChangeEvent<T>(owner: DebugOwner, value: IValueWithChangeEvent<T>): IObservable<T>;
