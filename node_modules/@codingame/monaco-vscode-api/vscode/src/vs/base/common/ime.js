
import { Emitter } from './event.js';

class IMEImpl {
    constructor() {
        this._onDidChange = ( new Emitter());
        this.onDidChange = this._onDidChange.event;
        this._enabled = true;
    }
    get enabled() {
        return this._enabled;
    }
    enable() {
        this._enabled = true;
        this._onDidChange.fire();
    }
    disable() {
        this._enabled = false;
        this._onDidChange.fire();
    }
}
const IME = ( new IMEImpl());

export { IME, IMEImpl };
