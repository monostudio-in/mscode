
import { compareBy, numberComparator } from './arrays.js';
import { groupBy } from './collections.js';
import { SetMap, ResourceMap } from './map.js';
import { createSingleCallFunction } from './functional.js';
import { Iterable } from './iterator.js';
import { onUnexpectedError, BugIndicatingError } from './errors.js';

let disposableTracker = null;
class GCBasedDisposableTracker {
    constructor() {
        this._registry = ( new FinalizationRegistry(heldValue => {
            console.warn(`[LEAKED DISPOSABLE] ${heldValue}`);
        }));
    }
    trackDisposable(disposable) {
        const stack = ( new Error("CREATED via:")).stack;
        this._registry.register(disposable, stack, disposable);
    }
    setParent(child, parent) {
        if (parent) {
            this._registry.unregister(child);
        } else {
            this.trackDisposable(child);
        }
    }
    markAsDisposed(disposable) {
        this._registry.unregister(disposable);
    }
    markAsSingleton(disposable) {
        this._registry.unregister(disposable);
    }
}
class DisposableTracker {
    constructor() {
        this.livingDisposables = ( new Map());
    }
    static {
        this.idx = 0;
    }
    getDisposableData(d) {
        let val = this.livingDisposables.get(d);
        if (!val) {
            val = {
                parent: null,
                source: null,
                isSingleton: false,
                value: d,
                idx: DisposableTracker.idx++
            };
            this.livingDisposables.set(d, val);
        }
        return val;
    }
    trackDisposable(d) {
        const data = this.getDisposableData(d);
        if (!data.source) {
            data.source = ( new Error()).stack;
        }
    }
    setParent(child, parent) {
        const data = this.getDisposableData(child);
        data.parent = parent;
    }
    markAsDisposed(x) {
        this.livingDisposables.delete(x);
    }
    markAsSingleton(disposable) {
        this.getDisposableData(disposable).isSingleton = true;
    }
    getRootParent(data, cache) {
        const cacheValue = cache.get(data);
        if (cacheValue) {
            return cacheValue;
        }
        const result = data.parent ? this.getRootParent(this.getDisposableData(data.parent), cache) : data;
        cache.set(data, result);
        return result;
    }
    getTrackedDisposables() {
        const rootParentCache = ( new Map());
        const leaking = [...this.livingDisposables.entries()].filter(
            ([, v]) => v.source !== null && !this.getRootParent(v, rootParentCache).isSingleton
        ).flatMap(([k]) => k);
        return leaking;
    }
    computeLeakingDisposables(maxReported = 10, preComputedLeaks) {
        let uncoveredLeakingObjs;
        if (preComputedLeaks) {
            uncoveredLeakingObjs = preComputedLeaks;
        } else {
            const rootParentCache = ( new Map());
            const leakingObjects = [...( this.livingDisposables.values())].filter(
                info => info.source !== null && !this.getRootParent(info, rootParentCache).isSingleton
            );
            if (leakingObjects.length === 0) {
                return;
            }
            const leakingObjsSet = ( new Set(( leakingObjects.map(o => o.value))));
            uncoveredLeakingObjs = leakingObjects.filter(l => {
                return !(l.parent && ( leakingObjsSet.has(l.parent)));
            });
            if (uncoveredLeakingObjs.length === 0) {
                throw ( new Error("There are cyclic diposable chains!"));
            }
        }
        if (!uncoveredLeakingObjs) {
            return undefined;
        }
        function getStackTracePath(leaking) {
            function removePrefix(array, linesToRemove) {
                while (array.length > 0 && ( linesToRemove.some(
                    regexp => typeof regexp === "string" ? regexp === array[0] : array[0].match(regexp)
                ))) {
                    array.shift();
                }
            }
            const lines = ( leaking.source.split("\n").map(p => p.trim().replace("at ", ""))).filter(l => l !== "");
            removePrefix(lines, [
                "Error",
                /^trackDisposable \(.*\)$/,
                /^DisposableTracker.trackDisposable \(.*\)$/
            ]);
            return lines.reverse();
        }
        const stackTraceStarts = ( new SetMap());
        for (const leaking of uncoveredLeakingObjs) {
            const stackTracePath = getStackTracePath(leaking);
            for (let i = 0; i <= stackTracePath.length; i++) {
                stackTraceStarts.add(stackTracePath.slice(0, i).join("\n"), leaking);
            }
        }
        uncoveredLeakingObjs.sort(compareBy(l => l.idx, numberComparator));
        let message = "";
        let i = 0;
        for (const leaking of uncoveredLeakingObjs.slice(0, maxReported)) {
            i++;
            const stackTracePath = getStackTracePath(leaking);
            const stackTraceFormattedLines = [];
            for (let i = 0; i < stackTracePath.length; i++) {
                let line = stackTracePath[i];
                const starts = stackTraceStarts.get(stackTracePath.slice(0, i + 1).join("\n"));
                line = `(shared with ${starts.size}/${uncoveredLeakingObjs.length} leaks) at ${line}`;
                const prevStarts = stackTraceStarts.get(stackTracePath.slice(0, i).join("\n"));
                const continuations = groupBy(( [...prevStarts].map(d => getStackTracePath(d)[i])), v => v);
                delete continuations[stackTracePath[i]];
                for (const [cont, set] of Object.entries(continuations)) {
                    if (set) {
                        stackTraceFormattedLines.unshift(`    - stacktraces of ${set.length} other leaks continue with ${cont}`);
                    }
                }
                stackTraceFormattedLines.unshift(line);
            }
            message += `\n\n\n==================== Leaking disposable ${i}/${uncoveredLeakingObjs.length}: ${leaking.value.constructor.name} ====================\n${stackTraceFormattedLines.join("\n")}\n============================================================\n\n`;
        }
        if (uncoveredLeakingObjs.length > maxReported) {
            message += `\n\n\n... and ${uncoveredLeakingObjs.length - maxReported} more leaking disposables\n\n`;
        }
        return {
            leaks: uncoveredLeakingObjs,
            details: message
        };
    }
}
function setDisposableTracker(tracker) {
    disposableTracker = tracker;
}
function trackDisposable(x) {
    disposableTracker?.trackDisposable(x);
    return x;
}
function markAsDisposed(disposable) {
    disposableTracker?.markAsDisposed(disposable);
}
function setParentOfDisposable(child, parent) {
    disposableTracker?.setParent(child, parent);
}
function setParentOfDisposables(children, parent) {
    if (!disposableTracker) {
        return;
    }
    for (const child of children) {
        disposableTracker.setParent(child, parent);
    }
}
function markAsSingleton(singleton) {
    disposableTracker?.markAsSingleton(singleton);
    return singleton;
}
function isDisposable(thing) {
    return typeof thing === "object" && thing !== null && typeof thing.dispose === "function" && thing.dispose.length === 0;
}
function dispose(arg) {
    if (Iterable.is(arg)) {
        const errors = [];
        for (const d of arg) {
            if (d) {
                try {
                    d.dispose();
                } catch (e) {
                    errors.push(e);
                }
            }
        }
        if (errors.length === 1) {
            throw errors[0];
        } else if (errors.length > 1) {
            throw ( new AggregateError(errors, "Encountered errors while disposing of store"));
        }
        return Array.isArray(arg) ? [] : arg;
    } else if (arg) {
        arg.dispose();
        return arg;
    }
}
function disposeIfDisposable(disposables) {
    for (const d of disposables) {
        if (isDisposable(d)) {
            d.dispose();
        }
    }
    return [];
}
function combinedDisposable(...disposables) {
    const parent = toDisposable(() => dispose(disposables));
    setParentOfDisposables(disposables, parent);
    return parent;
}
class FunctionDisposable {
    constructor(fn) {
        this._isDisposed = false;
        this._fn = fn;
        trackDisposable(this);
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        if (!this._fn) {
            throw ( new Error(
                `Unbound disposable context: Need to use an arrow function to preserve the value of this`
            ));
        }
        this._isDisposed = true;
        markAsDisposed(this);
        this._fn();
    }
}
function toDisposable(fn) {
    return ( new FunctionDisposable(fn));
}
class DisposableStore {
    static {
        this.DISABLE_DISPOSED_WARNING = false;
    }
    constructor() {
        this._toDispose = ( new Set());
        this._isDisposed = false;
        trackDisposable(this);
    }
    dispose() {
        if (this._isDisposed) {
            return;
        }
        markAsDisposed(this);
        this._isDisposed = true;
        this.clear();
    }
    get isDisposed() {
        return this._isDisposed;
    }
    clear() {
        if (this._toDispose.size === 0) {
            return;
        }
        try {
            dispose(this._toDispose);
        } finally {
            this._toDispose.clear();
        }
    }
    add(o) {
        if (!o || o === Disposable.None) {
            return o;
        }
        if (o === this) {
            throw ( new Error("Cannot register a disposable on itself!"));
        }
        setParentOfDisposable(o, this);
        if (this._isDisposed) {
            if (!DisposableStore.DISABLE_DISPOSED_WARNING) {
                console.warn(( new Error(
                    "Trying to add a disposable to a DisposableStore that has already been disposed of. The added object will be leaked!"
                )).stack);
            }
        } else {
            this._toDispose.add(o);
        }
        return o;
    }
    delete(o) {
        if (!o) {
            return;
        }
        if (o === this) {
            throw ( new Error("Cannot dispose a disposable on itself!"));
        }
        this._toDispose.delete(o);
        o.dispose();
    }
    deleteAndLeak(o) {
        if (!o) {
            return;
        }
        if (this._toDispose.delete(o)) {
            setParentOfDisposable(o, null);
        }
    }
    assertNotDisposed() {
        if (this._isDisposed) {
            onUnexpectedError(( new BugIndicatingError("Object disposed")));
        }
    }
}
class Disposable {
    static {
        this.None = ( Object.freeze({
            dispose() {}
        }));
    }
    constructor() {
        this._store = ( new DisposableStore());
        trackDisposable(this);
        setParentOfDisposable(this._store, this);
    }
    dispose() {
        markAsDisposed(this);
        this._store.dispose();
    }
    _register(o) {
        if (o === this) {
            throw ( new Error("Cannot register a disposable on itself!"));
        }
        return this._store.add(o);
    }
}
class MutableDisposable {
    constructor() {
        this._isDisposed = false;
        trackDisposable(this);
    }
    get value() {
        return this._isDisposed ? undefined : this._value;
    }
    set value(value) {
        if (this._isDisposed || value === this._value) {
            return;
        }
        this._value?.dispose();
        if (value) {
            setParentOfDisposable(value, this);
        }
        this._value = value;
    }
    clear() {
        this.value = undefined;
    }
    dispose() {
        this._isDisposed = true;
        markAsDisposed(this);
        this._value?.dispose();
        this._value = undefined;
    }
    clearAndLeak() {
        const oldValue = this._value;
        this._value = undefined;
        if (oldValue) {
            setParentOfDisposable(oldValue, null);
        }
        return oldValue;
    }
}
class MandatoryMutableDisposable {
    constructor(initialValue) {
        this._disposable = ( new MutableDisposable());
        this._isDisposed = false;
        this._disposable.value = initialValue;
    }
    get value() {
        return this._disposable.value;
    }
    set value(value) {
        if (this._isDisposed || value === this._disposable.value) {
            return;
        }
        this._disposable.value = value;
    }
    dispose() {
        this._isDisposed = true;
        this._disposable.dispose();
    }
}
class RefCountedDisposable {
    constructor(_disposable) {
        this._disposable = _disposable;
        this._counter = 1;
    }
    acquire() {
        this._counter++;
        return this;
    }
    release() {
        if (--this._counter === 0) {
            this._disposable.dispose();
        }
        return this;
    }
}
class ReferenceCollection {
    constructor() {
        this.references = ( new Map());
    }
    acquire(key, ...args) {
        let reference = this.references.get(key);
        if (!reference) {
            reference = {
                counter: 0,
                object: this.createReferencedObject(key, ...args)
            };
            this.references.set(key, reference);
        }
        const {
            object
        } = reference;
        const dispose = createSingleCallFunction(() => {
            if (--reference.counter === 0) {
                this.destroyReferencedObject(key, reference.object);
                this.references.delete(key);
            }
        });
        reference.counter++;
        return {
            object,
            dispose
        };
    }
}
class AsyncReferenceCollection {
    constructor(referenceCollection) {
        this.referenceCollection = referenceCollection;
    }
    async acquire(key, ...args) {
        const ref = this.referenceCollection.acquire(key, ...args);
        try {
            const object = await ref.object;
            return {
                object,
                dispose: () => ref.dispose()
            };
        } catch (error) {
            ref.dispose();
            throw error;
        }
    }
}
class ImmortalReference {
    constructor(object) {
        this.object = object;
    }
    dispose() {}
}
class DisposableMap {
    constructor(
        store = ( new Map())
    ) {
        this._isDisposed = false;
        this._store = store;
        trackDisposable(this);
    }
    dispose() {
        markAsDisposed(this);
        this._isDisposed = true;
        this.clearAndDisposeAll();
    }
    clearAndDisposeAll() {
        if (!this._store.size) {
            return;
        }
        try {
            dispose(( this._store.values()));
        } finally {
            this._store.clear();
        }
    }
    has(key) {
        return ( this._store.has(key));
    }
    get size() {
        return this._store.size;
    }
    get(key) {
        return this._store.get(key);
    }
    set(key, value, skipDisposeOnOverwrite = false) {
        if (this._isDisposed) {
            console.warn(( new Error(
                "Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!"
            )).stack);
        }
        if (!skipDisposeOnOverwrite) {
            this._store.get(key)?.dispose();
        }
        this._store.set(key, value);
        setParentOfDisposable(value, this);
    }
    deleteAndDispose(key) {
        this._store.get(key)?.dispose();
        this._store.delete(key);
    }
    deleteAndLeak(key) {
        const value = this._store.get(key);
        if (value) {
            setParentOfDisposable(value, null);
        }
        this._store.delete(key);
        return value;
    }
    keys() {
        return ( this._store.keys());
    }
    values() {
        return ( this._store.values());
    }
    [Symbol.iterator]() {
        return this._store[Symbol.iterator]();
    }
}
class DisposableSet {
    constructor(
        store = ( new Set())
    ) {
        this._isDisposed = false;
        this._store = store;
        trackDisposable(this);
    }
    dispose() {
        markAsDisposed(this);
        this._isDisposed = true;
        this.clearAndDisposeAll();
    }
    clearAndDisposeAll() {
        if (!this._store.size) {
            return;
        }
        try {
            dispose(( this._store.values()));
        } finally {
            this._store.clear();
        }
    }
    has(value) {
        return ( this._store.has(value));
    }
    get size() {
        return this._store.size;
    }
    add(value) {
        if (this._isDisposed) {
            console.warn(( new Error(
                "Trying to add a disposable to a DisposableSet that has already been disposed of. The added object will be leaked!"
            )).stack);
        }
        this._store.add(value);
        setParentOfDisposable(value, this);
    }
    deleteAndDispose(value) {
        if (this._store.delete(value)) {
            value.dispose();
        }
    }
    deleteAndLeak(value) {
        if (this._store.delete(value)) {
            setParentOfDisposable(value, null);
            return value;
        }
        return undefined;
    }
    values() {
        return ( this._store.values());
    }
    [Symbol.iterator]() {
        return this._store[Symbol.iterator]();
    }
}
function thenIfNotDisposed(promise, then) {
    let disposed = false;
    promise.then(result => {
        if (disposed) {
            return;
        }
        then(result);
    });
    return toDisposable(() => {
        disposed = true;
    });
}
function thenRegisterOrDispose(promise, store) {
    return promise.then(disposable => {
        if (store.isDisposed) {
            disposable.dispose();
        } else {
            store.add(disposable);
        }
        return disposable;
    });
}
class DisposableResourceMap extends DisposableMap {
    constructor() {
        super(( new ResourceMap()));
    }
}

export { AsyncReferenceCollection, Disposable, DisposableMap, DisposableResourceMap, DisposableSet, DisposableStore, DisposableTracker, GCBasedDisposableTracker, ImmortalReference, MandatoryMutableDisposable, MutableDisposable, RefCountedDisposable, ReferenceCollection, combinedDisposable, dispose, disposeIfDisposable, isDisposable, markAsDisposed, markAsSingleton, setDisposableTracker, thenIfNotDisposed, thenRegisterOrDispose, toDisposable, trackDisposable };
