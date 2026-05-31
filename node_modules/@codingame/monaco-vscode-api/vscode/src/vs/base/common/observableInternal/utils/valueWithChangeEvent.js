
import '../../errors.js';
import '../../equals.js';
import { Event } from '../../event.js';
import '../../lifecycle.js';
import { observableFromEvent } from '../observables/observableFromEvent.js';

class ValueWithChangeEventFromObservable {
    constructor(observable) {
        this.observable = observable;
    }
    get onDidChange() {
        return Event.fromObservableLight(this.observable);
    }
    get value() {
        return this.observable.get();
    }
}
function observableFromValueWithChangeEvent(owner, value) {
    if (value instanceof ValueWithChangeEventFromObservable) {
        return value.observable;
    }
    return observableFromEvent(owner, value.onDidChange, () => value.value);
}

export { ValueWithChangeEventFromObservable, observableFromValueWithChangeEvent };
