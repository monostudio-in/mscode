
import '../../errors.js';
import { strictEquals } from '../../equals.js';
import '../../event.js';
import { DisposableStore } from '../../lifecycle.js';
import { DebugLocation } from '../debugLocation.js';
import { DebugNameData } from '../debugName.js';
import { _setDerivedOpts } from './baseObservable.js';
import { Derived, DerivedWithSetter } from './derivedImpl.js';

function derived(computeFnOrOwner, computeFn, debugLocation = DebugLocation.ofCaller()) {
    if (computeFn !== undefined) {
        return ( new Derived(( new DebugNameData(computeFnOrOwner, undefined, computeFn)), computeFn, undefined, undefined, strictEquals, debugLocation));
    }
    return ( new Derived((
    new DebugNameData(undefined, undefined, computeFnOrOwner)),
    computeFnOrOwner, undefined, undefined, strictEquals, debugLocation));
}
function derivedWithSetter(owner, computeFn, setter, debugLocation = DebugLocation.ofCaller()) {
    return ( new DerivedWithSetter(( new DebugNameData(owner, undefined, computeFn)), computeFn, undefined, undefined, strictEquals, setter, debugLocation));
}
function derivedOpts(options, computeFn, debugLocation = DebugLocation.ofCaller()) {
    return ( new Derived(( new DebugNameData(options.owner, options.debugName, options.debugReferenceFn)), computeFn, undefined, options.onLastObserverRemoved, options.equalsFn ?? strictEquals, debugLocation));
}
_setDerivedOpts(derivedOpts);
function derivedHandleChanges(options, computeFn, debugLocation = DebugLocation.ofCaller()) {
    return ( new Derived(( new DebugNameData(options.owner, options.debugName, undefined)), computeFn, options.changeTracker, undefined, options.equalityComparer ?? strictEquals, debugLocation));
}
function derivedDisposable(
    computeFnOrOwner,
    computeFnOrUndefined,
    debugLocation = DebugLocation.ofCaller()
) {
    let computeFn;
    let owner;
    if (computeFnOrUndefined === undefined) {
        computeFn = computeFnOrOwner;
        owner = undefined;
    } else {
        owner = computeFnOrOwner;
        computeFn = computeFnOrUndefined;
    }
    let store = undefined;
    return ( new Derived(( new DebugNameData(owner, undefined, computeFn)), r => {
        if (!store) {
            store = ( new DisposableStore());
        } else {
            store.clear();
        }
        const result = computeFn(r);
        if (result) {
            store.add(result);
        }
        return result;
    }, undefined, () => {
        if (store) {
            store.dispose();
            store = undefined;
        }
    }, strictEquals, debugLocation));
}

export { derived, derivedDisposable, derivedHandleChanges, derivedOpts, derivedWithSetter };
