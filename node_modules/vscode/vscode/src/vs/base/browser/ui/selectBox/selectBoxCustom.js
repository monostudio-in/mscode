
import { registerCss } from '../../../../../../../css.js';
import { localize } from '../../../../nls.js';
import { equals } from '../../../common/arrays.js';
import { Emitter, Event } from '../../../common/event.js';
import { KeyCode, KeyCodeUtils } from '../../../common/keyCodes.js';
import { Disposable, DisposableStore } from '../../../common/lifecycle.js';
import { isMacintosh } from '../../../common/platform.js';
import { ScrollbarVisibility } from '../../../common/scrollable.js';
import { asCssValueWithDefault } from '../../cssValue.js';
import { $ as $$1, append, createElement, addDisposableListener, EventType, EventHelper, addStandardDisposableListener, getWindow, getDomNodePagePosition, getTotalWidth, isAncestor } from '../../dom.js';
import { createStyleSheet } from '../../domStylesheets.js';
import { DomEmitter } from '../../event.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { renderMarkdown } from '../../markdownRenderer.js';
import '../contextview/contextview.js';
import { getBaseLayerHoverDelegate } from '../hover/hoverDelegate2.js';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.js';
import { List } from '../list/listWidget.js';
import * as selectBoxCustom from './selectBoxCustom.css';
import { AnchorPosition } from '../../../common/layout.js';

