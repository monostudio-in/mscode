
import { registerCss } from '../../../../../../../css.js';
import { localize } from '../../../../nls.js';
import { Action } from '../../../common/actions.js';
import { Codicon } from '../../../common/codicons.js';
import { Emitter } from '../../../common/event.js';
import { KeyCode } from '../../../common/keyCodes.js';
import { ThemeIcon } from '../../../common/themables.js';
import { append, $, h, addDisposableListener, EventType } from '../../dom.js';
import { StandardKeyboardEvent } from '../../keyboardEvent.js';
import { BaseActionViewItem, ActionViewItem } from '../actionbar/actionViewItems.js';
import { getBaseLayerHoverDelegate } from '../hover/hoverDelegate2.js';
import { getDefaultHoverDelegate } from '../hover/hoverDelegateFactory.js';
import * as dropdown from './dropdown.css';
import { DropdownMenu } from './dropdown.js';

registerCss(dropdown);
class DropdownMenuActionViewItem extends BaseActionViewItem {
    get onDidChangeVisibility() {
        return this._onDidChangeVisibility.event;
    }
    constructor(
        action,
        menuActionsOrProvider,
        contextMenuProvider,
        options = Object.create(null)
    ) {
        super(null, action, options);
        this.actionItem = null;
        this._onDidChangeVisibility = this._register(( new Emitter()));
        this.menuActionsOrProvider = menuActionsOrProvider;
        this.contextMenuProvider = contextMenuProvider;
        this.options = options;
        if (this.options.actionRunner) {
            this.actionRunner = this.options.actionRunner;
        }
    }
    render(container) {
        this.actionItem = container;
        const labelRenderer = el => {
            this.element = append(el, $("a.action-label"));
            this.setAriaLabelAttributes(this.element);
            return this.renderLabel(this.element);
        };
        const isActionsArray = Array.isArray(this.menuActionsOrProvider);
        const options = {
            contextMenuProvider: this.contextMenuProvider,
            labelRenderer: labelRenderer,
            menuAsChild: this.options.menuAsChild,
            actions: isActionsArray ? this.menuActionsOrProvider : undefined,
            actionProvider: isActionsArray ? undefined : this.menuActionsOrProvider,
            skipTelemetry: this.options.skipTelemetry
        };
        this.dropdownMenu = this._register(( new DropdownMenu(container, options)));
        this._register(this.dropdownMenu.onDidChangeVisibility(visible => {
            this.element?.setAttribute("aria-expanded", `${visible}`);
            this._onDidChangeVisibility.fire(visible);
        }));
        this.dropdownMenu.menuOptions = {
            actionViewItemProvider: this.options.actionViewItemProvider,
            actionRunner: this.actionRunner,
            getKeyBinding: this.options.keybindingProvider,
            context: this._context
        };
        if (this.options.anchorAlignmentProvider) {
            const that = this;
            this.dropdownMenu.menuOptions = {
                ...this.dropdownMenu.menuOptions,
                get anchorAlignment() {
                    return that.options.anchorAlignmentProvider();
                }
            };
        }
        this.updateTooltip();
        this.updateEnabled();
    }
    renderLabel(element) {
        let classNames = [];
        if (typeof this.options.classNames === "string") {
            classNames = this.options.classNames.split(/\s+/g).filter(s => !!s);
        } else if (this.options.classNames) {
            classNames = this.options.classNames;
        }
        if (!classNames.find(c => c === "icon")) {
            classNames.push("codicon");
        }
        element.classList.add(...classNames);
        if (this._action.label) {
            this._register(getBaseLayerHoverDelegate().setupManagedHover(
                this.options.hoverDelegate ?? getDefaultHoverDelegate("mouse"),
                element,
                this._action.label
            ));
        }
        return null;
    }
    setAriaLabelAttributes(element) {
        element.setAttribute("role", "button");
        element.setAttribute("aria-haspopup", "true");
        element.setAttribute("aria-expanded", "false");
        element.ariaLabel = this._action.label || "";
    }
    getTooltip() {
        let title = null;
        if (this.action.tooltip) {
            title = this.action.tooltip;
        } else if (this.action.label) {
            title = this.action.label;
        }
        return title ?? undefined;
    }
    setActionContext(newContext) {
        super.setActionContext(newContext);
        if (this.dropdownMenu) {
            if (this.dropdownMenu.menuOptions) {
                this.dropdownMenu.menuOptions.context = newContext;
            } else {
                this.dropdownMenu.menuOptions = {
                    context: newContext
                };
            }
        }
    }
    show() {
        this.dropdownMenu?.show();
    }
    updateEnabled() {
        const disabled = !this.action.enabled;
        this.actionItem?.classList.toggle("disabled", disabled);
        this.element?.classList.toggle("disabled", disabled);
    }
}
class ActionWithDropdownActionViewItem extends ActionViewItem {
    constructor(context, action, options, contextMenuProvider) {
        super(context, action, options);
        this.contextMenuProvider = contextMenuProvider;
    }
    render(container) {
        super.render(container);
        if (this.element) {
            this.element.classList.add("action-dropdown-item");
            const menuActionsProvider = {
                getActions: () => {
                    const actionsProvider = this.options.menuActionsOrProvider;
                    return Array.isArray(actionsProvider) ? actionsProvider : actionsProvider.getActions();
                }
            };
            const menuActionClassNames = this.options.menuActionClassNames || [];
            const separator = h("div.action-dropdown-item-separator", [h("div", {})]).root;
            separator.classList.toggle("prominent", menuActionClassNames.includes("prominent"));
            append(this.element, separator);
            this.dropdownMenuActionViewItem = this._register(( new DropdownMenuActionViewItem(this._register(( new Action("dropdownAction", ( localize(9, "More Actions..."))))), menuActionsProvider, this.contextMenuProvider, {
                classNames: [
                    "dropdown",
                    ...ThemeIcon.asClassNameArray(Codicon.dropDownButton),
                    ...menuActionClassNames
                ],
                hoverDelegate: this.options.hoverDelegate
            })));
            this.dropdownMenuActionViewItem.render(this.element);
            this._register(addDisposableListener(this.element, EventType.KEY_DOWN, e => {
                if (menuActionsProvider.getActions().length === 0) {
                    return;
                }
                const event = ( new StandardKeyboardEvent(e));
                let handled = false;
                if (this.dropdownMenuActionViewItem?.isFocused() && event.equals(KeyCode.LeftArrow)) {
                    handled = true;
                    this.dropdownMenuActionViewItem?.blur();
                    this.focus();
                } else if (this.isFocused() && event.equals(KeyCode.RightArrow)) {
                    handled = true;
                    this.blur();
                    this.dropdownMenuActionViewItem?.focus();
                }
                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }));
        }
    }
    blur() {
        super.blur();
        this.dropdownMenuActionViewItem?.blur();
    }
    setFocusable(focusable) {
        super.setFocusable(focusable);
        this.dropdownMenuActionViewItem?.setFocusable(focusable);
    }
}

export { ActionWithDropdownActionViewItem, DropdownMenuActionViewItem };
