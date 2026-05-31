
import { registerCss } from '../../../../../../../../css.js';
import * as colorPicker from '../colorPicker.css';
import { append, createElement, addDisposableListener, EventType } from '../../../../../base/browser/dom.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';

registerCss(colorPicker);
class InsertButton extends Disposable {
    constructor(container) {
        super();
        this._onClicked = this._register(( new Emitter()));
        this.onClicked = this._onClicked.event;
        this._button = append(container, createElement("button"));
        this._button.classList.add("insert-button");
        this._button.textContent = "Insert";
        this._register(addDisposableListener(this._button, EventType.CLICK, () => {
            this._onClicked.fire();
        }));
    }
    get button() {
        return this._button;
    }
}

export { InsertButton };
