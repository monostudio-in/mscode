
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { $ as $$1, append } from '../../../../base/browser/dom.js';
import { HoverAction } from '../../../../base/browser/ui/hover/hoverWidget.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.service.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.service.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';

const $ = $$1;
let EditorHoverStatusBar = class EditorHoverStatusBar extends Disposable {
    get hasContent() {
        return this._hasContent;
    }
    constructor(_keybindingService, _hoverService) {
        super();
        this._keybindingService = _keybindingService;
        this._hoverService = _hoverService;
        this.actions = [];
        this._hasContent = false;
        this.hoverElement = $("div.hover-row.status-bar");
        this.hoverElement.tabIndex = 0;
        this.actionsElement = append(this.hoverElement, $("div.actions"));
    }
    addAction(actionOptions) {
        const keybinding = this._keybindingService.lookupKeybinding(actionOptions.commandId);
        const keybindingLabel = keybinding ? keybinding.getLabel() : null;
        this._hasContent = true;
        const action = this._register(HoverAction.render(this.actionsElement, actionOptions, keybindingLabel));
        this._register(this._hoverService.setupManagedHover(
            getDefaultHoverDelegate("element"),
            action.actionContainer,
            action.actionRenderedLabel
        ));
        this.actions.push(action);
        return action;
    }
    append(element) {
        const result = append(this.actionsElement, element);
        this._hasContent = true;
        return result;
    }
};
EditorHoverStatusBar = ( __decorate([( __param(0, IKeybindingService)), ( __param(1, IHoverService))], EditorHoverStatusBar));

export { EditorHoverStatusBar };
