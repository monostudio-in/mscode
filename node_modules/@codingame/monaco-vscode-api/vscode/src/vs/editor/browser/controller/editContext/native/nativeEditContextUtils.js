
import { __decorate, __param } from '../../../../../../../../external/tslib/tslib.es6.js';
import { addDisposableListener, getShadowRoot, getActiveElement } from '../../../../../base/browser/dom.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ILogService } from '../../../../../platform/log/common/log.service.js';

let FocusTracker = class FocusTracker extends Disposable {
    constructor(_logService, _domNode, _onFocusChange) {
        super();
        this._domNode = _domNode;
        this._onFocusChange = _onFocusChange;
        this._isFocused = false;
        this._isPaused = false;
        this._register(addDisposableListener(this._domNode, "focus", () => {
            _logService.trace("NativeEditContext.focus");
            if (this._isPaused) {
                return;
            }
            this.refreshFocusState();
        }));
        this._register(addDisposableListener(this._domNode, "blur", () => {
            _logService.trace("NativeEditContext.blur");
            if (this._isPaused) {
                return;
            }
            this._handleFocusedChanged(false);
        }));
    }
    pause() {
        this._isPaused = true;
    }
    resume() {
        this._isPaused = false;
        this.refreshFocusState();
    }
    _handleFocusedChanged(focused) {
        if (this._isFocused === focused) {
            return;
        }
        this._isFocused = focused;
        this._onFocusChange(this._isFocused);
    }
    focus() {
        this._domNode.focus();
        this.refreshFocusState();
        setTimeout(() => this.refreshFocusState(), 0);
    }
    refreshFocusState() {
        const shadowRoot = getShadowRoot(this._domNode);
        const activeElement = shadowRoot ? shadowRoot.activeElement : getActiveElement();
        const focused = this._domNode === activeElement;
        this._handleFocusedChanged(focused);
    }
    get isFocused() {
        return this._isFocused;
    }
};
FocusTracker = ( __decorate([( __param(0, ILogService))], FocusTracker));
function editContextAddDisposableListener(target, type, listener, options) {
    target.addEventListener(type, listener, options);
    return {
        dispose() {
            target.removeEventListener(type, listener);
        }
    };
}

export { FocusTracker, editContextAddDisposableListener };
