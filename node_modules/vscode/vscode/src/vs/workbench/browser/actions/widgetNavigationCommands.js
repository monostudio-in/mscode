
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { KeyMod as KeyMod$1, KeyCode } from '../../../base/common/keyCodes.js';
import { RawContextKey, ContextKeyExpr } from '../../../platform/contextkey/common/contextkey.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.service.js';
import { KeybindingsRegistry, KeybindingWeight } from '../../../platform/keybinding/common/keybindingsRegistry.js';
import { WorkbenchListFocusContextKey, WorkbenchListScrollAtTopContextKey, WorkbenchListScrollAtBottomContextKey } from '../../../platform/list/browser/listService.js';
import { combinedDisposable, Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import { registerWorkbenchContribution2, WorkbenchPhase } from '../../common/contributions.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.service.js';

var NavigableContainerManager_1;
function handleFocusEventsGroup(group, handler, onPartFocusChange) {
    const focusedIndices = ( new Set());
    return combinedDisposable(...( group.map((events, index) => combinedDisposable(events.onDidFocus(() => {
        onPartFocusChange?.(index, "focus");
        if (!focusedIndices.size) {
            handler(true);
        }
        focusedIndices.add(index);
    }), events.onDidBlur(() => {
        onPartFocusChange?.(index, "blur");
        focusedIndices.delete(index);
        if (!focusedIndices.size) {
            handler(false);
        }
    })))));
}
const NavigableContainerFocusedContextKey = ( new RawContextKey("navigableContainerFocused", false));
let NavigableContainerManager = class NavigableContainerManager {
    static {
        NavigableContainerManager_1 = this;
    }
    static {
        this.ID = "workbench.contrib.navigableContainerManager";
    }
    constructor(contextKeyService, logService, configurationService) {
        this.logService = logService;
        this.configurationService = configurationService;
        this.containers = ( new Set());
        this.focused = NavigableContainerFocusedContextKey.bindTo(contextKeyService);
        NavigableContainerManager_1.INSTANCE = this;
    }
    dispose() {
        this.containers.clear();
        this.focused.reset();
        NavigableContainerManager_1.INSTANCE = undefined;
    }
    get debugEnabled() {
        return this.configurationService.getValue("workbench.navigibleContainer.enableDebug");
    }
    log(msg, ...args) {
        if (this.debugEnabled) {
            this.logService.debug(msg, ...args);
        }
    }
    static register(container) {
        const instance = this.INSTANCE;
        if (!instance) {
            return Disposable.None;
        }
        instance.containers.add(container);
        instance.log("NavigableContainerManager.register", container.name);
        return combinedDisposable(handleFocusEventsGroup(container.focusNotifiers, isFocus => {
            if (isFocus) {
                instance.log("NavigableContainerManager.focus", container.name);
                instance.focused.set(true);
                instance.lastContainer = container;
            } else {
                instance.log(
                    "NavigableContainerManager.blur",
                    container.name,
                    instance.lastContainer?.name
                );
                if (instance.lastContainer === container) {
                    instance.focused.set(false);
                    instance.lastContainer = undefined;
                }
            }
        }, (index, event) => {
            instance.log("NavigableContainerManager.partFocusChange", container.name, index, event);
        }), toDisposable(() => {
            instance.containers.delete(container);
            instance.log(
                "NavigableContainerManager.unregister",
                container.name,
                instance.lastContainer?.name
            );
            if (instance.lastContainer === container) {
                instance.focused.set(false);
                instance.lastContainer = undefined;
            }
        }));
    }
    static getActive() {
        return this.INSTANCE?.lastContainer;
    }
};
NavigableContainerManager = NavigableContainerManager_1 = ( __decorate([( __param(0, IContextKeyService)), ( __param(1, ILogService)), ( __param(2, IConfigurationService))], NavigableContainerManager));
function registerNavigableContainer(container) {
    return NavigableContainerManager.register(container);
}
registerWorkbenchContribution2(
    NavigableContainerManager.ID,
    NavigableContainerManager,
    WorkbenchPhase.BlockStartup
);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "widgetNavigation.focusPrevious",
    weight: KeybindingWeight.WorkbenchContrib,
    when: ( ContextKeyExpr.and(NavigableContainerFocusedContextKey, ( ContextKeyExpr.or(WorkbenchListFocusContextKey?.negate(), WorkbenchListScrollAtTopContextKey)))),
    primary: KeyMod$1.CtrlCmd | KeyCode.UpArrow,
    handler: () => {
        const activeContainer = NavigableContainerManager.getActive();
        activeContainer?.focusPreviousWidget();
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "widgetNavigation.focusNext",
    weight: KeybindingWeight.WorkbenchContrib,
    when: ( ContextKeyExpr.and(NavigableContainerFocusedContextKey, ( ContextKeyExpr.or(
        WorkbenchListFocusContextKey?.negate(),
        WorkbenchListScrollAtBottomContextKey
    )))),
    primary: KeyMod$1.CtrlCmd | KeyCode.DownArrow,
    handler: () => {
        const activeContainer = NavigableContainerManager.getActive();
        activeContainer?.focusNextWidget();
    }
});

export { registerNavigableContainer };
