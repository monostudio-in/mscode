
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { $, append, addDisposableListener, EventType } from '../../../base/browser/dom.js';
import { StandardKeyboardEvent } from '../../../base/browser/keyboardEvent.js';
import { BaseActionViewItem } from '../../../base/browser/ui/actionbar/actionViewItems.js';
import { DropdownMenuActionViewItem } from '../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { KeyCode } from '../../../base/common/keyCodes.js';
import { MenuEntryActionViewItem } from './menuEntryActionViewItem.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.service.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.service.js';
import { INotificationService } from '../../notification/common/notification.service.js';
import { IThemeService } from '../../theme/common/themeService.service.js';
import { IContextMenuService } from '../../contextview/browser/contextView.service.js';
import { IAccessibilityService } from '../../accessibility/common/accessibility.service.js';

let DropdownWithPrimaryActionViewItem = class DropdownWithPrimaryActionViewItem extends BaseActionViewItem {
    get onDidChangeDropdownVisibility() {
        return this._dropdown.onDidChangeVisibility;
    }
    constructor(
        primaryAction,
        dropdownAction,
        dropdownMenuActions,
        className,
        _options,
        _contextMenuProvider,
        _keybindingService,
        _notificationService,
        _contextKeyService,
        _themeService,
        _accessibilityService
    ) {
        super(null, primaryAction, {
            hoverDelegate: _options?.hoverDelegate
        });
        this._options = _options;
        this._contextMenuProvider = _contextMenuProvider;
        this._container = null;
        this._dropdownContainer = null;
        this._primaryAction = ( new MenuEntryActionViewItem(primaryAction, {
            hoverDelegate: _options?.hoverDelegate
        }, _keybindingService, _notificationService, _contextKeyService, _themeService, _contextMenuProvider, _accessibilityService));
        if (_options?.actionRunner) {
            this._primaryAction.actionRunner = _options.actionRunner;
        }
        this._dropdown = ( new DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
            menuAsChild: _options?.menuAsChild ?? true,
            classNames: className ? ["codicon", "codicon-chevron-down", className] : ["codicon", "codicon-chevron-down"],
            actionRunner: this._options?.actionRunner,
            keybindingProvider: this._options?.getKeyBinding ?? (action => _keybindingService.lookupKeybinding(action.id)),
            hoverDelegate: _options?.hoverDelegate,
            skipTelemetry: _options?.skipTelemetry
        }));
    }
    set actionRunner(actionRunner) {
        super.actionRunner = actionRunner;
        this._primaryAction.actionRunner = actionRunner;
        this._dropdown.actionRunner = actionRunner;
    }
    get actionRunner() {
        return super.actionRunner;
    }
    setActionContext(newContext) {
        super.setActionContext(newContext);
        this._primaryAction.setActionContext(newContext);
        this._dropdown.setActionContext(newContext);
    }
    render(container) {
        this._container = container;
        super.render(this._container);
        this._container.classList.add("monaco-dropdown-with-primary");
        const primaryContainer = $(".action-container");
        primaryContainer.role = "button";
        primaryContainer.ariaDisabled = String(!this.action.enabled);
        this._primaryAction.render(append(this._container, primaryContainer));
        this._dropdownContainer = $(".dropdown-action-container");
        this._dropdown.render(append(this._container, this._dropdownContainer));
        this._register(addDisposableListener(primaryContainer, EventType.KEY_DOWN, e => {
            if (!this.action.enabled) {
                return;
            }
            const event = ( new StandardKeyboardEvent(e));
            if (event.equals(KeyCode.RightArrow)) {
                this._primaryAction.element.tabIndex = -1;
                this._dropdown.focus();
                event.stopPropagation();
            }
        }));
        this._register(
            addDisposableListener(this._dropdownContainer, EventType.KEY_DOWN, e => {
                if (!this.action.enabled) {
                    return;
                }
                const event = ( new StandardKeyboardEvent(e));
                if (event.equals(KeyCode.LeftArrow)) {
                    this._primaryAction.element.tabIndex = 0;
                    this._dropdown.setFocusable(false);
                    this._primaryAction.element?.focus();
                    event.stopPropagation();
                }
            })
        );
        this.updateEnabled();
    }
    focus(fromRight) {
        if (fromRight) {
            this._dropdown.focus();
        } else {
            this._primaryAction.element.tabIndex = 0;
            this._primaryAction.element.focus();
        }
    }
    blur() {
        this._primaryAction.element.tabIndex = -1;
        this._dropdown.blur();
        this._container.blur();
    }
    setFocusable(focusable) {
        if (focusable) {
            this._primaryAction.element.tabIndex = 0;
        } else {
            this._primaryAction.element.tabIndex = -1;
            this._dropdown.setFocusable(false);
        }
    }
    updateEnabled() {
        const disabled = !this.action.enabled;
        this.element?.classList.toggle("disabled", disabled);
    }
    update(dropdownAction, dropdownMenuActions, dropdownIcon) {
        this._dropdown.dispose();
        this._dropdown = ( new DropdownMenuActionViewItem(dropdownAction, dropdownMenuActions, this._contextMenuProvider, {
            menuAsChild: this._options?.menuAsChild ?? true,
            classNames: ["codicon", dropdownIcon || "codicon-chevron-down"],
            actionRunner: this._options?.actionRunner,
            hoverDelegate: this._options?.hoverDelegate,
            keybindingProvider: this._options?.getKeyBinding
        }));
        if (this._dropdownContainer) {
            this._dropdown.render(this._dropdownContainer);
        }
    }
    showDropdown() {
        this._dropdown.show();
    }
    dispose() {
        this._primaryAction.dispose();
        this._dropdown.dispose();
        super.dispose();
    }
};
DropdownWithPrimaryActionViewItem = ( __decorate([( __param(5, IContextMenuService)), ( __param(6, IKeybindingService)), ( __param(7, INotificationService)), ( __param(8, IContextKeyService)), ( __param(9, IThemeService)), ( __param(10, IAccessibilityService))], DropdownWithPrimaryActionViewItem));

export { DropdownWithPrimaryActionViewItem };
