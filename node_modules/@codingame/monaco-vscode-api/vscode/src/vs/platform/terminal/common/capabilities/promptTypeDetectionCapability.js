
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { TerminalCapability } from './capabilities.js';

class PromptTypeDetectionCapability extends Disposable {
    constructor() {
        super(...arguments);
        this.type = TerminalCapability.PromptTypeDetection;
        this._onPromptTypeChanged = this._register(( new Emitter()));
        this.onPromptTypeChanged = this._onPromptTypeChanged.event;
    }
    get promptType() {
        return this._promptType;
    }
    setPromptType(value) {
        this._promptType = value;
        this._onPromptTypeChanged.fire(value);
    }
}

export { PromptTypeDetectionCapability };
