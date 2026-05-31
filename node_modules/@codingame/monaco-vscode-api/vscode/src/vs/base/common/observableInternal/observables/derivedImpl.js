
import { BaseObservable } from './baseObservable.js';
import { assertFn } from '../../assert.js';
import '../../equals.js';
import { onBugIndicatingError, BugIndicatingError } from '../../errors.js';
import '../../event.js';
import { DisposableStore } from '../../lifecycle.js';
import { getLogger } from '../logging/logging.js';

var DerivedState;
(function(DerivedState) {
    DerivedState[DerivedState["initial"] = 0] = "initial";
    DerivedState[DerivedState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    DerivedState[DerivedState["stale"] = 2] = "stale";
    DerivedState[DerivedState["upToDate"] = 3] = "upToDate";
})(DerivedState || (DerivedState = {}));
function derivedStateToString(state) {
    switch (state) {
    case DerivedState.initial:
        return "initial";
    case DerivedState.dependenciesMightHaveChanged:
        return "dependenciesMightHaveChanged";
    case DerivedState.stale:
        return "stale";
    case DerivedState.upToDate:
        return "upToDate";
    default:
        return "<unknown>";
    }
}
class Derived extends BaseObservable {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? "(anonymous)";
    }
    constructor(
        _debugNameData,
        _computeFn,
        _changeTracker,
        _handleLastObserverRemoved = undefined,
        _equalityComparator,
        debugLocation
    ) {
        super(debugLocation);
        this._debugNameData = _debugNameData;
        this._computeFn = _computeFn;
        this._changeTracker = _changeTracker;
        this._handleLastObserverRemoved = _handleLastObserverRemoved;
        this._equalityComparator = _equalityComparator;
        this._state = DerivedState.initial;
        this._value = undefined;
        this._updateCount = 0;
        this._dependencies = ( new Set());
        this._dependenciesToBeRemoved = ( new Set());
        this._changeSummary = undefined;
        this._isUpdating = false;
        this._isComputing = false;
        this._didReportChange = false;
        this._isInBeforeUpdate = false;
        this._isReaderValid = false;
        this._store = undefined;
        this._delayedStore = undefined;
        this._removedObserverToCallEndUpdateOn = null;
        this._changeSummary = this._changeTracker?.createChangeSummary(undefined);
    }
    onLastObserverRemoved() {
        this._state = DerivedState.initial;
        this._value = undefined;
        getLogger()?.handleDerivedCleared(this);
        for (const d of this._dependencies) {
            d.removeObserver(this);
        }
        this._dependencies.clear();
        if (this._store !== undefined) {
            this._store.dispose();
            this._store = undefined;
        }
        if (this._delayedStore !== undefined) {
            this._delayedStore.dispose();
            this._delayedStore = undefined;
        }
        this._handleLastObserverRemoved?.();
    }
    get() {
        if (this._observers.size === 0) {
            let result;
            try {
                this._isReaderValid = true;
                let changeSummary = undefined;
                if (this._changeTracker) {
                    changeSummary = this._changeTracker.createChangeSummary(undefined);
                    this._changeTracker.beforeUpdate?.(this, changeSummary);
                }
                result = this._computeFn(this, changeSummary);
            } finally {
                this._isReaderValid = false;
            }
            this.onLastObserverRemoved();
            return result;
        } else {
            do {
                if (this._state === DerivedState.dependenciesMightHaveChanged) {
                    for (const d of this._dependencies) {
                        d.reportChanges();
                        if (this._state === DerivedState.stale) {
                            break;
                        }
                    }
                }
                if (this._state === DerivedState.dependenciesMightHaveChanged) {
                    this._state = DerivedState.upToDate;
                }
                if (this._state !== DerivedState.upToDate) {
                    this._recompute();
                }
            } while (this._state !== DerivedState.upToDate);
            return this._value;
        }
    }
    _recompute() {
        let didChange = false;
        this._isComputing = true;
        this._didReportChange = false;
        const emptySet = this._dependenciesToBeRemoved;
        this._dependenciesToBeRemoved = this._dependencies;
        this._dependencies = emptySet;
        try {
            const changeSummary = this._changeSummary;
            this._isReaderValid = true;
            if (this._changeTracker) {
                this._isInBeforeUpdate = true;
                this._changeTracker.beforeUpdate?.(this, changeSummary);
                this._isInBeforeUpdate = false;
                this._changeSummary = this._changeTracker?.createChangeSummary(changeSummary);
            }
            const hadValue = this._state !== DerivedState.initial;
            const oldValue = this._value;
            this._state = DerivedState.upToDate;
            const delayedStore = this._delayedStore;
            if (delayedStore !== undefined) {
                this._delayedStore = undefined;
            }
            try {
                if (this._store !== undefined) {
                    this._store.dispose();
                    this._store = undefined;
                }
                this._value = this._computeFn(this, changeSummary);
            } finally {
                this._isReaderValid = false;
                for (const o of this._dependenciesToBeRemoved) {
                    o.removeObserver(this);
                }
                this._dependenciesToBeRemoved.clear();
                if (delayedStore !== undefined) {
                    delayedStore.dispose();
                }
            }
            didChange = this._didReportChange || (hadValue && !(this._equalityComparator(oldValue, this._value)));
            getLogger()?.handleObservableUpdated(this, {
                oldValue,
                newValue: this._value,
                change: undefined,
                didChange,
                hadValue
            });
        } catch (e) {
            onBugIndicatingError(e);
        }
        this._isComputing = false;
        if (!this._didReportChange && didChange) {
            for (const r of this._observers) {
                r.handleChange(this, undefined);
            }
        } else {
            this._didReportChange = false;
        }
    }
    toString() {
        return `LazyDerived<${this.debugName}>`;
    }
    beginUpdate(_observable) {
        if (this._isUpdating) {
            throw ( new BugIndicatingError("Cyclic deriveds are not supported yet!"));
        }
        this._updateCount++;
        this._isUpdating = true;
        try {
            const propagateBeginUpdate = this._updateCount === 1;
            if (this._state === DerivedState.upToDate) {
                this._state = DerivedState.dependenciesMightHaveChanged;
                if (!propagateBeginUpdate) {
                    for (const r of this._observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
            if (propagateBeginUpdate) {
                for (const r of this._observers) {
                    r.beginUpdate(this);
                }
            }
        } finally {
            this._isUpdating = false;
        }
    }
    endUpdate(_observable) {
        this._updateCount--;
        if (this._updateCount === 0) {
            const observers = [...this._observers];
            for (const r of observers) {
                r.endUpdate(this);
            }
            if (this._removedObserverToCallEndUpdateOn) {
                const observers = [...this._removedObserverToCallEndUpdateOn];
                this._removedObserverToCallEndUpdateOn = null;
                for (const r of observers) {
                    r.endUpdate(this);
                }
            }
        }
        assertFn(() => this._updateCount >= 0);
    }
    handlePossibleChange(observable) {
        if (this._state === DerivedState.upToDate && ( this._dependencies.has(observable)) && !( this._dependenciesToBeRemoved.has(observable))) {
            this._state = DerivedState.dependenciesMightHaveChanged;
            for (const r of this._observers) {
                r.handlePossibleChange(this);
            }
        }
    }
    handleChange(observable, change) {
        if (( this._dependencies.has(observable)) && !( this._dependenciesToBeRemoved.has(observable)) || this._isInBeforeUpdate) {
            getLogger()?.handleDerivedDependencyChanged(this, observable, change);
            let shouldReact = false;
            try {
                shouldReact = this._changeTracker ? this._changeTracker.handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable
                }, this._changeSummary) : true;
            } catch (e) {
                onBugIndicatingError(e);
            }
            const wasUpToDate = this._state === DerivedState.upToDate;
            if (shouldReact && (this._state === DerivedState.dependenciesMightHaveChanged || wasUpToDate)) {
                this._state = DerivedState.stale;
                if (wasUpToDate) {
                    for (const r of this._observers) {
                        r.handlePossibleChange(this);
                    }
                }
            }
        }
    }
    _ensureReaderValid() {
        if (!this._isReaderValid) {
            throw ( new BugIndicatingError("The reader object cannot be used outside its compute function!"));
        }
    }
    readObservable(observable) {
        this._ensureReaderValid();
        observable.addObserver(this);
        const value = observable.get();
        this._dependencies.add(observable);
        this._dependenciesToBeRemoved.delete(observable);
        return value;
    }
    reportChange(change) {
        this._ensureReaderValid();
        this._didReportChange = true;
        for (const r of this._observers) {
            r.handleChange(this, change);
        }
    }
    get store() {
        this._ensureReaderValid();
        if (this._store === undefined) {
            this._store = ( new DisposableStore());
        }
        return this._store;
    }
    get delayedStore() {
        this._ensureReaderValid();
        if (this._delayedStore === undefined) {
            this._delayedStore = ( new DisposableStore());
        }
        return this._delayedStore;
    }
    addObserver(observer) {
        const shouldCallBeginUpdate = !( this._observers.has(observer)) && this._updateCount > 0;
        super.addObserver(observer);
        if (shouldCallBeginUpdate) {
            if (!this._removedObserverToCallEndUpdateOn?.delete(observer)) {
                observer.beginUpdate(this);
            }
        }
    }
    removeObserver(observer) {
        if (( this._observers.has(observer)) && this._updateCount > 0) {
            if (!this._removedObserverToCallEndUpdateOn) {
                this._removedObserverToCallEndUpdateOn = ( new Set());
            }
            this._removedObserverToCallEndUpdateOn.add(observer);
        }
        super.removeObserver(observer);
    }
    debugGetState() {
        return {
            state: this._state,
            stateStr: derivedStateToString(this._state),
            updateCount: this._updateCount,
            isComputing: this._isComputing,
            dependencies: this._dependencies,
            value: this._value
        };
    }
    debugSetValue(newValue) {
        this._value = newValue;
    }
    debugRecompute() {
        this.beginUpdate(this);
        try {
            if (!this._isComputing) {
                this._recompute();
            } else {
                this._state = DerivedState.stale;
            }
        } finally {
            this.endUpdate(this);
        }
    }
    setValue(newValue, tx, change) {
        this._value = newValue;
        const observers = this._observers;
        tx.updateObserver(this, this);
        for (const d of observers) {
            d.handleChange(this, change);
        }
    }
}
class DerivedWithSetter extends Derived {
    constructor(
        debugNameData,
        computeFn,
        changeTracker,
        handleLastObserverRemoved = undefined,
        equalityComparator,
        set,
        debugLocation
    ) {
        super(
            debugNameData,
            computeFn,
            changeTracker,
            handleLastObserverRemoved,
            equalityComparator,
            debugLocation
        );
        this.set = set;
    }
}

export { Derived, DerivedState, DerivedWithSetter };
