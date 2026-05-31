
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { ContextView, ContextViewDOMPosition } from '../../../base/browser/ui/contextview/contextview.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILayoutService } from '../../layout/browser/layoutService.service.js';
import { getWindow } from '../../../base/browser/dom.js';

let ContextViewHandler = class ContextViewHandler extends Disposable {
    constructor(layoutService) {
        super();
        this.layoutService = layoutService;
        this.contextView = this._register(( new ContextView(this.layoutService.mainContainer, ContextViewDOMPosition.ABSOLUTE)));
        this.layout();
        this._register(layoutService.onDidLayoutContainer(() => this.layout()));
    }
    showContextView(delegate, container, shadowRoot) {
        let domPosition;
        if (container) {
            if (container === this.layoutService.getContainer(getWindow(container))) {
                domPosition = ContextViewDOMPosition.ABSOLUTE;
            } else if (shadowRoot) {
                domPosition = ContextViewDOMPosition.FIXED_SHADOW;
            } else {
                domPosition = ContextViewDOMPosition.FIXED;
            }
        } else {
            domPosition = ContextViewDOMPosition.ABSOLUTE;
        }
        this.contextView.setContainer(container ?? this.layoutService.activeContainer, domPosition);
        this.contextView.show(delegate);
        const openContextView = {
            close: () => {
                if (this.openContextView === openContextView) {
                    this.hideContextView();
                }
            }
        };
        this.openContextView = openContextView;
        return openContextView;
    }
    layout() {
        this.contextView.layout();
    }
    hideContextView(data) {
        this.contextView.hide(data);
        this.openContextView = undefined;
    }
};
ContextViewHandler = ( __decorate([( __param(0, ILayoutService))], ContextViewHandler));
class ContextViewService extends ContextViewHandler {
    getContextViewElement() {
        return this.contextView.getViewElement();
    }
}

export { ContextViewHandler, ContextViewService };
