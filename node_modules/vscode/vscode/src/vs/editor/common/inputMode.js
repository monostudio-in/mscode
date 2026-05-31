
import { Emitter } from '../../base/common/event.js';

class InputModeImpl {
    constructor() {
        this._inputMode = "insert";
        this._onDidChangeInputMode = ( new Emitter());
        this.onDidChangeInputMode = this._onDidChangeInputMode.event;
    }
    getInputMode() {
        return this._inputMode;
    }
    setInputMode(inputMode) {
        this._inputMode = inputMode;
        this._onDidChangeInputMode.fire(this._inputMode);
    }
}
const InputMode = ( new InputModeImpl());

export { InputMode };
