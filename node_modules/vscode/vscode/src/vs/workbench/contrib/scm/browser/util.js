
import { MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { Action } from '../../../../base/common/actions.js';
import { getActionBarActions, getContextMenuActions, createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { equals } from '../../../../base/common/arrays.js';
import { ActionViewItem } from '../../../../base/browser/ui/actionbar/actionViewItems.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { createElement, reset } from '../../../../base/browser/dom.js';
import { ResourceTree } from '../../../../base/common/resourceTree.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { Codicon } from '../../../../base/common/codicons.js';

function isSCMViewService(element) {
    return Array.isArray(element.repositories) && Array.isArray(element.visibleRepositories);
}
function isSCMRepository(element) {
    return !!element.provider && !!element.input;
}
function isSCMInput(element) {
    return !!element.validateInput && typeof element.value === "string";
}
function isSCMActionButton(element) {
    return element.type === "actionButton";
}
function isSCMResourceGroup(element) {
    return !!element.provider && !!element.resources;
}
function isSCMResource(element) {
    return !!element.sourceUri && isSCMResourceGroup(element.resourceGroup);
}
function isSCMResourceNode(element) {
    return ResourceTree.isResourceNode(element) && isSCMResourceGroup(element.context);
}
function isSCMHistoryItemViewModelTreeElement(element) {
    return element.type === "historyItemViewModel";
}
function isSCMHistoryItemLoadMoreTreeElement(element) {
    return element.type === "historyItemLoadMore";
}
function isSCMHistoryItemChangeViewModelTreeElement(element) {
    return element.type === "historyItemChangeViewModel";
}
function isSCMHistoryItemChangeNode(element) {
    return ResourceTree.isResourceNode(element) && isSCMHistoryItemViewModelTreeElement(element.context);
}
function isSCMArtifactGroupTreeElement(element) {
    return element.type === "artifactGroup";
}
function isSCMArtifactNode(element) {
    return ResourceTree.isResourceNode(element) && isSCMArtifactGroupTreeElement(element.context);
}
function isSCMArtifactTreeElement(element) {
    return element.type === "artifact";
}
const compareActions = (a, b) => {
    if (a instanceof MenuItemAction && b instanceof MenuItemAction) {
        return a.id === b.id && a.enabled === b.enabled && a.hideActions?.isHidden === b.hideActions?.isHidden;
    }
    return a.id === b.id && a.enabled === b.enabled;
};
function connectPrimaryMenu(menu, callback, primaryGroup, arg) {
    let cachedPrimary = [];
    let cachedSecondary = [];
    const updateActions = () => {
        const {
            primary,
            secondary
        } = getActionBarActions(menu.getActions({
            arg,
            shouldForwardArgs: true
        }), primaryGroup);
        if (equals(cachedPrimary, primary, compareActions) && equals(cachedSecondary, secondary, compareActions)) {
            return;
        }
        cachedPrimary = primary;
        cachedSecondary = secondary;
        callback(primary, secondary);
    };
    updateActions();
    return menu.onDidChange(updateActions);
}
function collectContextMenuActions(menu, arg) {
    return getContextMenuActions(menu.getActions({
        arg,
        shouldForwardArgs: true
    }), "inline").secondary;
}
class StatusBarAction extends Action {
    constructor(command, commandService) {
        super(
            `statusbaraction{${command.id}}`,
            getStatusBarCommandGenericName(command),
            "",
            true
        );
        this.command = command;
        this.commandService = commandService;
        this.commandTitle = command.title;
        this.tooltip = command.tooltip || "";
    }
    run() {
        return this.commandService.executeCommand(this.command.id, ...(this.command.arguments || []));
    }
}
class StatusBarActionViewItem extends ActionViewItem {
    constructor(action, options) {
        super(null, action, {
            ...options,
            icon: false,
            label: true
        });
        this._commandTitle = action.commandTitle;
    }
    render(container) {
        container.classList.add("scm-status-bar-action");
        super.render(container);
    }
    updateLabel() {
        if (this.options.label && this.label) {
            const elements = ( renderLabelWithIcons(this._commandTitle ?? this.action.label).map(element => {
                if (typeof element === "string") {
                    const span = createElement("span");
                    span.textContent = element;
                    return span;
                }
                return element;
            }));
            reset(this.label, ...elements);
        }
    }
}
function getActionViewItemProvider(instaService) {
    return (action, options) => {
        if (action instanceof StatusBarAction) {
            return ( new StatusBarActionViewItem(action, options));
        }
        return createActionViewItem(instaService, action, options);
    };
}
function getProviderKey(provider) {
    return `${provider.providerId}:${provider.label}${provider.rootUri ? `:${( provider.rootUri.toString())}` : ""}`;
}
function getRepositoryResourceCount(provider) {
    return provider.groups.reduce((r, g) => r + g.resources.length, 0);
}
function getHistoryItemEditorTitle(historyItem) {
    return `${historyItem.displayId ?? historyItem.id} - ${historyItem.subject}`;
}
function getSCMRepositoryIcon(activeRepository, repository) {
    if (!ThemeIcon.isThemeIcon(repository.provider.iconPath)) {
        return Codicon.repo;
    }
    if (activeRepository?.pinned === true && activeRepository?.repository.id === repository.id && repository.provider.iconPath.id === Codicon.repo.id) {
        return Codicon.repoPinned;
    }
    return repository.provider.iconPath;
}
function getStatusBarCommandGenericName(command) {
    let genericName = undefined;
    if (typeof command.arguments?.[0] === "string") {
        const lastIndex = command.arguments[0].lastIndexOf("/");
        genericName = lastIndex !== -1 ? command.arguments[0].substring(0, lastIndex) : command.arguments[0];
        genericName = genericName.replace(/^(?:git\.|remoteHub\.)/, "").trim();
        if (genericName.length === 0) {
            return undefined;
        }
        genericName = genericName[0].toLocaleUpperCase() + genericName.slice(1);
    }
    return genericName;
}

export { StatusBarAction, collectContextMenuActions, connectPrimaryMenu, getActionViewItemProvider, getHistoryItemEditorTitle, getProviderKey, getRepositoryResourceCount, getSCMRepositoryIcon, getStatusBarCommandGenericName, isSCMActionButton, isSCMArtifactGroupTreeElement, isSCMArtifactNode, isSCMArtifactTreeElement, isSCMHistoryItemChangeNode, isSCMHistoryItemChangeViewModelTreeElement, isSCMHistoryItemLoadMoreTreeElement, isSCMHistoryItemViewModelTreeElement, isSCMInput, isSCMRepository, isSCMResource, isSCMResourceGroup, isSCMResourceNode, isSCMViewService };
