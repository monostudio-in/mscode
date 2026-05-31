
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable, DisposableMap, DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { Extensions, NoTreeViewError, ResolvableTreeItem } from '@codingame/monaco-vscode-api/vscode/vs/workbench/common/views';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { distinct } from '@codingame/monaco-vscode-api/vscode/vs/base/common/arrays';
import { INotificationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service';
import { isUndefinedOrNull, isNumber } from '@codingame/monaco-vscode-api/vscode/vs/base/common/types';
import { Registry } from '@codingame/monaco-vscode-api/vscode/vs/platform/registry/common/platform';
import { IExtensionService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { VSDataTransfer, UriList, createStringDataTransferItem } from '@codingame/monaco-vscode-api/vscode/vs/base/common/dataTransfer';
import { Mimes } from '@codingame/monaco-vscode-api/vscode/vs/base/common/mime';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { DataTransferFileCache } from '../common/shared/dataTransferCache.js';
import { DataTransfer } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostTypeConverters';
import { IViewsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/views/common/viewsService.service';
import { ITelemetryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service';

let MainThreadTreeViews = class MainThreadTreeViews extends Disposable {
    constructor(
        extHostContext,
        viewsService,
        notificationService,
        extensionService,
        logService,
        telemetryService
    ) {
        super();
        this.viewsService = viewsService;
        this.notificationService = notificationService;
        this.extensionService = extensionService;
        this.logService = logService;
        this.telemetryService = telemetryService;
        this._dataProviders = this._register(( new DisposableMap()));
        this._dndControllers = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostTreeViews));
    }
    async $registerTreeViewDataProvider(treeViewId, options) {
        this.logService.trace("MainThreadTreeViews#$registerTreeViewDataProvider", treeViewId, options);
        this.extensionService.whenInstalledExtensionsRegistered().then(() => {
            const dataProvider = ( new TreeViewDataProvider(treeViewId, this._proxy, this.notificationService));
            const disposables = ( new DisposableStore());
            this._dataProviders.set(treeViewId, {
                dataProvider,
                dispose: () => disposables.dispose()
            });
            const dndController = (options.hasHandleDrag || options.hasHandleDrop) ? ( new TreeViewDragAndDropController(
                treeViewId,
                options.dropMimeTypes,
                options.dragMimeTypes,
                options.hasHandleDrag,
                this._proxy
            )) : undefined;
            const viewer = this.getTreeView(treeViewId);
            if (viewer) {
                viewer.showCollapseAllAction = options.showCollapseAll;
                viewer.canSelectMany = options.canSelectMany;
                viewer.manuallyManageCheckboxes = options.manuallyManageCheckboxes;
                viewer.dragAndDropController = dndController;
                if (dndController) {
                    this._dndControllers.set(treeViewId, dndController);
                }
                viewer.dataProvider = dataProvider;
                this.registerListeners(treeViewId, viewer, disposables);
                this._proxy.$setVisible(treeViewId, viewer.visible);
            } else {
                this.notificationService.error("No view is registered with id: " + treeViewId);
            }
        });
    }
    $reveal(treeViewId, itemInfo, options) {
        this.logService.trace(
            "MainThreadTreeViews#$reveal",
            treeViewId,
            itemInfo?.item,
            itemInfo?.parentChain,
            options
        );
        return this.viewsService.openView(treeViewId, options.focus).then(() => {
            const viewer = this.getTreeView(treeViewId);
            if (viewer && itemInfo) {
                return this.reveal(
                    viewer,
                    this._dataProviders.get(treeViewId).dataProvider,
                    itemInfo.item,
                    itemInfo.parentChain,
                    options
                );
            }
            return undefined;
        });
    }
    $refresh(treeViewId, itemsToRefreshByHandle) {
        this.logService.trace("MainThreadTreeViews#$refresh", treeViewId, itemsToRefreshByHandle);
        const viewer = this.getTreeView(treeViewId);
        const dataProvider = this._dataProviders.get(treeViewId);
        if (viewer && dataProvider) {
            const itemsToRefresh = dataProvider.dataProvider.getItemsToRefresh(itemsToRefreshByHandle);
            return viewer.refresh(
                itemsToRefresh.items.length ? itemsToRefresh.items : undefined,
                itemsToRefresh.checkboxes.length ? itemsToRefresh.checkboxes : undefined
            );
        }
        return Promise.resolve();
    }
    $setMessage(treeViewId, message) {
        this.logService.trace("MainThreadTreeViews#$setMessage", treeViewId, ( message.toString()));
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.message = message;
        }
    }
    $setTitle(treeViewId, title, description) {
        this.logService.trace("MainThreadTreeViews#$setTitle", treeViewId, title, description);
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.title = title;
            viewer.description = description;
        }
    }
    $setBadge(treeViewId, badge) {
        this.logService.trace("MainThreadTreeViews#$setBadge", treeViewId, badge?.value, badge?.tooltip);
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.badge = badge;
        }
    }
    $resolveDropFileData(destinationViewId, requestId, dataItemId) {
        const controller = this._dndControllers.get(destinationViewId);
        if (!controller) {
            throw ( new Error("Unknown tree"));
        }
        return controller.resolveDropFileData(requestId, dataItemId);
    }
    async $disposeTree(treeViewId) {
        const viewer = this.getTreeView(treeViewId);
        if (viewer) {
            viewer.dataProvider = undefined;
        }
        this._dataProviders.deleteAndDispose(treeViewId);
    }
    $logResolveTreeNodeFailure(extensionId) {
        this.telemetryService.publicLog2("treeView.resolveFailure", {
            extensionId
        });
    }
    async reveal(treeView, dataProvider, itemIn, parentChain, options) {
        options = options ? options : {
            select: false,
            focus: false
        };
        const select = isUndefinedOrNull(options.select) ? false : options.select;
        const focus = isUndefinedOrNull(options.focus) ? false : options.focus;
        let expand = Math.min(
            isNumber(options.expand) ? options.expand : options.expand === true ? 1 : 0,
            3
        );
        if (dataProvider.isEmpty()) {
            await treeView.refresh();
        }
        for (const parent of parentChain) {
            const parentItem = dataProvider.getItem(parent.handle);
            if (parentItem) {
                await treeView.expand(parentItem);
            }
        }
        const item = dataProvider.getItem(itemIn.handle);
        if (item) {
            await treeView.reveal(item);
            if (select) {
                treeView.setSelection([item]);
            }
            if (focus === false) {
                treeView.setFocus();
            } else if (focus) {
                treeView.setFocus(item);
            }
            let itemsToExpand = [item];
            for (; itemsToExpand.length > 0 && expand > 0; expand--) {
                await treeView.expand(itemsToExpand);
                itemsToExpand = itemsToExpand.reduce((result, itemValue) => {
                    const item = dataProvider.getItem(itemValue.handle);
                    if (item && item.children && item.children.length) {
                        result.push(...item.children);
                    }
                    return result;
                }, []);
            }
        }
    }
    registerListeners(treeViewId, treeView, disposables) {
        disposables.add(
            treeView.onDidExpandItem(item => this._proxy.$setExpanded(treeViewId, item.handle, true))
        );
        disposables.add(
            treeView.onDidCollapseItem(item => this._proxy.$setExpanded(treeViewId, item.handle, false))
        );
        disposables.add(
            treeView.onDidChangeSelectionAndFocus(items => this._proxy.$setSelectionAndFocus(treeViewId, ( items.selection.map((
                {
                    handle
                }
            ) => handle)), items.focus.handle))
        );
        disposables.add(
            treeView.onDidChangeVisibility(isVisible => this._proxy.$setVisible(treeViewId, isVisible))
        );
        disposables.add(treeView.onDidChangeCheckboxState(items => {
            this._proxy.$changeCheckboxState(treeViewId, ( items.map(item => {
                return {
                    treeItemHandle: item.handle,
                    newState: item.checkbox?.isChecked ?? false
                };
            })));
        }));
    }
    getTreeView(treeViewId) {
        const viewDescriptor = ( Registry.as(Extensions.ViewsRegistry)).getView(treeViewId);
        return viewDescriptor ? viewDescriptor.treeView : null;
    }
    dispose() {
        for (const dataprovider of this._dataProviders) {
            const treeView = this.getTreeView(dataprovider[0]);
            if (treeView) {
                treeView.dataProvider = undefined;
            }
        }
        this._dataProviders.dispose();
        this._dndControllers.clear();
        super.dispose();
    }
};
MainThreadTreeViews = __decorate([extHostNamedCustomer(MainContext.MainThreadTreeViews), ( __param(1, IViewsService)), ( __param(2, INotificationService)), ( __param(3, IExtensionService)), ( __param(4, ILogService)), ( __param(5, ITelemetryService))], MainThreadTreeViews);
class TreeViewDragAndDropController {
    constructor(treeViewId, dropMimeTypes, dragMimeTypes, hasWillDrop, _proxy) {
        this.treeViewId = treeViewId;
        this.dropMimeTypes = dropMimeTypes;
        this.dragMimeTypes = dragMimeTypes;
        this.hasWillDrop = hasWillDrop;
        this._proxy = _proxy;
        this.dataTransfersCache = ( new DataTransferFileCache());
    }
    async handleDrop(
        dataTransfer,
        targetTreeItem,
        token,
        operationUuid,
        sourceTreeId,
        sourceTreeItemHandles
    ) {
        const request = this.dataTransfersCache.add(dataTransfer);
        try {
            const dataTransferDto = await DataTransfer.fromList(dataTransfer);
            if (token.isCancellationRequested) {
                return;
            }
            return await this._proxy.$handleDrop(
                this.treeViewId,
                request.id,
                dataTransferDto,
                targetTreeItem?.handle,
                token,
                operationUuid,
                sourceTreeId,
                sourceTreeItemHandles
            );
        } finally {
            request.dispose();
        }
    }
    async handleDrag(sourceTreeItemHandles, operationUuid, token) {
        if (!this.hasWillDrop) {
            return;
        }
        const additionalDataTransferDTO = await this._proxy.$handleDrag(this.treeViewId, sourceTreeItemHandles, operationUuid, token);
        if (!additionalDataTransferDTO) {
            return;
        }
        const additionalDataTransfer = ( new VSDataTransfer());
        additionalDataTransferDTO.items.forEach(([type, item]) => {
            const value = type === Mimes.uriList && item.uriListData ? UriList.create(( item.uriListData.map(part => typeof part === "string" ? part : URI.revive(part)))) : item.asString;
            additionalDataTransfer.replace(type, createStringDataTransferItem(value));
        });
        return additionalDataTransfer;
    }
    resolveDropFileData(requestId, dataItemId) {
        return this.dataTransfersCache.resolveFileData(requestId, dataItemId);
    }
}
class TreeViewDataProvider {
    constructor(treeViewId, _proxy, notificationService) {
        this.treeViewId = treeViewId;
        this._proxy = _proxy;
        this.notificationService = notificationService;
        this.itemsMap = ( new Map());
        this.hasResolve = this._proxy.$hasResolve(this.treeViewId);
    }
    async getChildren(treeItem) {
        const batches = await this.getChildrenBatch(treeItem ? [treeItem] : undefined);
        return batches?.[0];
    }
    getChildrenBatch(treeItems) {
        if (!treeItems) {
            this.itemsMap.clear();
        }
        return this._proxy.$getChildren(this.treeViewId, treeItems ? ( treeItems.map(item => item.handle)) : undefined).then(children => {
            const convertedChildren = this.convertTransferChildren(treeItems ?? [], children);
            return this.postGetChildren(convertedChildren);
        }, err => {
            if (!NoTreeViewError.is(err)) {
                this.notificationService.error(err);
            }
            return [];
        });
    }
    convertTransferChildren(parents, children) {
        const convertedChildren = Array(parents.length);
        if (children) {
            for (const childGroup of children) {
                const childGroupIndex = childGroup[0];
                convertedChildren[childGroupIndex] = childGroup.slice(1);
            }
        }
        return convertedChildren;
    }
    getItemsToRefresh(itemsToRefreshByHandle) {
        const itemsToRefresh = [];
        const checkboxesToRefresh = [];
        if (itemsToRefreshByHandle) {
            for (const newTreeItemHandle of ( Object.keys(itemsToRefreshByHandle))) {
                const currentTreeItem = this.getItem(newTreeItemHandle);
                if (currentTreeItem) {
                    const newTreeItem = itemsToRefreshByHandle[newTreeItemHandle];
                    if (currentTreeItem.checkbox?.isChecked !== newTreeItem.checkbox?.isChecked) {
                        checkboxesToRefresh.push(currentTreeItem);
                    }
                    this.updateTreeItem(currentTreeItem, newTreeItem);
                    if (newTreeItemHandle === newTreeItem.handle) {
                        itemsToRefresh.push(currentTreeItem);
                    } else {
                        this.itemsMap.delete(newTreeItemHandle);
                        this.itemsMap.set(currentTreeItem.handle, currentTreeItem);
                        const parent = newTreeItem.parentHandle ? this.itemsMap.get(newTreeItem.parentHandle) : null;
                        if (parent) {
                            itemsToRefresh.push(parent);
                        }
                    }
                }
            }
        }
        return {
            items: itemsToRefresh,
            checkboxes: checkboxesToRefresh
        };
    }
    getItem(treeItemHandle) {
        return this.itemsMap.get(treeItemHandle);
    }
    isEmpty() {
        return this.itemsMap.size === 0;
    }
    async postGetChildren(elementGroups) {
        if (elementGroups === undefined) {
            return undefined;
        }
        const resultGroups = [];
        const hasResolve = await this.hasResolve;
        if (elementGroups) {
            for (const elements of elementGroups) {
                const result = [];
                resultGroups.push(result);
                if (!elements) {
                    continue;
                }
                for (const element of elements) {
                    const resolvable = ( new ResolvableTreeItem(element, hasResolve ? token => {
                        return this._proxy.$resolve(this.treeViewId, element.handle, token);
                    } : undefined));
                    this.itemsMap.set(element.handle, resolvable);
                    result.push(resolvable);
                }
            }
        }
        return resultGroups;
    }
    updateTreeItem(current, treeItem) {
        treeItem.children = treeItem.children ? treeItem.children : undefined;
        if (current) {
            const properties = distinct([...( Object.keys(current instanceof ResolvableTreeItem ? current.asTreeItem() : current)), ...( Object.keys(treeItem))]);
            for (const property of properties) {
                current[property] = treeItem[property];
            }
            if (current instanceof ResolvableTreeItem) {
                current.resetResolve();
            }
        }
    }
}

export { MainThreadTreeViews };
