
import { createElement, addDisposableListener, addStandardDisposableListener, EventHelper } from '../../dom.js';
import { Gesture, EventType } from '../../touch.js';
import { equals } from '../../../common/arrays.js';
import { Emitter } from '../../../common/event.js';
import { KeyCode } from '../../../common/keyCodes.js';
import { Disposable } from '../../../common/lifecycle.js';
import { isMacintosh } from '../../../common/platform.js';

class SelectBoxNative extends Disposable {
    constructor(options, selected, styles, selectBoxOptions) {
        super();
        this.selected = 0;
        this.selectBoxOptions = selectBoxOptions || Object.create(null);
        this.options = [];
        this.selectElement = createElement("select");
        this.selectElement.className = "monaco-select-box";
        if (typeof this.selectBoxOptions.ariaLabel === "string") {
            this.selectElement.setAttribute("aria-label", this.selectBoxOptions.ariaLabel);
        }
        if (typeof this.selectBoxOptions.ariaDescription === "string") {
            this.selectElement.setAttribute("aria-description", this.selectBoxOptions.ariaDescription);
        }
        this._onDidSelect = this._register(( new Emitter()));
        this.styles = styles;
        this.registerListeners();
        this.setOptions(options, selected);
    }
    registerListeners() {
        this._register(Gesture.addTarget(this.selectElement));
        [EventType.Tap].forEach(eventType => {
            this._register(addDisposableListener(this.selectElement, eventType, e => {
                this.selectElement.focus();
            }));
        });
        this._register(addStandardDisposableListener(this.selectElement, "click", e => {
            EventHelper.stop(e, true);
        }));
        this._register(addStandardDisposableListener(this.selectElement, "change", e => {
            this.selectElement.title = e.target.value;
            this._onDidSelect.fire({
                index: e.target.selectedIndex,
                selected: e.target.value
            });
        }));
        this._register(addStandardDisposableListener(this.selectElement, "keydown", e => {
            let showSelect = false;
            if (isMacintosh) {
                if (e.keyCode === KeyCode.DownArrow || e.keyCode === KeyCode.UpArrow || e.keyCode === KeyCode.Space) {
                    showSelect = true;
                }
            } else {
                if (e.keyCode === KeyCode.DownArrow && e.altKey || e.keyCode === KeyCode.Space || e.keyCode === KeyCode.Enter) {
                    showSelect = true;
                }
            }
            if (showSelect) {
                e.stopPropagation();
            }
        }));
    }
    get onDidSelect() {
        return this._onDidSelect.event;
    }
    setOptions(options, selected) {
        if (!this.options || !equals(this.options, options)) {
            this.options = options;
            this.selectElement.options.length = 0;
            this.options.forEach((option, index) => {
                this.selectElement.add(
                    this.createOption(option.text, index, option.isDisabled, option.isSeparator)
                );
            });
        }
        if (selected !== undefined) {
            this.select(selected);
        }
    }
    select(index) {
        if (this.options.length === 0) {
            this.selected = 0;
        } else if (index >= 0 && index < this.options.length) {
            this.selected = index;
        } else if (index > this.options.length - 1) {
            this.select(this.options.length - 1);
        } else if (this.selected < 0) {
            this.selected = 0;
        }
        this.selectElement.selectedIndex = this.selected;
        if ((this.selected < this.options.length) && typeof this.options[this.selected].text === "string") {
            this.selectElement.title = this.options[this.selected].text;
        } else {
            this.selectElement.title = "";
        }
    }
    setAriaLabel(label) {
        this.selectBoxOptions.ariaLabel = label;
        this.selectElement.setAttribute("aria-label", label);
    }
    focus() {
        if (this.selectElement) {
            this.selectElement.tabIndex = 0;
            this.selectElement.focus();
        }
    }
    blur() {
        if (this.selectElement) {
            this.selectElement.tabIndex = -1;
            this.selectElement.blur();
        }
    }
    setEnabled(enable) {
        this.selectElement.disabled = !enable;
    }
    setFocusable(focusable) {
        this.selectElement.tabIndex = focusable ? 0 : -1;
    }
    render(container) {
        container.classList.add("select-container");
        container.appendChild(this.selectElement);
        this.setOptions(this.options, this.selected);
        this.applyStyles();
    }
    style(styles) {
        this.styles = styles;
        this.applyStyles();
    }
    applyStyles() {
        if (this.selectElement) {
            this.selectElement.style.backgroundColor = this.styles.selectBackground ?? "";
            this.selectElement.style.color = this.styles.selectForeground ?? "";
            this.selectElement.style.borderColor = this.styles.selectBorder ?? "";
        }
    }
    createOption(value, index, disabled, isSeparator) {
        const option = createElement("option");
        option.value = value;
        option.text = value;
        option.disabled = !!disabled || !!isSeparator;
        if (isSeparator) {
            option.setAttribute("role", "separator");
        }
        return option;
    }
}

export { SelectBoxNative };
