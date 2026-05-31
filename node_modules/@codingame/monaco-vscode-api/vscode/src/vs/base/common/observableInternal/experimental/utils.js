
import { BugIndicatingError } from '../../errors.js';
import '../../equals.js';
import '../../event.js';
import { DisposableStore } from '../../lifecycle.js';
import { getDebugName, DebugNameData } from '../debugName.js';
import { observableFromEvent } from '../observables/observableFromEvent.js';
import { autorunOpts } from '../reactions/autorun.js';
import { derivedObservableWithCache } from '../utils/utils.js';

function latestChangedValue(owner, observables) {
    if (observables.length === 0) {
        throw ( new BugIndicatingError());
    }
    let hasLastChangedValue = false;
    let lastChangedValue = undefined;
    const result = observableFromEvent(owner, cb => {
        const store = ( new DisposableStore());
        for (const o of observables) {
            store.add(autorunOpts({
                debugName: () => getDebugName(result, ( new DebugNameData(owner, undefined, undefined))) + ".updateLastChangedValue"
            }, reader => {
                hasLastChangedValue = true;
                lastChangedValue = o.read(reader);
                cb();
            }));
        }
        store.add({
            dispose() {
                hasLastChangedValue = false;
                lastChangedValue = undefined;
            }
        });
        return store;
    }, () => {
        if (hasLastChangedValue) {
            return lastChangedValue;
        } else {
            return observables[observables.length - 1].get();
        }
    });
    return result;
}
function derivedConstOnceDefined(owner, fn) {
    return derivedObservableWithCache(owner, (reader, lastValue) => lastValue ?? fn(reader));
}

export { derivedConstOnceDefined, latestChangedValue };
