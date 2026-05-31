
import { registerCss } from '../../../../../../../css.js';
import { isMacintosh } from '../../../common/platform.js';
import '../list/listWidget.js';
import { Widget } from '../widget.js';
import * as selectBox from './selectBox.css';
import { SelectBoxList } from './selectBoxCustom.js';
import { SelectBoxNative } from './selectBoxNative.js';

registerCss(selectBox);
const SeparatorSelectOption = ( Object.freeze({
    text: "─────────",
    isDisabled: true,
    isSeparator: true
}));
class SelectBox extends Widget {
    constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
        super();
        if (isMacintosh && !selectBoxOptions?.useCustomDrawn) {
            this.selectBoxDelegate = ( new SelectBoxNative(options, selected, styles, selectBoxOptions));
        } else {
            this.selectBoxDelegate = ( new SelectBoxList(options, selected, contextViewProvider, styles, selectBoxOptions));
        }
        this._register(this.selectBoxDelegate);
    }
    get onDidSelect() {
        return this.selectBoxDelegate.onDidSelect;
    }
    setOptions(options, selected) {
        this.selectBoxDelegate.setOptions(options, selected);
    }
    select(index) {
        this.selectBoxDelegate.select(index);
    }
    setAriaLabel(label) {
        this.selectBoxDelegate.setAriaLabel(label);
    }
    focus() {
        this.selectBoxDelegate.focus();
    }
    blur() {
        this.selectBoxDelegate.blur();
    }
    setFocusable(focusable) {
        this.selectBoxDelegate.setFocusable(focusable);
    }
    setEnabled(enabled) {
        this.selectBoxDelegate.setEnabled(enabled);
    }
    render(container) {
        this.selectBoxDelegate.render(container);
    }
}

export { SelectBox, SeparatorSelectOption };
