
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';

const IExtHostMeteredConnection = ( createDecorator("IExtHostMeteredConnection"));
class ExtHostMeteredConnection extends Disposable {
    constructor() {
        super();
        this._isConnectionMetered = false;
        this._onDidChangeIsConnectionMetered = this._register(( new Emitter()));
        this.onDidChangeIsConnectionMetered = this._onDidChangeIsConnectionMetered.event;
    }
    get isConnectionMetered() {
        return this._isConnectionMetered;
    }
    $initializeIsConnectionMetered(isMetered) {
        this._isConnectionMetered = isMetered;
    }
    $onDidChangeIsConnectionMetered(isMetered) {
        if (this._isConnectionMetered !== isMetered) {
            this._isConnectionMetered = isMetered;
            this._onDidChangeIsConnectionMetered.fire(isMetered);
        }
    }
}

export { ExtHostMeteredConnection, IExtHostMeteredConnection };
