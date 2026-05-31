
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { append, $ } from '../../../../base/browser/dom.js';
import { ActionBar } from '../../../../base/browser/ui/actionbar/actionbar.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { MenuEntryActionViewItem, TextOnlyMenuEntryActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IMenuService } from '../../../../platform/actions/common/actions.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';

let SuggestWidgetStatus = class SuggestWidgetStatus {
    constructor(
        container,
        _menuId,
        options,
        instantiationService,
        _menuService,
        _contextKeyService
    ) {
        this._menuId = _menuId;
        this._menuService = _menuService;
        this._contextKeyService = _contextKeyService;
        this._menuDisposables = ( new DisposableStore());
        this.element = append(container, $(".suggest-status-bar"));
        const actionViewItemProvider = (action => {
            if (options?.showIconsNoKeybindings) {
                return action instanceof MenuItemAction ? instantiationService.createInstance(MenuEntryActionViewItem, action, undefined) : undefined;
            } else {
                return action instanceof MenuItemAction ? instantiationService.createInstance(TextOnlyMenuEntryActionViewItem, action, {
                    useComma: false
                }) : undefined;
            }
        });
        this._leftActions = ( new ActionBar(this.element, {
            actionViewItemProvider
        }));
        this._rightActions = ( new ActionBar(this.element, {
            actionViewItemProvider
        }));
        this._leftActions.domNode.classList.add("left");
        this._rightActions.domNode.classList.add("right");
    }
    dispose() {
        this._menuDisposables.dispose();
        this._leftActions.dispose();
        this._rightActions.dispose();
        this.element.remove();
    }
    show() {
        const menu = this._menuService.createMenu(this._menuId, this._contextKeyService);
        const renderMenu = () => {
            const left = [];
            const right = [];
            for (const [group, actions] of menu.getActions()) {
                if (group === "left") {
                    left.push(...actions);
                } else {
                    right.push(...actions);
                }
            }
            this._leftActions.clear();
            this._leftActions.push(left);
            this._rightActions.clear();
            this._rightActions.push(right);
        };
        this._menuDisposables.add(menu.onDidChange(() => renderMenu()));
        this._menuDisposables.add(menu);
    }
    hide() {
        this._menuDisposables.clear();
    }
};
SuggestWidgetStatus = ( __decorate([( __param(3, IInstantiationService)), ( __param(4, IMenuService)), ( __param(5, IContextKeyService))], SuggestWidgetStatus));

export { SuggestWidgetStatus };
