
import { __decorate, __param } from '../../../../../../../../../external/tslib/tslib.es6.js';
import { reset, createElement, EventType, addDisposableListener, EventHelper } from '../../../../../../base/browser/dom.js';
import { isUndefinedOrNull } from '../../../../../../base/common/types.js';
import { EventType as EventType$1 } from '../../../../../../base/browser/touch.js';
import { getDefaultHoverDelegate } from '../../../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from '../../../../../../base/browser/ui/iconLabel/iconLabels.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { MenuEntryActionViewItem, SubmenuEntryActionViewItem } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.service.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.service.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.service.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.service.js';

class CodiconActionViewItem extends MenuEntryActionViewItem {
    updateLabel() {
        if (this.options.label && this.label) {
            reset(this.label, ...renderLabelWithIcons(this._commandAction.label ?? ""));
        }
    }
}
class ActionViewWithLabel extends MenuEntryActionViewItem {
    render(container) {
        super.render(container);
        container.classList.add("notebook-action-view-item");
        this._actionLabel = createElement("a");
        container.appendChild(this._actionLabel);
        this.updateLabel();
    }
    updateLabel() {
        if (this._actionLabel) {
            this._actionLabel.classList.add("notebook-label");
            this._actionLabel.innerText = this._action.label;
        }
    }
}
let UnifiedSubmenuActionView = class UnifiedSubmenuActionView extends SubmenuEntryActionViewItem {
    constructor(
        action,
        options,
        _renderLabel,
        subActionProvider,
        subActionViewItemProvider,
        _keybindingService,
        _contextMenuService,
        _themeService,
        _hoverService
    ) {
        super(action, {
            ...options,
            hoverDelegate: options?.hoverDelegate ?? getDefaultHoverDelegate("element")
        }, _keybindingService, _contextMenuService, _themeService);
        this._renderLabel = _renderLabel;
        this.subActionProvider = subActionProvider;
        this.subActionViewItemProvider = subActionViewItemProvider;
        this._hoverService = _hoverService;
    }
    render(container) {
        super.render(container);
        container.classList.add("notebook-action-view-item");
        container.classList.add("notebook-action-view-item-unified");
        this._actionLabel = createElement("a");
        container.appendChild(this._actionLabel);
        this._hover = this._register(this._hoverService.setupManagedHover(
            this.options.hoverDelegate ?? getDefaultHoverDelegate("element"),
            this._actionLabel,
            ""
        ));
        this.updateLabel();
        for (const event of [EventType.CLICK, EventType.MOUSE_DOWN, EventType$1.Tap]) {
            this._register(addDisposableListener(container, event, e => this.onClick(e, true)));
        }
    }
    onClick(event, preserveFocus = false) {
        EventHelper.stop(event, true);
        const context = isUndefinedOrNull(this._context) ? this.options?.useEventAsContext ? event : {
            preserveFocus
        } : this._context;
        this.actionRunner.run(this._primaryAction ?? this._action, context);
    }
    updateLabel() {
        const actions = this.subActionProvider.getActions();
        if (this._actionLabel) {
            const primaryAction = actions[0];
            this._primaryAction = primaryAction;
            if (primaryAction && primaryAction instanceof MenuItemAction) {
                const element = this.element;
                if (element && primaryAction.item.icon && ThemeIcon.isThemeIcon(primaryAction.item.icon)) {
                    const iconClasses = ThemeIcon.asClassNameArray(primaryAction.item.icon);
                    element.classList.forEach(cl => {
                        if (cl.startsWith("codicon-")) {
                            element.classList.remove(cl);
                        }
                    });
                    element.classList.add(...iconClasses);
                }
                if (this._renderLabel) {
                    this._actionLabel.classList.add("notebook-label");
                    this._actionLabel.innerText = this._action.label;
                    this._hover?.update(primaryAction.tooltip.length ? primaryAction.tooltip : primaryAction.label);
                }
            } else {
                if (this._renderLabel) {
                    this._actionLabel.classList.add("notebook-label");
                    this._actionLabel.innerText = this._action.label;
                    this._hover?.update(this._action.tooltip.length ? this._action.tooltip : this._action.label);
                }
            }
        }
    }
};
UnifiedSubmenuActionView = ( __decorate([( __param(5, IKeybindingService)), ( __param(6, IContextMenuService)), ( __param(7, IThemeService)), ( __param(8, IHoverService))], UnifiedSubmenuActionView));

export { ActionViewWithLabel, CodiconActionViewItem, UnifiedSubmenuActionView };
