import { EqualityComparer } from "../commonFacade/deps.js";
import { IObservable, IObservableWithChange, ISettableObservable } from "../base.js";
import { IChangeTracker } from "../changeTracker.js";
import { DebugOwner } from "../debugName.js";
import { IDerivedReader } from "../observables/derivedImpl.js";
export interface IReducerOptions<T, TChangeSummary = void, TOutChange = void> {
    /**
     * Is called to create the initial value of the observable when it becomes observed.
    */
    initial: T | (() => T);
    /**
     * Is called to dispose the observable value when it is no longer observed.
    */
    disposeFinal?(value: T): void;
    changeTracker?: IChangeTracker<TChangeSummary>;
    equalityComparer?: EqualityComparer<T>;
    /**
     * Applies the changes to the value.
     * Use `reader.reportChange` to report change details or to report a change if the same value is returned.
    */
    update(reader: IDerivedReader<TOutChange>, previousValue: T, changes: TChangeSummary): T;
}
/**
 * Creates an observable value that is based on values and changes from other observables.
 * Additionally, a reducer can report how that state changed.
*/
export declare function observableReducer<T, TInChanges, TOutChange = void>(owner: DebugOwner, options: IReducerOptions<T, TInChanges, TOutChange>): SimplifyObservableWithChange<T, TOutChange>;
/**
 * Creates an observable value that is based on values and changes from other observables.
 * Additionally, a reducer can report how that state changed.
*/
export declare function observableReducerSettable<T, TInChanges, TOutChange = void>(owner: DebugOwner, options: IReducerOptions<T, TInChanges, TOutChange>): ISettableObservable<T, TOutChange>;
/**
 * Returns IObservable<T> if TChange is void, otherwise IObservableWithChange<T, TChange>
*/
type SimplifyObservableWithChange<T, TChange> = TChange extends void ? IObservable<T> : IObservableWithChange<T, TChange>;
export {};
