
import { addDisposableListener, EventType, getWindow } from '../dom.js';
import { StandardKeyboardEvent } from '../keyboardEvent.js';
import { StandardMouseEvent } from '../mouseEvent.js';
import { Gesture } from '../touch.js';
import { Disposable } from '../../common/lifecycle.js';

class Widget extends Disposable {
    onclick(domNode, listener) {
        this._register(
            addDisposableListener(domNode, EventType.CLICK, e => listener(( new StandardMouseEvent(getWindow(domNode), e))))
        );
    }
    onmousedown(domNode, listener) {
        this._register(
            addDisposableListener(domNode, EventType.MOUSE_DOWN, e => listener(( new StandardMouseEvent(getWindow(domNode), e))))
        );
    }
    onmouseover(domNode, listener) {
        this._register(
            addDisposableListener(domNode, EventType.MOUSE_OVER, e => listener(( new StandardMouseEvent(getWindow(domNode), e))))
        );
    }
    onmouseleave(domNode, listener) {
        this._register(
            addDisposableListener(domNode, EventType.MOUSE_LEAVE, e => listener(( new StandardMouseEvent(getWindow(domNode), e))))
        );
    }
    onkeydown(domNode, listener) {
        this._register(
            addDisposableListener(domNode, EventType.KEY_DOWN, e => listener(( new StandardKeyboardEvent(e))))
        );
    }
    onkeyup(domNode, listener) {
        this._register(
            addDisposableListener(domNode, EventType.KEY_UP, e => listener(( new StandardKeyboardEvent(e))))
        );
    }
    oninput(domNode, listener) {
        this._register(addDisposableListener(domNode, EventType.INPUT, listener));
    }
    onblur(domNode, listener) {
        this._register(addDisposableListener(domNode, EventType.BLUR, listener));
    }
    onfocus(domNode, listener) {
        this._register(addDisposableListener(domNode, EventType.FOCUS, listener));
    }
    onchange(domNode, listener) {
        this._register(addDisposableListener(domNode, EventType.CHANGE, listener));
    }
    ignoreGesture(domNode) {
        return Gesture.ignoreTarget(domNode);
    }
}

export { Widget };