registerCss(selectBoxCustom);
const $ = $$1;
const SELECT_OPTION_ENTRY_TEMPLATE_ID = "selectOption.entry.template";
class SelectListRenderer {
    get templateId() {
        return SELECT_OPTION_ENTRY_TEMPLATE_ID;
    }
    renderTemplate(container) {
        const data = Object.create(null);
        data.root = container;
        data.text = append(container, $(".option-text"));
        data.detail = append(container, $(".option-detail"));
        data.decoratorRight = append(container, $(".option-decorator-right"));
        return data;
    }
    renderElement(element, index, templateData) {
        const data = templateData;
        const text = element.text;
        const detail = element.detail;
        const decoratorRight = element.decoratorRight;
        const isDisabled = element.isDisabled;
        data.text.textContent = text;
        data.detail.textContent = !!detail ? detail : "";
        data.decoratorRight.textContent = !!decoratorRight ? decoratorRight : "";
        if (isDisabled) {
            data.root.classList.add("option-disabled");
        } else {
            data.root.classList.remove("option-disabled");
        }
        if (element.isSeparator) {
            data.root.classList.add("option-separator");
            data.root.classList.add("option-disabled");
        } else {
            data.root.classList.remove("option-separator");
        }
    }
    disposeTemplate(_templateData) {}
}
class SelectBoxList extends Disposable {
    static {
        this.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN = 32;
    }
    static {
        this.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN = 2;
    }
    static {
        this.DEFAULT_MINIMUM_VISIBLE_OPTIONS = 3;
    }
    constructor(options, selected, contextViewProvider, styles, selectBoxOptions) {
        super();
        this.options = [];
        this._currentSelection = 0;
        this._hasDetails = false;
        this._selectionDetailsDisposables = this._register(( new DisposableStore()));
        this._skipLayout = false;
        this._sticky = false;
        this._isVisible = false;
        this.styles = styles;
        this.selectBoxOptions = selectBoxOptions || Object.create(null);
        if (typeof this.selectBoxOptions.minBottomMargin !== "number") {
            this.selectBoxOptions.minBottomMargin = SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_BOTTOM_MARGIN;
        } else if (this.selectBoxOptions.minBottomMargin < 0) {
            this.selectBoxOptions.minBottomMargin = 0;
        }
        this.selectElement = createElement("select");
        this.selectElement.className = "monaco-select-box";
        if (typeof this.selectBoxOptions.ariaLabel === "string") {
            this.selectElement.setAttribute("aria-label", this.selectBoxOptions.ariaLabel);
        }
        if (typeof this.selectBoxOptions.ariaDescription === "string") {
            this.selectElement.setAttribute("aria-description", this.selectBoxOptions.ariaDescription);
        }
        this._onDidSelect = ( new Emitter());
        this._register(this._onDidSelect);
        this.registerListeners();
        this.constructSelectDropDown(contextViewProvider);
        this.selected = selected || 0;
        if (options) {
            this.setOptions(options, selected);
        }
        this.initStyleSheet();
    }
    setTitle(title) {
        if (!this._hover && title) {
            this._hover = this._register(
                getBaseLayerHoverDelegate().setupManagedHover(getDefaultHoverDelegate("mouse"), this.selectElement, title)
            );
        } else if (this._hover) {
            this._hover.update(title);
        }
    }
    getHeight() {
        return 22;
    }
    getTemplateId() {
        return SELECT_OPTION_ENTRY_TEMPLATE_ID;
    }
    constructSelectDropDown(contextViewProvider) {
        this.contextViewProvider = contextViewProvider;
        this.selectDropDownContainer = $$1(".monaco-select-box-dropdown-container");
        this.selectionDetailsPane = append(this.selectDropDownContainer, $(".select-box-details-pane"));
        const widthControlOuterDiv = append(
            this.selectDropDownContainer,
            $(".select-box-dropdown-container-width-control")
        );
        const widthControlInnerDiv = append(widthControlOuterDiv, $(".width-control-div"));
        this.widthControlElement = createElement("span");
        this.widthControlElement.className = "option-text-width-control";
        append(widthControlInnerDiv, this.widthControlElement);
        this._dropDownPosition = AnchorPosition.BELOW;
        this.styleElement = createStyleSheet(this.selectDropDownContainer);
        this.selectDropDownContainer.setAttribute("draggable", "true");
        this._register(
            addDisposableListener(this.selectDropDownContainer, EventType.DRAG_START, e => {
                EventHelper.stop(e, true);
            })
        );
    }
    registerListeners() {
        this._register(addStandardDisposableListener(this.selectElement, "change", e => {
            this.selected = e.target.selectedIndex;
            this._onDidSelect.fire({
                index: e.target.selectedIndex,
                selected: e.target.value
            });
            if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                this.setTitle(this.options[this.selected].text);
            }
        }));
        this._register(addDisposableListener(this.selectElement, EventType.CLICK, e => {
            EventHelper.stop(e);
            if (this._isVisible) {
                this.hideSelectDropDown(true);
            } else {
                this.showSelectDropDown();
            }
        }));
        this._register(
            addDisposableListener(this.selectElement, EventType.MOUSE_DOWN, e => {
                EventHelper.stop(e);
            })
        );
        let listIsVisibleOnTouchStart;
        this._register(addDisposableListener(this.selectElement, "touchstart", e => {
            listIsVisibleOnTouchStart = this._isVisible;
        }));
        this._register(addDisposableListener(this.selectElement, "touchend", e => {
            EventHelper.stop(e);
            if (listIsVisibleOnTouchStart) {
                this.hideSelectDropDown(true);
            } else {
                this.showSelectDropDown();
            }
        }));
        this._register(
            addDisposableListener(this.selectElement, EventType.KEY_DOWN, e => {
                const event = ( new StandardKeyboardEvent(e));
                let showDropDown = false;
                if (isMacintosh) {
                    if (event.keyCode === KeyCode.DownArrow || event.keyCode === KeyCode.UpArrow || event.keyCode === KeyCode.Space || event.keyCode === KeyCode.Enter) {
                        showDropDown = true;
                    }
                } else {
                    if (event.keyCode === KeyCode.DownArrow && event.altKey || event.keyCode === KeyCode.UpArrow && event.altKey || event.keyCode === KeyCode.Space || event.keyCode === KeyCode.Enter) {
                        showDropDown = true;
                    }
                }
                if (showDropDown) {
                    this.showSelectDropDown();
                    EventHelper.stop(e, true);
                }
            })
        );
    }
    get onDidSelect() {
        return this._onDidSelect.event;
    }
    setOptions(options, selected) {
        if (!equals(this.options, options)) {
            this.options = options;
            this.selectElement.options.length = 0;
            this._hasDetails = false;
            this._cachedMaxDetailsHeight = undefined;
            this.options.forEach((option, index) => {
                this.selectElement.add(this.createOption(option.text, index, option.isDisabled));
                if (typeof option.description === "string") {
                    this._hasDetails = true;
                }
            });
        }
        if (selected !== undefined) {
            this.select(selected);
            this._currentSelection = this.selected;
        }
    }
    setEnabled(enable) {
        this.selectElement.disabled = !enable;
    }
    setOptionsList() {
        this.selectList?.splice(0, this.selectList.length, this.options);
    }
    select(index) {
        if (index >= 0 && index < this.options.length) {
            this.selected = index;
        } else if (index > this.options.length - 1) {
            this.select(this.options.length - 1);
        } else if (this.selected < 0) {
            this.selected = 0;
        }
        this.selectElement.selectedIndex = this.selected;
        if (!!this.options[this.selected] && !!this.options[this.selected].text) {
            this.setTitle(this.options[this.selected].text);
        }
    }
    setAriaLabel(label) {
        this.selectBoxOptions.ariaLabel = label;
        this.selectElement.setAttribute("aria-label", this.selectBoxOptions.ariaLabel);
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
    setFocusable(focusable) {
        this.selectElement.tabIndex = focusable ? 0 : -1;
    }
    render(container) {
        this.container = container;
        container.classList.add("select-container");
        container.appendChild(this.selectElement);
        this.styleSelectElement();
    }
    initStyleSheet() {
        const content = [];
        if (this.styles.listFocusBackground) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { background-color: ${this.styles.listFocusBackground} !important; }`
            );
        }
        if (this.styles.listFocusForeground) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { color: ${this.styles.listFocusForeground} !important; }`
            );
        }
        if (this.styles.decoratorRightForeground) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.focused) .option-decorator-right { color: ${this.styles.decoratorRightForeground}; }`
            );
        }
        if (this.styles.selectBackground && this.styles.selectBorder && this.styles.selectBorder !== this.styles.selectBackground) {
            content.push(
                `.monaco-select-box-dropdown-container { border: 1px solid ${this.styles.selectBorder} } `
            );
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectBorder} } `
            );
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectBorder} } `
            );
        } else if (this.styles.selectListBorder) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-details-pane.border-top { border-top: 1px solid ${this.styles.selectListBorder} } `
            );
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-details-pane.border-bottom { border-bottom: 1px solid ${this.styles.selectListBorder} } `
            );
        }
        if (this.styles.listHoverForeground) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { color: ${this.styles.listHoverForeground} !important; }`
            );
        }
        if (this.styles.listHoverBackground) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { background-color: ${this.styles.listHoverBackground} !important; }`
            );
        }
        if (this.styles.listFocusOutline) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.focused { outline: 1px solid ${this.styles.listFocusOutline} !important; outline-offset: -1px !important; }`
            );
        }
        if (this.styles.listHoverOutline) {
            content.push(
                `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row:not(.option-disabled):not(.focused):hover { outline: 1px solid ${this.styles.listHoverOutline} !important; outline-offset: -1px !important; }`
            );
        }
        content.push(
            `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled.focused { background-color: transparent !important; color: inherit !important; outline: none !important; }`
        );
        content.push(
            `.monaco-select-box-dropdown-container > .select-box-dropdown-list-container .monaco-list .monaco-list-row.option-disabled:hover { background-color: transparent !important; color: inherit !important; outline: none !important; }`
        );
        this.styleElement.textContent = content.join("\n");
    }
    styleSelectElement() {
        const background = this.styles.selectBackground ?? "";
        const foreground = this.styles.selectForeground ?? "";
        const border = this.styles.selectBorder ?? "";
        this.selectElement.style.backgroundColor = background;
        this.selectElement.style.color = foreground;
        this.selectElement.style.borderColor = border;
    }
    styleList() {
        const background = this.styles.selectBackground ?? "";
        const listBackground = asCssValueWithDefault(this.styles.selectListBackground, background);
        this.selectDropDownContainer.style.backgroundColor = listBackground;
        this.selectDropDownListContainer.style.backgroundColor = listBackground;
        this.selectionDetailsPane.style.backgroundColor = listBackground;
        this.selectList.style(this.styles);
    }
    createOption(value, index, disabled) {
        const option = createElement("option");
        option.value = value;
        option.text = value;
        option.disabled = !!disabled;
        return option;
    }
    showSelectDropDown() {
        this.selectionDetailsPane.textContent = "";
        if (!this.contextViewProvider || this._isVisible) {
            return;
        }
        this.createSelectList(this.selectDropDownContainer);
        this.setOptionsList();
        this.contextViewProvider.showContextView({
            getAnchor: () => this.selectElement,
            render: container => this.renderSelectDropDown(container, true),
            layout: () => {
                this.layoutSelectDropDown();
            },
            onHide: () => {
                this.selectDropDownContainer.classList.remove("visible");
            },
            anchorPosition: this._dropDownPosition
        }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
        this._isVisible = true;
        this.hideSelectDropDown(false);
        this.contextViewProvider.showContextView({
            getAnchor: () => this.selectElement,
            render: container => this.renderSelectDropDown(container),
            layout: () => this.layoutSelectDropDown(),
            onHide: () => {
                this.selectDropDownContainer.classList.remove("visible");
            },
            anchorPosition: this._dropDownPosition
        }, this.selectBoxOptions.optionsAsChildren ? this.container : undefined);
        this._currentSelection = this.selected;
        this._isVisible = true;
        this.selectElement.setAttribute("aria-expanded", "true");
    }
    hideSelectDropDown(focusSelect) {
        if (!this.contextViewProvider || !this._isVisible) {
            return;
        }
        this._isVisible = false;
        this.selectElement.setAttribute("aria-expanded", "false");
        if (focusSelect) {
            this.selectElement.focus();
        }
        this.contextViewProvider.hideContextView();
    }
    renderSelectDropDown(container, preLayoutPosition) {
        container.appendChild(this.selectDropDownContainer);
        const computedFontSize = getWindow(this.selectElement).getComputedStyle(this.selectElement).fontSize;
        if (computedFontSize) {
            this.selectDropDownContainer.style.fontSize = computedFontSize;
        }
        this.layoutSelectDropDown(preLayoutPosition);
        return {
            dispose: () => {
                this.selectDropDownContainer.remove();
            }
        };
    }
    measureMaxDetailsHeight() {
        let maxDetailsPaneHeight = 0;
        this.options.forEach((_option, index) => {
            this.updateDetail(index);
            if (this.selectionDetailsPane.offsetHeight > maxDetailsPaneHeight) {
                maxDetailsPaneHeight = this.selectionDetailsPane.offsetHeight;
            }
        });
        return maxDetailsPaneHeight;
    }
    layoutSelectDropDown(preLayoutPosition) {
        if (this._skipLayout) {
            return false;
        }
        if (this.selectList) {
            this.selectDropDownContainer.classList.add("visible");
            const window = getWindow(this.selectElement);
            const selectPosition = getDomNodePagePosition(this.selectElement);
            const maxSelectDropDownHeightBelow = (window.innerHeight - selectPosition.top - selectPosition.height - (this.selectBoxOptions.minBottomMargin || 0));
            const maxSelectDropDownHeightAbove = (selectPosition.top - SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN);
            const selectWidth = this.selectElement.offsetWidth;
            const selectMinWidth = this.setWidthControlElement(this.widthControlElement);
            const selectOptimalWidth = `${Math.max(selectMinWidth, Math.round(selectWidth))}px`;
            this.selectDropDownContainer.style.width = selectOptimalWidth;
            this.selectList.getHTMLElement().style.height = "";
            this.selectList.layout();
            let listHeight = this.selectList.contentHeight;
            if (this._hasDetails && this._cachedMaxDetailsHeight === undefined) {
                this._cachedMaxDetailsHeight = this.measureMaxDetailsHeight();
            }
            const maxDetailsPaneHeight = this._hasDetails ? this._cachedMaxDetailsHeight : 0;
            const minRequiredDropDownHeight = listHeight + maxDetailsPaneHeight;
            const maxVisibleOptionsBelow = (Math.floor((maxSelectDropDownHeightBelow - maxDetailsPaneHeight) / this.getHeight()));
            const maxVisibleOptionsAbove = (Math.floor((maxSelectDropDownHeightAbove - maxDetailsPaneHeight) / this.getHeight()));
            if (preLayoutPosition) {
                if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22) || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN || ((maxVisibleOptionsBelow < 1) && (maxVisibleOptionsAbove < 1))) {
                    return false;
                }
                if (maxVisibleOptionsBelow < SelectBoxList.DEFAULT_MINIMUM_VISIBLE_OPTIONS && maxVisibleOptionsAbove > maxVisibleOptionsBelow && this.options.length > maxVisibleOptionsBelow) {
                    this._dropDownPosition = AnchorPosition.ABOVE;
                    this.selectDropDownListContainer.remove();
                    this.selectionDetailsPane.remove();
                    this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                    this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                    this.selectionDetailsPane.classList.remove("border-top");
                    this.selectionDetailsPane.classList.add("border-bottom");
                } else {
                    this._dropDownPosition = AnchorPosition.BELOW;
                    this.selectDropDownListContainer.remove();
                    this.selectionDetailsPane.remove();
                    this.selectDropDownContainer.appendChild(this.selectDropDownListContainer);
                    this.selectDropDownContainer.appendChild(this.selectionDetailsPane);
                    this.selectionDetailsPane.classList.remove("border-bottom");
                    this.selectionDetailsPane.classList.add("border-top");
                }
                return true;
            }
            if ((selectPosition.top + selectPosition.height) > (window.innerHeight - 22) || selectPosition.top < SelectBoxList.DEFAULT_DROPDOWN_MINIMUM_TOP_MARGIN || (this._dropDownPosition === AnchorPosition.BELOW && maxVisibleOptionsBelow < 1) || (this._dropDownPosition === AnchorPosition.ABOVE && maxVisibleOptionsAbove < 1)) {
                this.hideSelectDropDown(true);
                return false;
            }
            if (this._dropDownPosition === AnchorPosition.BELOW) {
                if (this._isVisible && maxVisibleOptionsBelow + maxVisibleOptionsAbove < 1) {
                    this.hideSelectDropDown(true);
                    return false;
                }
                if (minRequiredDropDownHeight > maxSelectDropDownHeightBelow) {
                    listHeight = (maxVisibleOptionsBelow * this.getHeight());
                }
            } else {
                if (minRequiredDropDownHeight > maxSelectDropDownHeightAbove) {
                    listHeight = (maxVisibleOptionsAbove * this.getHeight());
                }
            }
            this.selectList.layout(listHeight);
            this.selectList.domFocus();
            if (this.selectList.length > 0) {
                this.selectList.setFocus([this.selected || 0]);
                this.selectList.reveal(this.selectList.getFocus()[0] || 0);
            }
            if (this._hasDetails) {
                this.selectList.getHTMLElement().style.height = `${listHeight}px`;
                this.selectDropDownContainer.style.height = "";
            } else {
                this.selectDropDownContainer.style.height = `${listHeight}px`;
            }
            this.updateDetail(this.selected);
            this.selectDropDownContainer.style.width = selectOptimalWidth;
            this.selectDropDownListContainer.setAttribute("tabindex", "0");
            return true;
        } else {
            return false;
        }
    }
    setWidthControlElement(container) {
        let elementWidth = 0;
        if (container) {
            let longest = 0;
            let longestLength = 0;
            this.options.forEach((option, index) => {
                const detailLength = !!option.detail ? option.detail.length : 0;
                const rightDecoratorLength = !!option.decoratorRight ? option.decoratorRight.length : 0;
                const len = option.text.length + detailLength + rightDecoratorLength;
                if (len > longestLength) {
                    longest = index;
                    longestLength = len;
                }
            });
            container.textContent = this.options[longest].text + (!!this.options[longest].decoratorRight ? `${this.options[longest].decoratorRight} ` : "");
            elementWidth = getTotalWidth(container);
        }
        return elementWidth;
    }
    createSelectList(parent) {
        if (this.selectList) {
            return;
        }
        this.selectDropDownListContainer = append(parent, $(".select-box-dropdown-list-container"));
        this.listRenderer = ( new SelectListRenderer());
        this.selectList = this._register(( new List(
            "SelectBoxCustom",
            this.selectDropDownListContainer,
            this,
            [this.listRenderer],
            {
                useShadows: false,
                verticalScrollMode: ScrollbarVisibility.Visible,
                keyboardSupport: false,
                mouseSupport: false,
                accessibilityProvider: {
                    getAriaLabel: element => {
                        if (element.isSeparator) {
                            return localize(30, "separator");
                        }
                        let label = element.text;
                        if (element.detail) {
                            label += `. ${element.detail}`;
                        }
                        if (element.decoratorRight) {
                            label += `. ${element.decoratorRight}`;
                        }
                        if (element.description) {
                            label += `. ${element.description}`;
                        }
                        return label;
                    },
                    getWidgetAriaLabel: () => ( localize(31, "Select Box")),
                    getRole: () => isMacintosh ? "" : "option",
                    getWidgetRole: () => "listbox"
                }
            }
        )));
        if (this.selectBoxOptions.ariaLabel) {
            this.selectList.ariaLabel = this.selectBoxOptions.ariaLabel;
        }
        const onKeyDown = this._register(( new DomEmitter(this.selectDropDownListContainer, "keydown")));
        const onSelectDropDownKeyDown = Event.chain(onKeyDown.event, $ => ( $.filter(() => this.selectList.length > 0).map(e => ( new StandardKeyboardEvent(e)))));
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.Enter))(this.onEnter, this)
        );
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.Tab))(this.onEnter, this)
        );
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.Escape))(this.onEscape, this)
        );
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.UpArrow))(this.onUpArrow, this)
        );
        this._register(Event.chain(
            onSelectDropDownKeyDown,
            $ => $.filter(e => e.keyCode === KeyCode.DownArrow)
        )(this.onDownArrow, this));
        this._register(Event.chain(
            onSelectDropDownKeyDown,
            $ => $.filter(e => e.keyCode === KeyCode.PageDown)
        )(this.onPageDown, this));
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.PageUp))(this.onPageUp, this)
        );
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.Home))(this.onHome, this)
        );
        this._register(
            Event.chain(onSelectDropDownKeyDown, $ => $.filter(e => e.keyCode === KeyCode.End))(this.onEnd, this)
        );
        this._register(Event.chain(onSelectDropDownKeyDown, $ => $.filter(
            e => (e.keyCode >= KeyCode.Digit0 && e.keyCode <= KeyCode.KeyZ) || (e.keyCode >= KeyCode.Semicolon && e.keyCode <= KeyCode.NumpadDivide)
        ))(this.onCharacter, this));
        this._register(addDisposableListener(
            this.selectList.getHTMLElement(),
            EventType.POINTER_UP,
            e => this.onPointerUp(e)
        ));
        this._register(this.selectList.onMouseOver(
            e => typeof e.index !== "undefined" && !this.options[e.index]?.isDisabled && this.selectList.setFocus([e.index])
        ));
        this._register(this.selectList.onDidChangeFocus(e => this.onListFocus(e)));
        this._register(
            addDisposableListener(this.selectDropDownContainer, EventType.FOCUS_OUT, e => {
                if (!this._isVisible || isAncestor(e.relatedTarget, this.selectDropDownContainer)) {
                    return;
                }
                this.onListBlur();
            })
        );
        this.selectList.getHTMLElement().setAttribute("aria-label", this.selectBoxOptions.ariaLabel || "");
        this.selectList.getHTMLElement().setAttribute("aria-expanded", "true");
        this.styleList();
    }
    onPointerUp(e) {
        if (!this.selectList.length) {
            return;
        }
        EventHelper.stop(e);
        const target = e.target;
        if (!target) {
            return;
        }
        if (target.classList.contains("slider")) {
            return;
        }
        const listRowElement = target.closest(".monaco-list-row");
        if (!listRowElement) {
            return;
        }
        const index = Number(listRowElement.getAttribute("data-index"));
        const disabled = listRowElement.classList.contains("option-disabled");
        if (index >= 0 && index < this.options.length && !disabled) {
            this.selected = index;
            this.select(this.selected);
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selectList.getFocus()[0]);
            if (this.selected !== this._currentSelection) {
                this._currentSelection = this.selected;
                this._onDidSelect.fire({
                    index: this.selectElement.selectedIndex,
                    selected: this.options[this.selected].text
                });
                if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                    this.setTitle(this.options[this.selected].text);
                }
            }
            this.hideSelectDropDown(true);
        }
    }
    onListBlur() {
        if (this._sticky) {
            return;
        }
        if (this.selected !== this._currentSelection) {
            this.select(this._currentSelection);
        }
        this.hideSelectDropDown(false);
    }
    renderDescriptionMarkdown(text, actionHandler) {
        const cleanRenderedMarkdown = element => {
            for (let i = 0; i < element.childNodes.length; i++) {
                const child = element.childNodes.item(i);
                const tagName = child.tagName && child.tagName.toLowerCase();
                if (tagName === "img") {
                    child.remove();
                } else {
                    cleanRenderedMarkdown(child);
                }
            }
        };
        const rendered = renderMarkdown({
            value: text,
            supportThemeIcons: true
        }, {
            actionHandler
        });
        rendered.element.classList.add("select-box-description-markdown");
        cleanRenderedMarkdown(rendered.element);
        return rendered;
    }
    onListFocus(e) {
        if (!this._isVisible || !this._hasDetails) {
            return;
        }
        this.updateDetail(e.indexes[0]);
    }
    updateDetail(selectedIndex) {
        this._selectionDetailsDisposables.clear();
        this.selectionDetailsPane.textContent = "";
        const option = this.options[selectedIndex];
        const description = option?.description ?? "";
        const descriptionIsMarkdown = option?.descriptionIsMarkdown ?? false;
        if (description) {
            if (descriptionIsMarkdown) {
                const actionHandler = option.descriptionMarkdownActionHandler;
                const result = this._selectionDetailsDisposables.add(this.renderDescriptionMarkdown(description, actionHandler));
                this.selectionDetailsPane.appendChild(result.element);
            } else {
                this.selectionDetailsPane.textContent = description;
            }
            this.selectionDetailsPane.style.display = "block";
        } else {
            this.selectionDetailsPane.style.display = "none";
        }
        this._skipLayout = true;
        this.contextViewProvider.layout();
        this._skipLayout = false;
    }
    onEscape(e) {
        EventHelper.stop(e);
        this.select(this._currentSelection);
        this.hideSelectDropDown(true);
    }
    onEnter(e) {
        EventHelper.stop(e);
        if (this.options[this.selected]?.isDisabled) {
            this.hideSelectDropDown(true);
            return;
        }
        if (this.selected !== this._currentSelection) {
            this._currentSelection = this.selected;
            this._onDidSelect.fire({
                index: this.selectElement.selectedIndex,
                selected: this.options[this.selected].text
            });
            if (!!this.options[this.selected] && !!this.options[this.selected].text) {
                this.setTitle(this.options[this.selected].text);
            }
        }
        this.hideSelectDropDown(true);
    }
    onDownArrow(e) {
        if (this.selected < this.options.length - 1) {
            EventHelper.stop(e, true);
            let next = this.selected + 1;
            while (next < this.options.length && this.options[next].isDisabled) {
                next++;
            }
            if (next >= this.options.length) {
                return;
            }
            this.selected = next;
            this.select(this.selected);
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selectList.getFocus()[0]);
        }
    }
    onUpArrow(e) {
        if (this.selected > 0) {
            EventHelper.stop(e, true);
            let prev = this.selected - 1;
            while (prev >= 0 && this.options[prev].isDisabled) {
                prev--;
            }
            if (prev < 0) {
                return;
            }
            this.selected = prev;
            this.select(this.selected);
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selectList.getFocus()[0]);
        }
    }
    onPageUp(e) {
        EventHelper.stop(e);
        this.selectList.focusPreviousPage();
        setTimeout(() => {
            let candidate = this.selectList.getFocus()[0];
            while (candidate > 0 && this.options[candidate].isDisabled) {
                candidate--;
            }
            if (this.options[candidate].isDisabled) {
                return;
            }
            this.selected = candidate;
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }, 1);
    }
    onPageDown(e) {
        EventHelper.stop(e);
        this.selectList.focusNextPage();
        setTimeout(() => {
            let candidate = this.selectList.getFocus()[0];
            while (candidate < this.options.length - 1 && this.options[candidate].isDisabled) {
                candidate++;
            }
            if (this.options[candidate].isDisabled) {
                return;
            }
            this.selected = candidate;
            this.selectList.setFocus([this.selected]);
            this.selectList.reveal(this.selected);
            this.select(this.selected);
        }, 1);
    }
    onHome(e) {
        EventHelper.stop(e);
        if (this.options.length < 2) {
            return;
        }
        let candidate = 0;
        while (candidate < this.options.length - 1 && this.options[candidate].isDisabled) {
            candidate++;
        }
        if (this.options[candidate].isDisabled) {
            return;
        }
        this.selected = candidate;
        this.selectList.setFocus([this.selected]);
        this.selectList.reveal(this.selected);
        this.select(this.selected);
    }
    onEnd(e) {
        EventHelper.stop(e);
        if (this.options.length < 2) {
            return;
        }
        let candidate = this.options.length - 1;
        while (candidate > 0 && this.options[candidate].isDisabled) {
            candidate--;
        }
        if (this.options[candidate].isDisabled) {
            return;
        }
        this.selected = candidate;
        this.selectList.setFocus([this.selected]);
        this.selectList.reveal(this.selected);
        this.select(this.selected);
    }
    onCharacter(e) {
        const ch = ( KeyCodeUtils.toString(e.keyCode));
        let optionIndex = -1;
        for (let i = 0; i < this.options.length - 1; i++) {
            optionIndex = (i + this.selected + 1) % this.options.length;
            if (this.options[optionIndex].text.charAt(0).toUpperCase() === ch && !this.options[optionIndex].isDisabled) {
                this.select(optionIndex);
                this.selectList.setFocus([optionIndex]);
                this.selectList.reveal(this.selectList.getFocus()[0]);
                EventHelper.stop(e);
                break;
            }
        }
    }
    dispose() {
        this.hideSelectDropDown(false);
        super.dispose();
    }
}

export { SelectBoxList };
