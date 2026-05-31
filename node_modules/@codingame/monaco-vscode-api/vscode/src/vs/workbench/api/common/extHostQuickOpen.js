
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { dispose } from '../../../base/common/lifecycle.js';
import { MainContext } from './extHost.protocol.js';
import { QuickPickItemKind, InputBoxValidationSeverity, QuickInputButtons } from './extHostTypes.js';
import { isCancellationError } from '../../../base/common/errors.js';
import { coalesce } from '../../../base/common/arrays.js';
import Severity$1 from '../../../base/common/severity.js';
import { checkProposedApiEnabled } from '../../services/extensions/common/extensions.js';
import { MarkdownString, IconPath } from './extHostTypeConverters.js';

function createExtHostQuickOpen(mainContext, workspace, commands) {
    const proxy = ( mainContext.getProxy(MainContext.MainThreadQuickOpen));
    class ExtHostQuickOpenImpl {
        constructor(workspace, commands) {
            this._sessions = ( new Map());
            this._instances = 0;
            this._workspace = workspace;
            this._commands = commands;
        }
        showQuickPick(extension, itemsOrItemsPromise, options, token = CancellationToken.None) {
            this._onDidSelectItem = undefined;
            const itemsPromise = Promise.resolve(itemsOrItemsPromise);
            const instance = ++this._instances;
            const quickPickWidget = proxy.$show(instance, {
                title: options?.title,
                placeHolder: options?.placeHolder,
                prompt: options?.prompt,
                matchOnDescription: options?.matchOnDescription,
                matchOnDetail: options?.matchOnDetail,
                ignoreFocusLost: options?.ignoreFocusOut,
                canPickMany: options?.canPickMany
            }, token);
            const widgetClosedMarker = {};
            const widgetClosedPromise = quickPickWidget.then(() => widgetClosedMarker);
            return Promise.race([widgetClosedPromise, itemsPromise]).then(result => {
                if (result === widgetClosedMarker) {
                    return undefined;
                }
                return itemsPromise.then(items => {
                    const pickItems = [];
                    for (let handle = 0; handle < items.length; handle++) {
                        const item = items[handle];
                        if (typeof item === "string") {
                            pickItems.push({
                                label: item,
                                handle
                            });
                        } else if (item.kind === QuickPickItemKind.Separator) {
                            pickItems.push({
                                type: "separator",
                                label: item.label
                            });
                        } else {
                            if (item.tooltip) {
                                checkProposedApiEnabled(extension, "quickPickItemTooltip");
                            }
                            pickItems.push({
                                label: item.label,
                                iconPathDto: IconPath.from(item.iconPath),
                                description: item.description,
                                detail: item.detail,
                                picked: item.picked,
                                alwaysShow: item.alwaysShow,
                                tooltip: MarkdownString.fromStrict(item.tooltip),
                                resourceUri: item.resourceUri,
                                handle
                            });
                        }
                    }
                    if (options && typeof options.onDidSelectItem === "function") {
                        this._onDidSelectItem = handle => {
                            options.onDidSelectItem(items[handle]);
                        };
                    }
                    proxy.$setItems(instance, pickItems);
                    return quickPickWidget.then(handle => {
                        if (typeof handle === "number") {
                            return items[handle];
                        } else if (Array.isArray(handle)) {
                            return ( handle.map(h => items[h]));
                        }
                        return undefined;
                    });
                });
            }).then(undefined, err => {
                if (isCancellationError(err)) {
                    return undefined;
                }
                proxy.$setError(instance, err);
                return Promise.reject(err);
            });
        }
        $onItemSelected(handle) {
            this._onDidSelectItem?.(handle);
        }
        showInput(options, token = CancellationToken.None) {
            this._validateInput = options?.validateInput;
            return proxy.$input(options, typeof this._validateInput === "function", token).then(undefined, err => {
                if (isCancellationError(err)) {
                    return undefined;
                }
                return Promise.reject(err);
            });
        }
        async $validateInput(input) {
            if (!this._validateInput) {
                return;
            }
            const result = await this._validateInput(input);
            if (!result || typeof result === "string") {
                return result;
            }
            let severity;
            switch (result.severity) {
            case InputBoxValidationSeverity.Info:
                severity = Severity$1.Info;
                break;
            case InputBoxValidationSeverity.Warning:
                severity = Severity$1.Warning;
                break;
            case InputBoxValidationSeverity.Error:
                severity = Severity$1.Error;
                break;
            default:
                severity = result.message ? Severity$1.Error : Severity$1.Ignore;
                break;
            }
            return {
                content: result.message,
                severity
            };
        }
        async showWorkspaceFolderPick(options, token = CancellationToken.None) {
            const selectedFolder = await this._commands.executeCommand("_workbench.pickWorkspaceFolder", [options]);
            if (!selectedFolder) {
                return undefined;
            }
            const workspaceFolders = await this._workspace.getWorkspaceFolders2();
            if (!workspaceFolders) {
                return undefined;
            }
            return workspaceFolders.find(folder => ( folder.uri.toString()) === ( selectedFolder.uri.toString()));
        }
        createQuickPick(extension) {
            const session = ( new ExtHostQuickPick(extension, () => this._sessions.delete(session._id)));
            this._sessions.set(session._id, session);
            return session;
        }
        createInputBox(extension) {
            const session = ( new ExtHostInputBox(extension, () => this._sessions.delete(session._id)));
            this._sessions.set(session._id, session);
            return session;
        }
        $onDidChangeValue(sessionId, value) {
            const session = this._sessions.get(sessionId);
            session?._fireDidChangeValue(value);
        }
        $onDidAccept(sessionId) {
            const session = this._sessions.get(sessionId);
            session?._fireDidAccept();
        }
        $onDidChangeActive(sessionId, handles) {
            const session = this._sessions.get(sessionId);
            if (session instanceof ExtHostQuickPick) {
                session._fireDidChangeActive(handles);
            }
        }
        $onDidChangeSelection(sessionId, handles) {
            const session = this._sessions.get(sessionId);
            if (session instanceof ExtHostQuickPick) {
                session._fireDidChangeSelection(handles);
            }
        }
        $onDidTriggerButton(sessionId, handle, checked) {
            const session = this._sessions.get(sessionId);
            session?._fireDidTriggerButton(handle, checked);
        }
        $onDidTriggerItemButton(sessionId, itemHandle, buttonHandle, checked) {
            const session = this._sessions.get(sessionId);
            if (session instanceof ExtHostQuickPick) {
                session._fireDidTriggerItemButton(itemHandle, buttonHandle, checked);
            }
        }
        $onDidHide(sessionId) {
            const session = this._sessions.get(sessionId);
            session?._fireDidHide();
        }
    }
    class ExtHostQuickInput {
        static {
            this._nextId = 1;
        }
        constructor(_extension, _onDidDispose) {
            this._extension = _extension;
            this._onDidDispose = _onDidDispose;
            this._id = ExtHostQuickPick._nextId++;
            this._visible = false;
            this._expectingHide = false;
            this._enabled = true;
            this._busy = false;
            this._ignoreFocusOut = true;
            this._value = "";
            this._valueSelection = undefined;
            this._buttons = [];
            this._handlesToButtons = ( new Map());
            this._onDidAcceptEmitter = ( new Emitter());
            this._onDidChangeValueEmitter = ( new Emitter());
            this._onDidTriggerButtonEmitter = ( new Emitter());
            this._onDidHideEmitter = ( new Emitter());
            this._pendingUpdate = {
                id: this._id
            };
            this._disposed = false;
            this._disposables = [
                this._onDidTriggerButtonEmitter,
                this._onDidHideEmitter,
                this._onDidAcceptEmitter,
                this._onDidChangeValueEmitter
            ];
            this.onDidChangeValue = this._onDidChangeValueEmitter.event;
            this.onDidAccept = this._onDidAcceptEmitter.event;
            this.onDidTriggerButton = this._onDidTriggerButtonEmitter.event;
            this.onDidHide = this._onDidHideEmitter.event;
        }
        get title() {
            return this._title;
        }
        set title(title) {
            this._title = title;
            this.update({
                title
            });
        }
        get step() {
            return this._steps;
        }
        set step(step) {
            this._steps = step;
            this.update({
                step
            });
        }
        get totalSteps() {
            return this._totalSteps;
        }
        set totalSteps(totalSteps) {
            this._totalSteps = totalSteps;
            this.update({
                totalSteps
            });
        }
        get enabled() {
            return this._enabled;
        }
        set enabled(enabled) {
            this._enabled = enabled;
            this.update({
                enabled
            });
        }
        get busy() {
            return this._busy;
        }
        set busy(busy) {
            this._busy = busy;
            this.update({
                busy
            });
        }
        get ignoreFocusOut() {
            return this._ignoreFocusOut;
        }
        set ignoreFocusOut(ignoreFocusOut) {
            this._ignoreFocusOut = ignoreFocusOut;
            this.update({
                ignoreFocusOut
            });
        }
        get value() {
            return this._value;
        }
        set value(value) {
            this._value = value;
            this.update({
                value
            });
        }
        get valueSelection() {
            return this._valueSelection;
        }
        set valueSelection(valueSelection) {
            this._valueSelection = valueSelection;
            this.update({
                valueSelection
            });
        }
        get placeholder() {
            return this._placeholder;
        }
        set placeholder(placeholder) {
            this._placeholder = placeholder;
            this.update({
                placeholder
            });
        }
        get buttons() {
            return this._buttons;
        }
        set buttons(buttons) {
            this._buttons = buttons.slice();
            this._handlesToButtons.clear();
            buttons.forEach((button, i) => {
                const handle = button === QuickInputButtons.Back ? -1 : i;
                this._handlesToButtons.set(handle, button);
            });
            this.update({
                buttons: ( buttons.map((button, i) => {
                    return {
                        iconPathDto: IconPath.from(button.iconPath),
                        tooltip: button.tooltip,
                        handle: button === QuickInputButtons.Back ? -1 : i,
                        location: typeof button.location === "number" ? button.location : undefined,
                        toggle: typeof button.toggle === "object" && typeof button.toggle.checked === "boolean" ? {
                            checked: button.toggle.checked
                        } : undefined
                    };
                }))
            });
        }
        show() {
            this._visible = true;
            this._expectingHide = true;
            this.update({
                visible: true
            });
        }
        hide() {
            this._visible = false;
            this.update({
                visible: false
            });
        }
        _fireDidAccept() {
            this._onDidAcceptEmitter.fire();
        }
        _fireDidChangeValue(value) {
            this._value = value;
            this._onDidChangeValueEmitter.fire(value);
        }
        _fireDidTriggerButton(handle, checked) {
            const button = this._handlesToButtons.get(handle);
            if (button) {
                if (checked !== undefined && button.toggle) {
                    button.toggle.checked = checked;
                }
                this._onDidTriggerButtonEmitter.fire(button);
            }
        }
        _fireDidHide() {
            if (this._expectingHide) {
                this._expectingHide = this._visible;
                this._onDidHideEmitter.fire();
            }
        }
        dispose() {
            if (this._disposed) {
                return;
            }
            this._disposed = true;
            this._fireDidHide();
            this._disposables = dispose(this._disposables);
            if (this._updateTimeout) {
                clearTimeout(this._updateTimeout);
                this._updateTimeout = undefined;
            }
            this._onDidDispose();
            proxy.$dispose(this._id);
        }
        update(properties) {
            if (this._disposed) {
                return;
            }
            for (const key of ( Object.keys(properties))) {
                const value = properties[key];
                this._pendingUpdate[key] = value === undefined ? null : value;
            }
            if ("visible" in this._pendingUpdate) {
                if (this._updateTimeout) {
                    clearTimeout(this._updateTimeout);
                    this._updateTimeout = undefined;
                }
                this.dispatchUpdate();
            } else if (this._visible && !this._updateTimeout) {
                this._updateTimeout = setTimeout(() => {
                    this._updateTimeout = undefined;
                    this.dispatchUpdate();
                }, 0);
            }
        }
        dispatchUpdate() {
            proxy.$createOrUpdate(this._pendingUpdate);
            this._pendingUpdate = {
                id: this._id
            };
        }
    }
    class ExtHostQuickPick extends ExtHostQuickInput {
        constructor(extension, onDispose) {
            super(extension, onDispose);
            this._items = [];
            this._handlesToItems = ( new Map());
            this._itemsToHandles = ( new Map());
            this._canSelectMany = false;
            this._matchOnDescription = true;
            this._matchOnDetail = true;
            this._sortByLabel = true;
            this._keepScrollPosition = false;
            this._activeItems = [];
            this._onDidChangeActiveEmitter = ( new Emitter());
            this._selectedItems = [];
            this._onDidChangeSelectionEmitter = ( new Emitter());
            this._onDidTriggerItemButtonEmitter = ( new Emitter());
            this.onDidChangeActive = this._onDidChangeActiveEmitter.event;
            this.onDidChangeSelection = this._onDidChangeSelectionEmitter.event;
            this.onDidTriggerItemButton = this._onDidTriggerItemButtonEmitter.event;
            this._disposables.push(
                this._onDidChangeActiveEmitter,
                this._onDidChangeSelectionEmitter,
                this._onDidTriggerItemButtonEmitter
            );
            this.update({
                type: "quickPick"
            });
        }
        get items() {
            return this._items;
        }
        set items(items) {
            this._items = items.slice();
            this._handlesToItems.clear();
            this._itemsToHandles.clear();
            items.forEach((item, i) => {
                this._handlesToItems.set(i, item);
                this._itemsToHandles.set(item, i);
            });
            const pickItems = [];
            for (let handle = 0; handle < items.length; handle++) {
                const item = items[handle];
                if (item.kind === QuickPickItemKind.Separator) {
                    pickItems.push({
                        type: "separator",
                        label: item.label
                    });
                } else {
                    if (item.tooltip) {
                        checkProposedApiEnabled(this._extension, "quickPickItemTooltip");
                    }
                    pickItems.push({
                        handle,
                        label: item.label,
                        iconPathDto: IconPath.from(item.iconPath),
                        description: item.description,
                        detail: item.detail,
                        picked: item.picked,
                        alwaysShow: item.alwaysShow,
                        tooltip: MarkdownString.fromStrict(item.tooltip),
                        resourceUri: item.resourceUri,
                        buttons: item.buttons?.map((button, i) => {
                            return {
                                iconPathDto: IconPath.from(button.iconPath),
                                tooltip: button.tooltip,
                                handle: i,
                                toggle: typeof button.toggle === "object" && typeof button.toggle.checked === "boolean" ? {
                                    checked: button.toggle.checked
                                } : undefined
                            };
                        })
                    });
                }
            }
            this.update({
                items: pickItems
            });
        }
        get canSelectMany() {
            return this._canSelectMany;
        }
        set canSelectMany(canSelectMany) {
            this._canSelectMany = canSelectMany;
            this.update({
                canSelectMany
            });
        }
        get matchOnDescription() {
            return this._matchOnDescription;
        }
        set matchOnDescription(matchOnDescription) {
            this._matchOnDescription = matchOnDescription;
            this.update({
                matchOnDescription
            });
        }
        get matchOnDetail() {
            return this._matchOnDetail;
        }
        set matchOnDetail(matchOnDetail) {
            this._matchOnDetail = matchOnDetail;
            this.update({
                matchOnDetail
            });
        }
        get sortByLabel() {
            return this._sortByLabel;
        }
        set sortByLabel(sortByLabel) {
            this._sortByLabel = sortByLabel;
            this.update({
                sortByLabel
            });
        }
        get keepScrollPosition() {
            return this._keepScrollPosition;
        }
        set keepScrollPosition(keepScrollPosition) {
            this._keepScrollPosition = keepScrollPosition;
            this.update({
                keepScrollPosition
            });
        }
        get prompt() {
            return this._prompt;
        }
        set prompt(prompt) {
            this._prompt = prompt;
            this.update({
                prompt
            });
        }
        get activeItems() {
            return this._activeItems;
        }
        set activeItems(activeItems) {
            this._activeItems = activeItems.filter(item => ( this._itemsToHandles.has(item)));
            this.update({
                activeItems: ( this._activeItems.map(item => this._itemsToHandles.get(item)))
            });
        }
        get selectedItems() {
            return this._selectedItems;
        }
        set selectedItems(selectedItems) {
            this._selectedItems = selectedItems.filter(item => ( this._itemsToHandles.has(item)));
            this.update({
                selectedItems: ( this._selectedItems.map(item => this._itemsToHandles.get(item)))
            });
        }
        _fireDidChangeActive(handles) {
            const items = coalesce(( handles.map(handle => this._handlesToItems.get(handle))));
            this._activeItems = items;
            this._onDidChangeActiveEmitter.fire(items);
        }
        _fireDidChangeSelection(handles) {
            const items = coalesce(( handles.map(handle => this._handlesToItems.get(handle))));
            this._selectedItems = items;
            this._onDidChangeSelectionEmitter.fire(items);
        }
        _fireDidTriggerItemButton(itemHandle, buttonHandle, checked) {
            const item = this._handlesToItems.get(itemHandle);
            if (!item || !item.buttons || !item.buttons.length) {
                return;
            }
            const button = item.buttons[buttonHandle];
            if (button) {
                if (checked !== undefined && button.toggle) {
                    button.toggle.checked = checked;
                }
                this._onDidTriggerItemButtonEmitter.fire({
                    button,
                    item
                });
            }
        }
    }
    class ExtHostInputBox extends ExtHostQuickInput {
        constructor(extension, onDispose) {
            super(extension, onDispose);
            this._password = false;
            this.update({
                type: "inputBox"
            });
        }
        get password() {
            return this._password;
        }
        set password(password) {
            this._password = password;
            this.update({
                password
            });
        }
        get prompt() {
            return this._prompt;
        }
        set prompt(prompt) {
            this._prompt = prompt;
            this.update({
                prompt
            });
        }
        get validationMessage() {
            return this._validationMessage;
        }
        set validationMessage(validationMessage) {
            this._validationMessage = validationMessage;
            if (!validationMessage) {
                this.update({
                    validationMessage: undefined,
                    severity: Severity$1.Ignore
                });
            } else if (typeof validationMessage === "string") {
                this.update({
                    validationMessage,
                    severity: Severity$1.Error
                });
            } else {
                this.update({
                    validationMessage: validationMessage.message,
                    severity: validationMessage.severity ?? Severity$1.Error
                });
            }
        }
    }
    return ( new ExtHostQuickOpenImpl(workspace, commands));
}

export { createExtHostQuickOpen };
