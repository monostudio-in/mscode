
import { assertFn } from '../../assert.js';
import '../../equals.js';
import { onBugIndicatingError, BugIndicatingError } from '../../errors.js';
import '../../event.js';
import { trackDisposable, markAsDisposed, DisposableStore } from '../../lifecycle.js';
import { getLogger } from '../logging/logging.js';

var AutorunState;
(function(AutorunState) {
    AutorunState[AutorunState["dependenciesMightHaveChanged"] = 1] = "dependenciesMightHaveChanged";
    AutorunState[AutorunState["stale"] = 2] = "stale";
    AutorunState[AutorunState["upToDate"] = 3] = "upToDate";
})(AutorunState || (AutorunState = {}));
function autorunStateToString(state) {
    switch (state) {
    case AutorunState.dependenciesMightHaveChanged:
        return "dependenciesMightHaveChanged";
    case AutorunState.stale:
        return "stale";
    case AutorunState.upToDate:
        return "upToDate";
    default:
        return "<unknown>";
    }
}
class AutorunObserver {
    get debugName() {
        return this._debugNameData.getDebugName(this) ?? "(anonymous)";
    }
    constructor(_debugNameData, _runFn, _changeTracker, debugLocation) {
        this._debugNameData = _debugNameData;
        this._runFn = _runFn;
        this._changeTracker = _changeTracker;
        this._state = AutorunState.stale;
        this._updateCount = 0;
        this._disposed = false;
        this._dependencies = ( new Set());
        this._dependenciesToBeRemoved = ( new Set());
        this._isRunning = false;
        this._iteration = 0;
        this._store = undefined;
        this._delayedStore = undefined;
        this._changeSummary = this._changeTracker?.createChangeSummary(undefined);
        getLogger()?.handleAutorunCreated(this, debugLocation);
        this._run();
        trackDisposable(this);
    }
    dispose() {
        if (this._disposed) {
            return;
        }
        this._disposed = true;
        for (const o of this._dependencies) {
            o.removeObserver(this);
        }
        this._dependencies.clear();
        if (this._store !== undefined) {
            this._store.dispose();
        }
        if (this._delayedStore !== undefined) {
            this._delayedStore.dispose();
        }
        getLogger()?.handleAutorunDisposed(this);
        markAsDisposed(this);
    }
    _run() {
        const emptySet = this._dependenciesToBeRemoved;
        this._dependenciesToBeRemoved = this._dependencies;
        this._dependencies = emptySet;
        this._state = AutorunState.upToDate;
        try {
            if (!this._disposed) {
                getLogger()?.handleAutorunStarted(this);
                const changeSummary = this._changeSummary;
                const delayedStore = this._delayedStore;
                if (delayedStore !== undefined) {
                    this._delayedStore = undefined;
                }
                try {
                    this._isRunning = true;
                    if (this._changeTracker) {
                        this._changeTracker.beforeUpdate?.(this, changeSummary);
                        this._changeSummary = this._changeTracker.createChangeSummary(changeSummary);
                    }
                    if (this._store !== undefined) {
                        this._store.dispose();
                        this._store = undefined;
                    }
                    this._runFn(this, changeSummary);
                } catch (e) {
                    onBugIndicatingError(e);
                } finally {
                    this._isRunning = false;
                    if (delayedStore !== undefined) {
                        delayedStore.dispose();
                    }
                }
            }
        } finally {
            if (!this._disposed) {
                getLogger()?.handleAutorunFinished(this);
            }
            for (const o of this._dependenciesToBeRemoved) {
                o.removeObserver(this);
            }
            this._dependenciesToBeRemoved.clear();
        }
    }
    toString() {
        return `Autorun<${this.debugName}>`;
    }
    beginUpdate(_observable) {
        if (this._state === AutorunState.upToDate) {
            this._checkIterations();
            this._state = AutorunState.dependenciesMightHaveChanged;
        }
        this._updateCount++;
    }
    endUpdate(_observable) {
        try {
            if (this._updateCount === 1) {
                this._iteration = 1;
                do {
                    if (this._checkIterations()) {
                        return;
                    }
                    if (this._state === AutorunState.dependenciesMightHaveChanged) {
                        this._state = AutorunState.upToDate;
                        for (const d of this._dependencies) {
                            d.reportChanges();
                            if (this._state === AutorunState.stale) {
                                break;
                            }
                        }
                    }
                    this._iteration++;
                    if (this._state !== AutorunState.upToDate) {
                        this._run();
                    }
                } while (this._state !== AutorunState.upToDate);
            }
        } finally {
            this._updateCount--;
        }
        assertFn(() => this._updateCount >= 0);
    }
    handlePossibleChange(observable) {
        if (this._state === AutorunState.upToDate && this._isDependency(observable)) {
            this._checkIterations();
            this._state = AutorunState.dependenciesMightHaveChanged;
        }
    }
    handleChange(observable, change) {
        if (this._isDependency(observable)) {
            getLogger()?.handleAutorunDependencyChanged(this, observable, change);
            try {
                const shouldReact = this._changeTracker ? this._changeTracker.handleChange({
                    changedObservable: observable,
                    change,
                    didChange: o => o === observable
                }, this._changeSummary) : true;
                if (shouldReact) {
                    this._checkIterations();
                    this._state = AutorunState.stale;
                }
            } catch (e) {
                onBugIndicatingError(e);
            }
        }
    }
    _isDependency(observable) {
        return ( this._dependencies.has(observable)) && !( this._dependenciesToBeRemoved.has(observable));
    }
    _ensureNoRunning() {
        if (!this._isRunning) {
            throw ( new BugIndicatingError("The reader object cannot be used outside its compute function!"));
        }
    }
    readObservable(observable) {
        this._ensureNoRunning();
        if (this._disposed) {
            return observable.get();
        }
        observable.addObserver(this);
        const value = observable.get();
        this._dependencies.add(observable);
        this._dependenciesToBeRemoved.delete(observable);
        return value;
    }
    get store() {
        this._ensureNoRunning();
        if (this._disposed) {
            throw ( new BugIndicatingError("Cannot access store after dispose"));
        }
        if (this._store === undefined) {
            this._store = ( new DisposableStore());
        }
        return this._store;
    }
    get delayedStore() {
        this._ensureNoRunning();
        if (this._disposed) {
            throw ( new BugIndicatingError("Cannot access store after dispose"));
        }
        if (this._delayedStore === undefined) {
            this._delayedStore = ( new DisposableStore());
        }
        return this._delayedStore;
    }
    debugGetState() {
        return {
            isRunning: this._isRunning,
            updateCount: this._updateCount,
            dependencies: this._dependencies,
            state: this._state,
            stateStr: autorunStateToString(this._state)
        };
    }
    debugRerun() {
        if (!this._isRunning) {
            this._run();
        } else {
            this._state = AutorunState.stale;
        }
    }
    _checkIterations() {
        if (this._iteration > 100) {
            onBugIndicatingError(( new BugIndicatingError(`Autorun '${this.debugName}' is stuck in an infinite update loop.`)));
            return true;
        }
        return false;
    }
}

export { AutorunObserver, AutorunState };
