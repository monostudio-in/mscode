
import { Emitter } from '../../../../base/common/event.js';
import { ViewPart } from '../../view/viewPart.js';

class AbstractEditContext extends ViewPart {
    constructor() {
        super(...arguments);
        this._onWillCopy = this._register(( new Emitter()));
        this.onWillCopy = this._onWillCopy.event;
        this._onWillCut = this._register(( new Emitter()));
        this.onWillCut = this._onWillCut.event;
        this._onWillPaste = this._register(( new Emitter()));
        this.onWillPaste = this._onWillPaste.event;
    }
}

export { AbstractEditContext };
