
import { Emitter } from '../common/event.js';

class DomEmitter {
    get event() {
        return this.emitter.event;
    }
    constructor(element, type, useCapture) {
        const fn = e => this.emitter.fire(e);
        this.emitter = ( new Emitter({
            onWillAddFirstListener: () => element.addEventListener(type, fn, useCapture),
            onDidRemoveLastListener: () => element.removeEventListener(type, fn, useCapture)
        }));
    }
    dispose() {
        this.emitter.dispose();
    }
}

export { DomEmitter };
