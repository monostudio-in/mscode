import { IDisposable } from "../../../base/common/lifecycle.js";
import { ObservableValue } from "../../../base/common/observableInternal/observables/observableValue.js";
import { StorageScope, StorageTarget } from "../../storage/common/storage.js";
import { IStorageService } from "../../storage/common/storage.service.js";
interface IObservableMementoOpts<T> {
    defaultValue: T;
    key: string;
    toStorage: (value: T) => string;
    fromStorage: (value: string) => T;
}
/**
 * Defines an observable memento. Returns a function that can be called with
 * the specific storage scope, target, and service to use in a class.
 *
 * Note that the returned Observable is a disposable, because it interacts
 * with storage service events, and must be tracked appropriately.
 */
export declare function observableMemento<T>(opts: IObservableMementoOpts<T>): (scope: StorageScope, target: StorageTarget, storageService: IStorageService) => ObservableMemento<T>;
/**
 * A value that is stored, and is also observable. Note: T should be readonly.
 */
export declare class ObservableMemento<T> extends ObservableValue<T> implements IDisposable {
    private readonly opts;
    private readonly storageScope;
    private readonly storageTarget;
    private readonly storageService;
    private readonly _store;
    private _noStorageUpdateNeeded;
    constructor(opts: IObservableMementoOpts<T>, storageScope: StorageScope, storageTarget: StorageTarget, storageService: IStorageService);
    protected _setValue(newValue: T): void;
    dispose(): void;
}
export {};
