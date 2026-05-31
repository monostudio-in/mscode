
import { basename } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, DisposableStore, dispose } from '../../../base/common/lifecycle.js';
import { NoTreeViewError } from '../../common/views.js';
import { asPromise } from '../../../base/common/async.js';
import { ViewBadge, DataTransfer as DataTransfer$1, TreeItemCheckboxState, TreeItem, TreeItemCollapsibleState, ThemeIcon } from './extHostTypes.js';
import { isString, isUndefinedOrNull } from '../../../base/common/types.js';
import { distinct, equals, coalesce } from '../../../base/common/arrays.js';
import { LogLevel } from '../../../platform/log/common/log.js';
import { MarkdownString as MarkdownString$1, DataTransfer, ViewBadge as ViewBadge$1 } from './extHostTypeConverters.js';
import { isMarkdownString } from '../../../base/common/htmlContent.js';
import { CancellationTokenSource } from '../../../base/common/cancellation.js';
import { TreeViewsDnDService } from '../../../editor/common/services/treeViewsDnd.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { MarkdownString } from './extHostTypes/markdownString.js';

function toTreeItemLabel(label, extension) {
    if (isString(label)) {
        return {
            label
        };
    }
    if (label && typeof label === "object" && label.label) {
        let highlights = undefined;
        if (Array.isArray(label.highlights)) {
            highlights = label.highlights.filter(
                (highlight => highlight.length === 2 && typeof highlight[0] === "number" && typeof highlight[1] === "number")
            );
            highlights = highlights.length ? highlights : undefined;
        }
        if (isString(label.label)) {
            return {
                label: label.label,
                highlights
            };
        } else if (MarkdownString.isMarkdownString(label.label)) {
            checkProposedApiEnabled(extension, "treeItemMarkdownLabel");
            return {
                label: MarkdownString$1.from(label.label),
                highlights
            };
        }
    }
    return undefined;
}
class ExtHostTreeViews extends Disposable {
    constructor(_proxy, _commands, _logService) {
        super();
        this._proxy = _proxy;
        this._commands = _commands;
        this._logService = _logService;
        this._treeViews = ( new Map());
        this._treeDragAndDropService = ( new TreeViewsDnDService());
        function isTreeViewConvertableItem(arg) {
            return arg && arg.$treeViewId && (arg.$treeItemHandle || arg.$selectedTreeItems || arg.$focusedTreeItem);
        }
        _commands.registerArgumentProcessor({
            processArgument: arg => {
                if (isTreeViewConvertableItem(arg)) {
                    return this._convertArgument(arg);
                } else if (Array.isArray(arg) && (arg.length > 0)) {
                    return ( arg.map(item => {
                        if (isTreeViewConvertableItem(item)) {
                            return this._convertArgument(item);
                        }
                        return item;
                    }));
                }
                return arg;
            }
        });
    }
    registerTreeDataProvider(id, treeDataProvider, extension) {
        const treeView = this.createTreeView(id, {
            treeDataProvider
        }, extension);
        return {
            dispose: () => treeView.dispose()
        };
    }
    createTreeView(viewId, options, extension) {
        if (!options || !options.treeDataProvider) {
            throw ( new Error("Options with treeDataProvider is mandatory"));
        }
        const dropMimeTypes = options.dragAndDropController?.dropMimeTypes ?? [];
        const dragMimeTypes = options.dragAndDropController?.dragMimeTypes ?? [];
        const hasHandleDrag = !!options.dragAndDropController?.handleDrag;
        const hasHandleDrop = !!options.dragAndDropController?.handleDrop;
        const treeView = this._createExtHostTreeView(viewId, options, extension);
        const proxyOptions = {
            showCollapseAll: !!options.showCollapseAll,
            canSelectMany: !!options.canSelectMany,
            dropMimeTypes,
            dragMimeTypes,
            hasHandleDrag,
            hasHandleDrop,
            manuallyManageCheckboxes: !!options.manageCheckboxStateManually
        };
        const registerPromise = this._proxy.$registerTreeViewDataProvider(viewId, proxyOptions);
        const view = {
            get onDidCollapseElement() {
                return treeView.onDidCollapseElement;
            },
            get onDidExpandElement() {
                return treeView.onDidExpandElement;
            },
            get selection() {
                return treeView.selectedElements;
            },
            get onDidChangeSelection() {
                return treeView.onDidChangeSelection;
            },
            get activeItem() {
                checkProposedApiEnabled(extension, "treeViewActiveItem");
                return treeView.focusedElement;
            },
            get onDidChangeActiveItem() {
                checkProposedApiEnabled(extension, "treeViewActiveItem");
                return treeView.onDidChangeActiveItem;
            },
            get visible() {
                return treeView.visible;
            },
            get onDidChangeVisibility() {
                return treeView.onDidChangeVisibility;
            },
            get onDidChangeCheckboxState() {
                return treeView.onDidChangeCheckboxState;
            },
            get message() {
                return treeView.message;
            },
            set message(message) {
                if (isMarkdownString(message)) {
                    checkProposedApiEnabled(extension, "treeViewMarkdownMessage");
                }
                treeView.message = message;
            },
            get title() {
                return treeView.title;
            },
            set title(title) {
                treeView.title = title;
            },
            get description() {
                return treeView.description;
            },
            set description(description) {
                treeView.description = description;
            },
            get badge() {
                return treeView.badge;
            },
            set badge(badge) {
                if ((badge !== undefined) && ViewBadge.isViewBadge(badge)) {
                    treeView.badge = {
                        value: Math.floor(Math.abs(badge.value)),
                        tooltip: badge.tooltip
                    };
                } else if (badge === undefined) {
                    treeView.badge = undefined;
                }
            },
            reveal: (element, options) => {
                return treeView.reveal(element, options);
            },
            dispose: async () => {
                await registerPromise;
                if (this._treeViews.get(viewId) === treeView) {
                    this._treeViews.delete(viewId);
                    this._proxy.$disposeTree(viewId);
                }
                treeView.dispose();
            }
        };
        this._register(view);
        return view;
    }
    async $getChildren(treeViewId, treeItemHandles) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            return Promise.reject(( new NoTreeViewError(treeViewId)));
        }
        if (!treeItemHandles) {
            const children = await treeView.getChildren();
            return children ? [[0, ...children]] : undefined;
        }
        const result = [];
        for (let i = 0; i < treeItemHandles.length; i++) {
            const treeItemHandle = treeItemHandles[i];
            const children = await treeView.getChildren(treeItemHandle);
            if (children) {
                result.push([i, ...children]);
            }
        }
        return result;
    }
    async $handleDrop(
        destinationViewId,
        requestId,
        treeDataTransferDTO,
        targetItemHandle,
        token,
        operationUuid,
        sourceViewId,
        sourceTreeItemHandles
    ) {
        const treeView = this._treeViews.get(destinationViewId);
        if (!treeView) {
            return Promise.reject(( new NoTreeViewError(destinationViewId)));
        }
        const treeDataTransfer = DataTransfer.toDataTransfer(treeDataTransferDTO, async dataItemIndex => {
            return (await this._proxy.$resolveDropFileData(destinationViewId, requestId, dataItemIndex)).buffer;
        });
        if ((sourceViewId === destinationViewId) && sourceTreeItemHandles) {
            await this._addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid);
        }
        return treeView.onDrop(treeDataTransfer, targetItemHandle, token);
    }
    async _addAdditionalTransferItems(treeDataTransfer, treeView, sourceTreeItemHandles, token, operationUuid) {
        const existingTransferOperation = this._treeDragAndDropService.removeDragOperationTransfer(operationUuid);
        if (existingTransferOperation) {
            (await existingTransferOperation)?.forEach((value, key) => {
                if (value) {
                    treeDataTransfer.set(key, value);
                }
            });
        } else if (operationUuid && treeView.handleDrag) {
            const willDropPromise = treeView.handleDrag(sourceTreeItemHandles, treeDataTransfer, token);
            this._treeDragAndDropService.addDragOperationTransfer(operationUuid, willDropPromise);
            await willDropPromise;
        }
        return treeDataTransfer;
    }
    async $handleDrag(sourceViewId, sourceTreeItemHandles, operationUuid, token) {
        const treeView = this._treeViews.get(sourceViewId);
        if (!treeView) {
            return Promise.reject(( new NoTreeViewError(sourceViewId)));
        }
        const treeDataTransfer = await this._addAdditionalTransferItems(
            new DataTransfer$1(),
            treeView,
            sourceTreeItemHandles,
            token,
            operationUuid
        );
        if (!treeDataTransfer || token.isCancellationRequested) {
            return;
        }
        return DataTransfer.from(treeDataTransfer);
    }
    async $hasResolve(treeViewId) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            throw ( new NoTreeViewError(treeViewId));
        }
        return treeView.hasResolve;
    }
    $resolve(treeViewId, treeItemHandle, token) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            throw ( new NoTreeViewError(treeViewId));
        }
        return treeView.resolveTreeItem(treeItemHandle, token);
    }
    $setExpanded(treeViewId, treeItemHandle, expanded) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            throw ( new NoTreeViewError(treeViewId));
        }
        treeView.setExpanded(treeItemHandle, expanded);
    }
    $setSelectionAndFocus(treeViewId, selectedHandles, focusedHandle) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            throw ( new NoTreeViewError(treeViewId));
        }
        treeView.setSelectionAndFocus(selectedHandles, focusedHandle);
    }
    $setVisible(treeViewId, isVisible) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            if (!isVisible) {
                return;
            }
            throw ( new NoTreeViewError(treeViewId));
        }
        treeView.setVisible(isVisible);
    }
    $changeCheckboxState(treeViewId, checkboxUpdate) {
        const treeView = this._treeViews.get(treeViewId);
        if (!treeView) {
            throw ( new NoTreeViewError(treeViewId));
        }
        treeView.setCheckboxState(checkboxUpdate);
    }
    _createExtHostTreeView(id, options, extension) {
        const treeView = this._register(( new ExtHostTreeView(
            id,
            options,
            this._proxy,
            this._commands.converter,
            this._logService,
            extension
        )));
        this._treeViews.set(id, treeView);
        return treeView;
    }
    _convertArgument(arg) {
        const treeView = this._treeViews.get(arg.$treeViewId);
        const asItemHandle = arg;
        if (treeView && asItemHandle.$treeItemHandle) {
            return treeView.getExtensionElement(asItemHandle.$treeItemHandle);
        }
        const asPaneHandle = arg;
        if (treeView && asPaneHandle.$focusedTreeItem) {
            return treeView.focusedElement;
        }
        return null;
    }
}
class ExtHostTreeView extends Disposable {
    static {
        this.LABEL_HANDLE_PREFIX = "0";
    }
    static {
        this.ID_HANDLE_PREFIX = "1";
    }
    static {
        this.ROOT_FETCH_KEY = Symbol("extHostTreeViewRoot");
    }
    get visible() {
        return this._visible;
    }
    get selectedElements() {
        return ( this._selectedHandles.map(handle => this.getExtensionElement(handle))).filter(element => !isUndefinedOrNull(element));
    }
    get focusedElement() {
        return (this._focusedHandle ? this.getExtensionElement(this._focusedHandle) : undefined);
    }
    constructor(_viewId, options, _proxy, _commands, _logService, _extension) {
        super();
        this._viewId = _viewId;
        this._proxy = _proxy;
        this._commands = _commands;
        this._logService = _logService;
        this._extension = _extension;
        this._roots = undefined;
        this._elements = ( new Map());
        this._nodes = ( new Map());
        this._childrenFetchTokens = ( new Map());
        this._globalFetchTokenCounter = 0;
        this._visible = false;
        this._selectedHandles = [];
        this._focusedHandle = undefined;
        this._onDidExpandElement = this._register(( new Emitter()));
        this.onDidExpandElement = this._onDidExpandElement.event;
        this._onDidCollapseElement = this._register(( new Emitter()));
        this.onDidCollapseElement = this._onDidCollapseElement.event;
        this._onDidChangeSelection = this._register(( new Emitter()));
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this._onDidChangeActiveItem = this._register(( new Emitter()));
        this.onDidChangeActiveItem = this._onDidChangeActiveItem.event;
        this._onDidChangeVisibility = this._register(( new Emitter()));
        this.onDidChangeVisibility = this._onDidChangeVisibility.event;
        this._onDidChangeCheckboxState = this._register(( new Emitter()));
        this.onDidChangeCheckboxState = this._onDidChangeCheckboxState.event;
        this._onDidChangeData = this._register(( new Emitter()));
        this._refreshPromise = Promise.resolve();
        this._refreshQueue = Promise.resolve();
        this._nodesToClear = ( new Set());
        this._message = "";
        this._title = "";
        this._refreshCancellationSource = ( new CancellationTokenSource());
        if (_extension.contributes && _extension.contributes.views) {
            for (const location in _extension.contributes.views) {
                for (const view of _extension.contributes.views[location]) {
                    if (view.id === _viewId) {
                        this._title = view.name;
                    }
                }
            }
        }
        this._dataProvider = options.treeDataProvider;
        this._dndController = options.dragAndDropController;
        if (this._dataProvider.onDidChangeTreeData) {
            this._register(this._dataProvider.onDidChangeTreeData(elementOrElements => {
                if (Array.isArray(elementOrElements) && elementOrElements.length === 0) {
                    return;
                }
                this._onDidChangeData.fire({
                    message: false,
                    element: elementOrElements
                });
            }));
        }
        let refreshingPromise;
        let promiseCallback;
        const onDidChangeData = Event.debounce(this._onDidChangeData.event, (result, current) => {
            if (!result) {
                result = {
                    message: false,
                    elements: []
                };
            }
            if (current.element !== false) {
                if (!refreshingPromise) {
                    refreshingPromise = ( new Promise(c => promiseCallback = c));
                    this._refreshPromise = this._refreshPromise.then(() => refreshingPromise);
                }
                if (Array.isArray(current.element)) {
                    result.elements.push(...current.element);
                } else {
                    result.elements.push(current.element);
                }
            }
            if (current.message) {
                result.message = true;
            }
            return result;
        }, 200, true);
        this._register(onDidChangeData((
            {
                message,
                elements
            }
        ) => {
            if (elements.length) {
                elements = distinct(elements);
                this._refreshQueue = this._refreshQueue.then(() => {
                    const _promiseCallback = promiseCallback;
                    refreshingPromise = null;
                    const childrenToClear = Array.from(this._nodesToClear);
                    this._nodesToClear.clear();
                    this._debugLogRefresh("start", elements, childrenToClear);
                    return this._refresh(elements).then(() => {
                        this._debugLogRefresh("done", elements, childrenToClear);
                        this._clearNodes(childrenToClear);
                        return _promiseCallback();
                    }).catch(e => {
                        const message = e instanceof Error ? e.message : JSON.stringify(e);
                        this._debugLogRefresh("error", elements, childrenToClear);
                        this._clearNodes(childrenToClear);
                        this._logService.error(`Unable to refresh tree view ${this._viewId}: ${message}`);
                        return _promiseCallback();
                    });
                });
            }
            if (message) {
                this._proxy.$setMessage(this._viewId, MarkdownString$1.fromStrict(this._message) ?? "");
            }
        }));
    }
    _debugCollectHandles(elements) {
        const changed = [];
        for (const el of elements) {
            if (!el) {
                changed.push("<root>");
                continue;
            }
            const node = this._nodes.get(el);
            if (node) {
                changed.push(node.item.handle);
            }
        }
        const roots = this._roots?.map(r => r.item.handle) ?? [];
        return {
            changed,
            roots
        };
    }
    _debugLogRefresh(phase, elements, childrenToClear) {
        if (!this._isDebugLogging()) {
            return;
        }
        try {
            const snapshot = this._debugCollectHandles(elements);
            snapshot.clearing = ( childrenToClear.map(n => n.item.handle));
            const changedCount = snapshot.changed.length;
            const nodesToClearLen = childrenToClear.length;
            this._logService.debug(
                `[TreeView:${this._viewId}] refresh ${phase} changed=${changedCount} nodesToClear=${nodesToClearLen} elements.size=${this._elements.size} nodes.size=${this._nodes.size} handles=${JSON.stringify(snapshot)}`
            );
        } catch {
            this._logService.debug(`[TreeView:${this._viewId}] refresh ${phase} (snapshot failed)`);
        }
    }
    _isDebugLogging() {
        try {
            const level = this._logService.getLevel();
            return (level === LogLevel.Debug) || (level === LogLevel.Trace);
        } catch {
            return false;
        }
    }
    async getChildren(parentHandle) {
        const parentElement = parentHandle ? this.getExtensionElement(parentHandle) : undefined;
        if (parentHandle && !parentElement) {
            this._logService.error(`No tree item with id \'${parentHandle}\' found.`);
            return Promise.resolve([]);
        }
        let childrenNodes = this._getChildrenNodes(parentHandle);
        if (!childrenNodes) {
            childrenNodes = await this._fetchChildrenNodes(parentElement);
        }
        return childrenNodes ? ( childrenNodes.map(n => n.item)) : undefined;
    }
    getExtensionElement(treeItemHandle) {
        return this._elements.get(treeItemHandle);
    }
    reveal(element, options) {
        options = options ? options : {
            select: true,
            focus: false
        };
        const select = isUndefinedOrNull(options.select) ? true : options.select;
        const focus = isUndefinedOrNull(options.focus) ? false : options.focus;
        const expand = isUndefinedOrNull(options.expand) ? false : options.expand;
        if (typeof this._dataProvider.getParent !== "function") {
            return Promise.reject(( new Error(
                `Required registered TreeDataProvider to implement 'getParent' method to access 'reveal' method`
            )));
        }
        if (element) {
            return this._refreshPromise.then(() => this._resolveUnknownParentChain(element)).then(
                parentChain => this._resolveTreeNode(element, parentChain[parentChain.length - 1]).then(treeNode => this._proxy.$reveal(this._viewId, {
                    item: treeNode.item,
                    parentChain: ( parentChain.map(p => p.item))
                }, {
                    select,
                    focus,
                    expand
                })),
                error => this._logService.error(error)
            );
        } else {
            return this._proxy.$reveal(this._viewId, undefined, {
                select,
                focus,
                expand
            });
        }
    }
    get message() {
        return this._message;
    }
    set message(message) {
        this._message = message;
        this._onDidChangeData.fire({
            message: true,
            element: false
        });
    }
    get title() {
        return this._title;
    }
    set title(title) {
        this._title = title;
        this._proxy.$setTitle(this._viewId, title, this._description);
    }
    get description() {
        return this._description;
    }
    set description(description) {
        this._description = description;
        this._proxy.$setTitle(this._viewId, this._title, description);
    }
    get badge() {
        return this._badge;
    }
    set badge(badge) {
        if (this._badge?.value === badge?.value && this._badge?.tooltip === badge?.tooltip) {
            return;
        }
        this._badge = ViewBadge$1.from(badge);
        this._proxy.$setBadge(this._viewId, badge);
    }
    setExpanded(treeItemHandle, expanded) {
        const element = this.getExtensionElement(treeItemHandle);
        if (element) {
            if (expanded) {
                this._onDidExpandElement.fire(( Object.freeze({
                    element
                })));
            } else {
                this._onDidCollapseElement.fire(( Object.freeze({
                    element
                })));
            }
        }
    }
    setSelectionAndFocus(selectedHandles, focusedHandle) {
        const changedSelection = !equals(this._selectedHandles, selectedHandles);
        this._selectedHandles = selectedHandles;
        const changedFocus = this._focusedHandle !== focusedHandle;
        this._focusedHandle = focusedHandle;
        if (changedSelection) {
            this._onDidChangeSelection.fire(( Object.freeze({
                selection: this.selectedElements
            })));
        }
        if (changedFocus) {
            this._onDidChangeActiveItem.fire(( Object.freeze({
                activeItem: this.focusedElement
            })));
        }
    }
    setVisible(visible) {
        if (visible !== this._visible) {
            this._visible = visible;
            this._onDidChangeVisibility.fire(( Object.freeze({
                visible: this._visible
            })));
        }
    }
    async setCheckboxState(checkboxUpdates) {
        const items = (await Promise.all(( checkboxUpdates.map(async checkboxUpdate => {
            const extensionItem = this.getExtensionElement(checkboxUpdate.treeItemHandle);
            if (extensionItem) {
                return {
                    extensionItem: extensionItem,
                    treeItem: await this._dataProvider.getTreeItem(extensionItem),
                    newState: checkboxUpdate.newState ? TreeItemCheckboxState.Checked : TreeItemCheckboxState.Unchecked
                };
            }
            return Promise.resolve(undefined);
        })))).filter(item => item !== undefined);
        items.forEach(item => {
            item.treeItem.checkboxState = item.newState ? TreeItemCheckboxState.Checked : TreeItemCheckboxState.Unchecked;
        });
        this._onDidChangeCheckboxState.fire({
            items: ( items.map(item => [item.extensionItem, item.newState]))
        });
    }
    async handleDrag(sourceTreeItemHandles, treeDataTransfer, token) {
        const extensionTreeItems = [];
        for (const sourceHandle of sourceTreeItemHandles) {
            const extensionItem = this.getExtensionElement(sourceHandle);
            if (extensionItem) {
                extensionTreeItems.push(extensionItem);
            }
        }
        if (!this._dndController?.handleDrag || (extensionTreeItems.length === 0)) {
            return;
        }
        await this._dndController.handleDrag(extensionTreeItems, treeDataTransfer, token);
        return treeDataTransfer;
    }
    get hasHandleDrag() {
        return !!this._dndController?.handleDrag;
    }
    async onDrop(treeDataTransfer, targetHandleOrNode, token) {
        const target = targetHandleOrNode ? this.getExtensionElement(targetHandleOrNode) : undefined;
        if ((!target && targetHandleOrNode) || !this._dndController?.handleDrop) {
            return;
        }
        return asPromise(
            () => this._dndController?.handleDrop ? this._dndController.handleDrop(target, treeDataTransfer, token) : undefined
        );
    }
    get hasResolve() {
        return !!this._dataProvider.resolveTreeItem;
    }
    async resolveTreeItem(treeItemHandle, token) {
        if (!this._dataProvider.resolveTreeItem) {
            return;
        }
        const element = this._elements.get(treeItemHandle);
        if (element) {
            const node = this._nodes.get(element);
            if (node) {
                const resolve = (await this._dataProvider.resolveTreeItem(node.extensionItem, element, token)) ?? node.extensionItem;
                this._validateTreeItem(resolve);
                node.item.tooltip = this._getTooltip(resolve.tooltip);
                node.item.command = this._getCommand(node.disposableStore, resolve.command);
                return node.item;
            }
        }
        return;
    }
    _resolveUnknownParentChain(element) {
        return this._resolveParent(element).then(parent => {
            if (!parent) {
                return Promise.resolve([]);
            }
            return this._resolveUnknownParentChain(parent).then(
                result => this._resolveTreeNode(parent, result[result.length - 1]).then(parentNode => {
                    result.push(parentNode);
                    return result;
                })
            );
        });
    }
    _resolveParent(element) {
        const node = this._nodes.get(element);
        if (node) {
            return Promise.resolve(node.parent ? this._elements.get(node.parent.item.handle) : undefined);
        }
        return asPromise(() => this._dataProvider.getParent(element));
    }
    async _resolveTreeNode(element, parent) {
        const node = this._nodes.get(element);
        if (node) {
            return node;
        }
        const extTreeItem = await asPromise(() => this._dataProvider.getTreeItem(element));
        const handle = this._createHandle(element, extTreeItem, parent, true);
        await this.getChildren(parent ? parent.item.handle : undefined);
        const cachedElement = this.getExtensionElement(handle);
        if (cachedElement) {
            const node = this._nodes.get(cachedElement);
            if (node) {
                return node;
            }
        }
        this._logService.error(
            `[TreeView:${this._viewId}] Failed to resolve tree node for element ${handle}`
        );
        this._proxy.$logResolveTreeNodeFailure(this._extension.identifier.value);
        throw ( new Error(
            `Cannot resolve tree item for element ${handle} from extension ${this._extension.identifier.value}`
        ));
    }
    _getChildrenNodes(parentNodeOrHandle) {
        if (parentNodeOrHandle) {
            let parentNode;
            if (typeof parentNodeOrHandle === "string") {
                const parentElement = this.getExtensionElement(parentNodeOrHandle);
                parentNode = parentElement ? this._nodes.get(parentElement) : undefined;
            } else {
                parentNode = parentNodeOrHandle;
            }
            return parentNode ? parentNode.children || undefined : undefined;
        }
        return this._roots;
    }
    _getFetchKey(parentElement) {
        return parentElement ?? ExtHostTreeView.ROOT_FETCH_KEY;
    }
    async _fetchChildrenNodes(parentElement) {
        this._addChildrenToClear(parentElement);
        const fetchKey = this._getFetchKey(parentElement);
        const requestId = ++this._globalFetchTokenCounter;
        this._childrenFetchTokens.set(fetchKey, requestId);
        const cts = ( new CancellationTokenSource(this._refreshCancellationSource.token));
        try {
            const elements = await this._dataProvider.getChildren(parentElement);
            if (this._childrenFetchTokens.get(fetchKey) !== requestId) {
                return undefined;
            }
            const parentNode = parentElement ? this._nodes.get(parentElement) : undefined;
            if (cts.token.isCancellationRequested) {
                return undefined;
            }
            const coalescedElements = coalesce(elements || []);
            const treeItems = await Promise.all(( coalesce(coalescedElements).map(element => {
                return this._dataProvider.getTreeItem(element);
            })));
            if (this._childrenFetchTokens.get(fetchKey) !== requestId) {
                return undefined;
            }
            if (cts.token.isCancellationRequested) {
                return undefined;
            }
            const items = ( treeItems.map(
                (item, index) => item ? this._createAndRegisterTreeNode(coalescedElements[index], item, parentNode) : null
            ));
            if (this._childrenFetchTokens.get(fetchKey) !== requestId) {
                return undefined;
            }
            return coalesce(items);
        } finally {
            cts.dispose();
        }
    }
    _refresh(elements) {
        const hasRoot = ( elements.some(element => !element));
        if (hasRoot) {
            this._refreshCancellationSource.dispose(true);
            this._refreshCancellationSource = ( new CancellationTokenSource());
            this._addChildrenToClear();
            return this._proxy.$refresh(this._viewId);
        } else {
            const handlesToRefresh = this._getHandlesToRefresh(elements);
            if (handlesToRefresh.length) {
                return this._refreshHandles(handlesToRefresh);
            }
        }
        return Promise.resolve(undefined);
    }
    _getHandlesToRefresh(elements) {
        const elementsToUpdate = ( new Set());
        const elementNodes = ( elements.map(element => this._nodes.get(element)));
        for (const elementNode of elementNodes) {
            if (elementNode && !( elementsToUpdate.has(elementNode.item.handle))) {
                let currentNode = elementNode;
                while (currentNode && currentNode.parent && elementNodes.findIndex(
                    node => currentNode && currentNode.parent && node && node.item.handle === currentNode.parent.item.handle
                ) === -1) {
                    const parentElement = this._elements.get(currentNode.parent.item.handle);
                    currentNode = parentElement ? this._nodes.get(parentElement) : undefined;
                }
                if (currentNode && !currentNode.parent) {
                    elementsToUpdate.add(elementNode.item.handle);
                }
            }
        }
        const handlesToUpdate = [];
        elementsToUpdate.forEach(handle => {
            const element = this._elements.get(handle);
            if (element) {
                const node = this._nodes.get(element);
                if (node && (!node.parent || !( elementsToUpdate.has(node.parent.item.handle)))) {
                    handlesToUpdate.push(handle);
                }
            }
        });
        return handlesToUpdate;
    }
    _refreshHandles(itemHandles) {
        const itemsToRefresh = {};
        return Promise.all(( itemHandles.map(treeItemHandle => this._refreshNode(treeItemHandle).then(node => {
            if (node) {
                itemsToRefresh[treeItemHandle] = node.item;
            }
        })))).then(() => ( Object.keys(itemsToRefresh)).length ? this._proxy.$refresh(this._viewId, itemsToRefresh) : undefined);
    }
    _refreshNode(treeItemHandle) {
        const extElement = this.getExtensionElement(treeItemHandle);
        if (extElement) {
            const existing = this._nodes.get(extElement);
            if (existing) {
                this._addChildrenToClear(extElement);
                return asPromise(() => this._dataProvider.getTreeItem(extElement)).then(extTreeItem => {
                    if (extTreeItem) {
                        const newNode = this._createTreeNode(extElement, extTreeItem, existing.parent);
                        this._updateNodeCache(extElement, newNode, existing, existing.parent);
                        existing.dispose();
                        return newNode;
                    }
                    return null;
                });
            }
        }
        return Promise.resolve(null);
    }
    _createAndRegisterTreeNode(element, extTreeItem, parentNode) {
        const duplicateHandle = extTreeItem.id ? `${ExtHostTreeView.ID_HANDLE_PREFIX}/${extTreeItem.id}` : undefined;
        if (duplicateHandle) {
            const existingElement = this._elements.get(duplicateHandle);
            if (existingElement) {
                const existingNode = this._nodes.get(existingElement);
                if (existingElement !== element) {
                    this._nodes.delete(existingElement);
                }
                if (existingNode) {
                    const newNode = this._createTreeNode(element, extTreeItem, parentNode);
                    this._updateNodeCache(element, newNode, existingNode, parentNode);
                    existingNode.dispose();
                    return newNode;
                }
            }
        }
        const node = this._createTreeNode(element, extTreeItem, parentNode);
        this._addNodeToCache(element, node);
        this._addNodeToParentCache(node, parentNode);
        return node;
    }
    _getTooltip(tooltip) {
        if (MarkdownString.isMarkdownString(tooltip)) {
            return MarkdownString$1.from(tooltip);
        }
        return tooltip;
    }
    _getCommand(disposable, command) {
        return command ? {
            ...this._commands.toInternal(command, disposable),
            originalId: command.command
        } : undefined;
    }
    _getCheckbox(extensionTreeItem) {
        if (extensionTreeItem.checkboxState === undefined) {
            return undefined;
        }
        let checkboxState;
        let tooltip = undefined;
        let accessibilityInformation = undefined;
        if (typeof extensionTreeItem.checkboxState === "number") {
            checkboxState = extensionTreeItem.checkboxState;
        } else {
            checkboxState = extensionTreeItem.checkboxState.state;
            tooltip = extensionTreeItem.checkboxState.tooltip;
            accessibilityInformation = extensionTreeItem.checkboxState.accessibilityInformation;
        }
        return {
            isChecked: checkboxState === TreeItemCheckboxState.Checked,
            tooltip,
            accessibilityInformation
        };
    }
    _validateTreeItem(extensionTreeItem) {
        if (!TreeItem.isTreeItem(extensionTreeItem, this._extension)) {
            throw ( new Error(
                `Extension ${this._extension.identifier.value} has provided an invalid tree item.`
            ));
        }
    }
    _createTreeNode(element, extensionTreeItem, parent) {
        this._validateTreeItem(extensionTreeItem);
        const disposableStore = this._register(( new DisposableStore()));
        const handle = this._createHandle(element, extensionTreeItem, parent);
        const icon = this._getLightIconPath(extensionTreeItem);
        const item = {
            handle,
            parentHandle: parent ? parent.item.handle : undefined,
            label: toTreeItemLabel(extensionTreeItem.label, this._extension),
            description: extensionTreeItem.description,
            resourceUri: extensionTreeItem.resourceUri,
            tooltip: this._getTooltip(extensionTreeItem.tooltip),
            command: this._getCommand(disposableStore, extensionTreeItem.command),
            contextValue: extensionTreeItem.contextValue,
            icon,
            iconDark: this._getDarkIconPath(extensionTreeItem) || icon,
            themeIcon: this._getThemeIcon(extensionTreeItem),
            collapsibleState: isUndefinedOrNull(extensionTreeItem.collapsibleState) ? TreeItemCollapsibleState.None : extensionTreeItem.collapsibleState,
            accessibilityInformation: extensionTreeItem.accessibilityInformation,
            checkbox: this._getCheckbox(extensionTreeItem)
        };
        return {
            item,
            extensionItem: extensionTreeItem,
            parent,
            children: undefined,
            disposableStore,
            dispose() {
                disposableStore.dispose();
            }
        };
    }
    _getThemeIcon(extensionTreeItem) {
        return extensionTreeItem.iconPath instanceof ThemeIcon ? extensionTreeItem.iconPath : undefined;
    }
    _createHandle(
        element,
        {
            id,
            label,
            resourceUri
        },
        parent,
        returnFirst
    ) {
        if (id) {
            return `${ExtHostTreeView.ID_HANDLE_PREFIX}/${id}`;
        }
        const treeItemLabel = toTreeItemLabel(label, this._extension);
        const prefix = parent ? parent.item.handle : ExtHostTreeView.LABEL_HANDLE_PREFIX;
        let labelValue = "";
        if (treeItemLabel) {
            if (isMarkdownString(treeItemLabel.label)) {
                labelValue = treeItemLabel.label.value;
            } else {
                labelValue = treeItemLabel.label;
            }
        }
        let elementId = labelValue || (resourceUri ? basename(resourceUri) : "");
        elementId = elementId.indexOf("/") !== -1 ? elementId.replace("/", "//") : elementId;
        const existingHandle = ( this._nodes.has(element)) ? this._nodes.get(element).item.handle : undefined;
        const childrenNodes = (this._getChildrenNodes(parent) || []);
        let handle;
        let counter = 0;
        do {
            handle = `${prefix}/${counter}:${elementId}`;
            if (returnFirst || !( this._elements.has(handle)) || existingHandle === handle) {
                break;
            }
            counter++;
        } while (counter <= childrenNodes.length);
        return handle;
    }
    _getLightIconPath(extensionTreeItem) {
        if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof ThemeIcon)) {
            if (typeof extensionTreeItem.iconPath === "string" || URI.isUri(extensionTreeItem.iconPath)) {
                return this._getIconPath(extensionTreeItem.iconPath);
            }
            return this._getIconPath(extensionTreeItem.iconPath.light);
        }
        return undefined;
    }
    _getDarkIconPath(extensionTreeItem) {
        if (extensionTreeItem.iconPath && !(extensionTreeItem.iconPath instanceof ThemeIcon) && extensionTreeItem.iconPath.dark) {
            return this._getIconPath(extensionTreeItem.iconPath.dark);
        }
        return undefined;
    }
    _getIconPath(iconPath) {
        if (URI.isUri(iconPath)) {
            return iconPath;
        }
        return URI.file(iconPath);
    }
    _addNodeToCache(element, node) {
        this._elements.set(node.item.handle, element);
        this._nodes.set(element, node);
    }
    _updateNodeCache(element, newNode, existing, parentNode) {
        this._elements.delete(newNode.item.handle);
        this._nodes.delete(element);
        if (newNode.item.handle !== existing.item.handle) {
            this._elements.delete(existing.item.handle);
        }
        this._addNodeToCache(element, newNode);
        const childrenNodes = (this._getChildrenNodes(parentNode) || []);
        const childNode = childrenNodes.filter(c => c.item.handle === existing.item.handle)[0];
        if (childNode) {
            childrenNodes.splice(childrenNodes.indexOf(childNode), 1, newNode);
        }
    }
    _addNodeToParentCache(node, parentNode) {
        if (parentNode) {
            if (!parentNode.children) {
                parentNode.children = [];
            }
            parentNode.children.push(node);
        } else {
            if (!this._roots) {
                this._roots = [];
            }
            this._roots.push(node);
        }
    }
    _addChildrenToClear(parentElement) {
        if (parentElement) {
            const node = this._nodes.get(parentElement);
            if (node) {
                if (node.children) {
                    for (const child of node.children) {
                        this._nodesToClear.add(child);
                        const childElement = this._elements.get(child.item.handle);
                        if (childElement) {
                            this._addChildrenToClear(childElement);
                            this._nodes.delete(childElement);
                            this._elements.delete(child.item.handle);
                        }
                    }
                }
                node.children = undefined;
            }
        } else {
            this._addAllToClear();
        }
    }
    _addAllToClear() {
        this._roots = undefined;
        this._nodes.forEach(node => {
            this._nodesToClear.add(node);
        });
        this._nodes.clear();
        this._elements.clear();
        this._childrenFetchTokens.clear();
    }
    _clearNodes(nodes) {
        dispose(nodes);
    }
    _clearAll() {
        this._roots = undefined;
        this._elements.clear();
        dispose(( this._nodes.values()));
        this._nodes.clear();
        dispose(this._nodesToClear);
        this._nodesToClear.clear();
        this._childrenFetchTokens.clear();
    }
    dispose() {
        super.dispose();
        this._refreshCancellationSource.dispose();
        this._clearAll();
    }
}

export { ExtHostTreeViews };
