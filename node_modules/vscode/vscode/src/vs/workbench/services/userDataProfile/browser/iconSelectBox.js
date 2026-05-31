
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { IconSelectBox } from '../../../../base/browser/ui/icons/iconSelectBox.js';
import { KeyCode } from '../../../../base/common/keyCodes.js';
import { trackFocus } from '../../../../base/browser/dom.js';
import { RawContextKey, ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../../platform/keybinding/common/keybindingsRegistry.js';

var WorkbenchIconSelectBox_1;
const WorkbenchIconSelectBoxFocusContextKey = ( new RawContextKey("iconSelectBoxFocus", true));
const WorkbenchIconSelectBoxInputFocusContextKey = ( new RawContextKey("iconSelectBoxInputFocus", true));
const WorkbenchIconSelectBoxInputEmptyContextKey = ( new RawContextKey("iconSelectBoxInputEmpty", true));
let WorkbenchIconSelectBox = class WorkbenchIconSelectBox extends IconSelectBox {
    static {
        WorkbenchIconSelectBox_1 = this;
    }
    static getFocusedWidget() {
        return WorkbenchIconSelectBox_1.focusedWidget;
    }
    constructor(options, contextKeyService) {
        super(options);
        this.contextKeyService = this._register(contextKeyService.createScoped(this.domNode));
        WorkbenchIconSelectBoxFocusContextKey.bindTo(this.contextKeyService);
        this.inputFocusContextKey = WorkbenchIconSelectBoxInputFocusContextKey.bindTo(this.contextKeyService);
        this.inputEmptyContextKey = WorkbenchIconSelectBoxInputEmptyContextKey.bindTo(this.contextKeyService);
        if (this.inputBox) {
            const focusTracker = this._register(trackFocus(this.inputBox.inputElement));
            this._register(focusTracker.onDidFocus(() => this.inputFocusContextKey.set(true)));
            this._register(focusTracker.onDidBlur(() => this.inputFocusContextKey.set(false)));
            this._register(
                this.inputBox.onDidChange(() => this.inputEmptyContextKey.set(this.inputBox?.value.length === 0))
            );
        }
    }
    focus() {
        super.focus();
        WorkbenchIconSelectBox_1.focusedWidget = this;
    }
};
WorkbenchIconSelectBox = WorkbenchIconSelectBox_1 = ( __decorate([( __param(1, IContextKeyService))], WorkbenchIconSelectBox));
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "iconSelectBox.focusUp",
    weight: KeybindingWeight.WorkbenchContrib,
    when: WorkbenchIconSelectBoxFocusContextKey,
    primary: KeyCode.UpArrow,
    handler: () => {
        const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
        if (selectBox) {
            selectBox.focusPreviousRow();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "iconSelectBox.focusDown",
    weight: KeybindingWeight.WorkbenchContrib,
    when: WorkbenchIconSelectBoxFocusContextKey,
    primary: KeyCode.DownArrow,
    handler: () => {
        const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
        if (selectBox) {
            selectBox.focusNextRow();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "iconSelectBox.focusNext",
    weight: KeybindingWeight.WorkbenchContrib,
    when: ( ContextKeyExpr.and(WorkbenchIconSelectBoxFocusContextKey, ( ContextKeyExpr.or(WorkbenchIconSelectBoxInputEmptyContextKey, ( WorkbenchIconSelectBoxInputFocusContextKey.toNegated()))))),
    primary: KeyCode.RightArrow,
    handler: () => {
        const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
        if (selectBox) {
            selectBox.focusNext();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "iconSelectBox.focusPrevious",
    weight: KeybindingWeight.WorkbenchContrib,
    when: ( ContextKeyExpr.and(WorkbenchIconSelectBoxFocusContextKey, ( ContextKeyExpr.or(WorkbenchIconSelectBoxInputEmptyContextKey, ( WorkbenchIconSelectBoxInputFocusContextKey.toNegated()))))),
    primary: KeyCode.LeftArrow,
    handler: () => {
        const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
        if (selectBox) {
            selectBox.focusPrevious();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "iconSelectBox.selectFocused",
    weight: KeybindingWeight.WorkbenchContrib,
    when: WorkbenchIconSelectBoxFocusContextKey,
    primary: KeyCode.Enter,
    handler: () => {
        const selectBox = WorkbenchIconSelectBox.getFocusedWidget();
        if (selectBox) {
            selectBox.setSelection(selectBox.getFocus()[0]);
        }
    }
});

export { WorkbenchIconSelectBox, WorkbenchIconSelectBoxFocusContextKey, WorkbenchIconSelectBoxInputEmptyContextKey, WorkbenchIconSelectBoxInputFocusContextKey };
