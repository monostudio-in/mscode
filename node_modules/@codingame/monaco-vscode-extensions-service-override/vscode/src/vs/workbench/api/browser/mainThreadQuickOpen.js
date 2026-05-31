
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Lazy } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lazy';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { basenameOrAuthority, dirname, hasTrailingPathSeparator } from '@codingame/monaco-vscode-api/vscode/vs/base/common/resources';
import { ThemeIcon } from '@codingame/monaco-vscode-api/vscode/vs/base/common/themables';
import { URI, isUriComponents } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ILanguageService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/languages/language.service';
import { getIconClasses } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/getIconClasses';
import { IModelService } from '@codingame/monaco-vscode-api/vscode/vs/editor/common/services/model.service';
import { FileKind } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files';
import { ILabelService } from '@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service';
import { IQuickInputService } from '@codingame/monaco-vscode-api/vscode/vs/platform/quickinput/common/quickInput.service';
import { ICustomEditorLabelService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/customEditorLabelService.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

let MainThreadQuickOpen = class MainThreadQuickOpen {
    constructor(
        extHostContext,
        quickInputService,
        labelService,
        customEditorLabelService,
        modelService,
        languageService
    ) {
        this.labelService = labelService;
        this.customEditorLabelService = customEditorLabelService;
        this.modelService = modelService;
        this.languageService = languageService;
        this._items = {};
        this.sessions = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostQuickOpen));
        this._quickInputService = quickInputService;
    }
    dispose() {
        for (const [_id, session] of this.sessions) {
            session.store.dispose();
        }
    }
    $show(instance, options, token) {
        const contents = ( new Promise((resolve, reject) => {
            this._items[instance] = {
                resolve,
                reject
            };
        }));
        options = {
            ...options,
            onDidFocus: el => {
                if (el) {
                    this._proxy.$onItemSelected(el.handle);
                }
            }
        };
        if (options.canPickMany) {
            return this._quickInputService.pick(contents, options, token).then(items => {
                if (items) {
                    return ( items.map(item => item.handle));
                }
                return undefined;
            });
        } else {
            return this._quickInputService.pick(contents, options, token).then(item => {
                if (item) {
                    return item.handle;
                }
                return undefined;
            });
        }
    }
    $setItems(instance, items) {
        if (this._items[instance]) {
            items.forEach(item => this.expandItemProps(item));
            this._items[instance].resolve(items);
            delete this._items[instance];
        }
        return Promise.resolve();
    }
    $setError(instance, error) {
        if (this._items[instance]) {
            this._items[instance].reject(error);
            delete this._items[instance];
        }
        return Promise.resolve();
    }
    $input(options, validateInput, token) {
        const inputOptions = Object.create(null);
        if (options) {
            inputOptions.title = options.title;
            inputOptions.password = options.password;
            inputOptions.placeHolder = options.placeHolder;
            inputOptions.valueSelection = options.valueSelection;
            inputOptions.prompt = options.prompt;
            inputOptions.value = options.value;
            inputOptions.ignoreFocusLost = options.ignoreFocusOut;
        }
        if (validateInput) {
            inputOptions.validateInput = value => {
                return this._proxy.$validateInput(value);
            };
        }
        return this._quickInputService.input(inputOptions, token);
    }
    $createOrUpdate(params) {
        const sessionId = params.id;
        let session = this.sessions.get(sessionId);
        if (!session) {
            const store = ( new DisposableStore());
            const input = params.type === "quickPick" ? this._quickInputService.createQuickPick() : this._quickInputService.createInputBox();
            store.add(input);
            store.add(input.onDidAccept(() => {
                this._proxy.$onDidAccept(sessionId);
            }));
            store.add(input.onDidTriggerButton(button => {
                this._proxy.$onDidTriggerButton(sessionId, button.handle, button.toggle?.checked);
            }));
            store.add(input.onDidChangeValue(value => {
                this._proxy.$onDidChangeValue(sessionId, value);
            }));
            store.add(input.onDidHide(() => {
                this._proxy.$onDidHide(sessionId);
            }));
            if (params.type === "quickPick") {
                const quickPick = input;
                store.add(quickPick.onDidChangeActive(items => {
                    this._proxy.$onDidChangeActive(sessionId, ( items.map(item => item.handle)));
                }));
                store.add(quickPick.onDidChangeSelection(items => {
                    this._proxy.$onDidChangeSelection(sessionId, ( items.map(item => item.handle)));
                }));
                store.add(quickPick.onDidTriggerItemButton(e => {
                    const transferButton = e.button;
                    this._proxy.$onDidTriggerItemButton(
                        sessionId,
                        e.item.handle,
                        transferButton.handle,
                        transferButton.toggle?.checked
                    );
                }));
            }
            session = {
                input,
                handlesToItems: ( new Map()),
                store
            };
            this.sessions.set(sessionId, session);
        }
        const {
            input,
            handlesToItems
        } = session;
        const quickPick = input;
        for (const param in params) {
            switch (param) {
            case "id":
            case "type":
                continue;
            case "visible":
                if (params.visible) {
                    input.show();
                } else {
                    input.hide();
                }
                break;
            case "items":
                {
                    handlesToItems.clear();
                    params.items?.forEach(item => {
                        this.expandItemProps(item);
                        if (item.type !== "separator") {
                            item.buttons?.forEach(button => this.expandIconPath(button));
                            handlesToItems.set(item.handle, item);
                        }
                    });
                    quickPick.items = params.items;
                    break;
                }
            case "activeItems":
                quickPick.activeItems = params.activeItems?.map(handle => handlesToItems.get(handle)).filter(Boolean);
                break;
            case "selectedItems":
                quickPick.selectedItems = params.selectedItems?.map(handle => handlesToItems.get(handle)).filter(Boolean);
                break;
            case "buttons":
                {
                    const buttons = [];
                    for (const button of params.buttons) {
                        if (button.handle === -1) {
                            buttons.push(this._quickInputService.backButton);
                        } else {
                            this.expandIconPath(button);
                            buttons.push(button);
                        }
                    }
                    input.buttons = buttons;
                    break;
                }
            default:
                input[param] = params[param];
                break;
            }
        }
        return Promise.resolve(undefined);
    }
    $dispose(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.store.dispose();
            this.sessions.delete(sessionId);
        }
        return Promise.resolve(undefined);
    }
    expandItemProps(item) {
        if (item.type === "separator") {
            return;
        }
        if (!item.resourceUri) {
            this.expandIconPath(item);
            return;
        }
        const resourceUri = ( URI.from(item.resourceUri));
        item.label ??= this.customEditorLabelService.getName(resourceUri) || "";
        if (item.label) {
            item.description ??= this.labelService.getUriLabel(resourceUri, {
                relative: true
            });
        } else {
            item.label = basenameOrAuthority(resourceUri);
            item.description ??= this.labelService.getUriLabel(dirname(resourceUri), {
                relative: true
            });
        }
        const icon = item.iconPathDto;
        if (ThemeIcon.isThemeIcon(icon) && (ThemeIcon.isFile(icon) || ThemeIcon.isFolder(icon))) {
            const fileKind = ThemeIcon.isFolder(icon) || hasTrailingPathSeparator(resourceUri) ? FileKind.FOLDER : FileKind.FILE;
            const iconClasses = ( new Lazy(
                () => getIconClasses(this.modelService, this.languageService, resourceUri, fileKind)
            ));
            Object.defineProperty(item, "iconClasses", {
                get: () => iconClasses.value
            });
        } else {
            this.expandIconPath(item);
        }
    }
    expandIconPath(target) {
        const icon = target.iconPathDto;
        if (!icon) {
            return;
        } else if (ThemeIcon.isThemeIcon(icon)) {
            target.iconClass = ThemeIcon.asClassName(icon);
        } else if (isUriComponents(icon)) {
            const uri = ( URI.from(icon));
            target.iconPath = {
                dark: uri,
                light: uri
            };
        } else {
            const {
                dark,
                light
            } = icon;
            target.iconPath = {
                dark: ( URI.from(dark)),
                light: ( URI.from(light))
            };
        }
    }
};
MainThreadQuickOpen = __decorate([extHostNamedCustomer(MainContext.MainThreadQuickOpen), ( __param(1, IQuickInputService)), ( __param(2, ILabelService)), ( __param(3, ICustomEditorLabelService)), ( __param(4, IModelService)), ( __param(5, ILanguageService))], MainThreadQuickOpen);

export { MainThreadQuickOpen };
