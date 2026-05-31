
import { transaction } from '../transaction.js';
import { DebugNameData } from '../debugName.js';
import { BaseObservable } from './baseObservable.js';
import { DebugLocation } from '../debugLocation.js';

function observableSignalFromEvent(owner, event, debugLocation = DebugLocation.ofCaller()) {
    return ( new FromEventObservableSignal(typeof owner === "string" ? owner : ( new DebugNameData(owner, undefined, undefined)), event, debugLocation));
}
class FromEventObservableSignal extends BaseObservable {
    constructor(debugNameDataOrName, event, debugLocation) {
        super(debugLocation);
        this.event = event;
        this.handleEvent = () => {
            transaction(tx => {
                for (const o of this._observers) {
                    tx.updateObserver(o, this);
                    o.handleChange(this, undefined);
                }
            }, () => this.debugName);
        };
        this.debugName = typeof debugNameDataOrName === "string" ? debugNameDataOrName : debugNameDataOrName.getDebugName(this) ?? "Observable Signal From Event";
    }
    onFirstObserverAdded() {
        this.subscription = this.event(this.handleEvent);
    }
    onLastObserverRemoved() {
        this.subscription.dispose();
        this.subscription = undefined;
    }
    get() {}
}

export { observableSignalFromEvent };
