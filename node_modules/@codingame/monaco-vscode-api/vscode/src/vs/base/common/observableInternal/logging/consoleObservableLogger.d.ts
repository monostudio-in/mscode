import { IObservable } from "../base.js";
import { TransactionImpl } from "../transaction.js";
import { IObservableLogger, IChangeInformation } from "./logging.js";
import { FromEventObservable } from "../observables/observableFromEvent.js";
import { Derived } from "../observables/derivedImpl.js";
import { AutorunObserver } from "../reactions/autorunImpl.js";
export declare function logObservableToConsole(obs: IObservable<any>): void;
export declare class ConsoleObservableLogger implements IObservableLogger {
    private indentation;
    private _filteredObjects;
    addFilteredObj(obj: unknown): void;
    private _isIncluded;
    private textToConsoleArgs;
    private formatInfo;
    handleObservableCreated(observable: IObservable<any>): void;
    handleOnListenerCountChanged(observable: IObservable<any>, newCount: number): void;
    handleObservableUpdated(observable: IObservable<unknown>, info: IChangeInformation): void;
    private readonly changedObservablesSets;
    formatChanges(changes: Set<IObservable<any>>): ConsoleText | undefined;
    handleDerivedDependencyChanged(derived: Derived<any>, observable: IObservable<any>, change: unknown): void;
    _handleDerivedRecomputed(derived: Derived<unknown>, info: IChangeInformation): void;
    handleDerivedCleared(derived: Derived<unknown>): void;
    handleFromEventObservableTriggered(observable: FromEventObservable<any, any>, info: IChangeInformation): void;
    handleAutorunCreated(autorun: AutorunObserver): void;
    handleAutorunDisposed(autorun: AutorunObserver): void;
    handleAutorunDependencyChanged(autorun: AutorunObserver, observable: IObservable<any>, change: unknown): void;
    handleAutorunStarted(autorun: AutorunObserver): void;
    handleAutorunFinished(autorun: AutorunObserver): void;
    handleBeginTransaction(transaction: TransactionImpl): void;
    handleEndTransaction(): void;
}
type ConsoleText = (ConsoleText | undefined)[] | {
    text: string;
    style: string;
    data?: unknown[];
} | {
    data: unknown[];
};
export declare function formatValue(value: unknown, availableLen: number): string;
export {};
