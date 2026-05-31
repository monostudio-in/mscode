
import { addDisposableListener, EventType } from '../../../../base/browser/dom.js';
import { Disposable } from '../../../../base/common/lifecycle.js';

class WebviewWindowDragMonitor extends Disposable {
    constructor(targetWindow, getWebview) {
        super();
        const onDragStart = () => {
            getWebview()?.windowDidDragStart();
        };
        const onDragEnd = () => {
            getWebview()?.windowDidDragEnd();
        };
        this._register(addDisposableListener(targetWindow, EventType.DRAG_START, () => {
            onDragStart();
        }));
        this._register(addDisposableListener(targetWindow, EventType.DRAG_END, onDragEnd));
        this._register(addDisposableListener(targetWindow, EventType.MOUSE_MOVE, currentEvent => {
            if (currentEvent.buttons === 0) {
                onDragEnd();
            }
        }));
        this._register(addDisposableListener(targetWindow, EventType.DRAG, (event) => {
            if (event.shiftKey) {
                onDragEnd();
            }
            else {
                onDragStart();
            }
        }));
        this._register(addDisposableListener(targetWindow, EventType.DRAG_OVER, (event) => {
            if (event.shiftKey) {
                onDragEnd();
            }
            else {
                onDragStart();
            }
        }));
    }
}

export { WebviewWindowDragMonitor };
