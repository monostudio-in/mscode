
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { createElement, getWindow } from '@codingame/monaco-vscode-api/vscode/vs/base/browser/dom';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { isEqual } from '@codingame/monaco-vscode-api/vscode/vs/base/common/resources';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { ICodeEditorService } from '@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/codeEditorService.service';
import { reviveWebviewContentOptions } from './mainThreadWebviews.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IWebviewService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webview/browser/webview.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';

class EditorWebviewZone {
    constructor(editor, line, height, webview) {
        this.editor = editor;
        this.line = line;
        this.height = height;
        this.webview = webview;
        this.domNode = createElement("div");
        this.domNode.style.zIndex = "10";
        this.afterLineNumber = line;
        this.afterColumn = 1;
        this.heightInLines = height;
        editor.changeViewZones(accessor => this._id = accessor.addZone(this));
        webview.mountTo(this.domNode, getWindow(editor.getDomNode()));
    }
    dispose() {
        this.editor.changeViewZones(accessor => this._id && accessor.removeZone(this._id));
    }
}
let MainThreadEditorInsets = class MainThreadEditorInsets {
    constructor(context, _editorService, _webviewService) {
        this._editorService = _editorService;
        this._webviewService = _webviewService;
        this._disposables = ( new DisposableStore());
        this._insets = ( new Map());
        this._proxy = ( context.getProxy(ExtHostContext.ExtHostEditorInsets));
    }
    dispose() {
        this._disposables.dispose();
    }
    async $createEditorInset(handle, id, uri, line, height, options, extensionId, extensionLocation) {
        let editor;
        id = id.substr(0, id.indexOf(","));
        for (const candidate of this._editorService.listCodeEditors()) {
            if (candidate.getId() === id && candidate.hasModel() && isEqual(candidate.getModel().uri, URI.revive(uri))) {
                editor = candidate;
                break;
            }
        }
        if (!editor) {
            setTimeout(() => this._proxy.$onDidDispose(handle));
            return;
        }
        const disposables = ( new DisposableStore());
        const webview = this._webviewService.createWebviewElement({
            title: undefined,
            options: {
                enableFindWidget: false
            },
            contentOptions: reviveWebviewContentOptions(options),
            extension: {
                id: extensionId,
                location: URI.revive(extensionLocation)
            }
        });
        const webviewZone = ( new EditorWebviewZone(editor, line, height, webview));
        const remove = () => {
            disposables.dispose();
            this._proxy.$onDidDispose(handle);
            this._insets.delete(handle);
        };
        disposables.add(editor.onDidChangeModel(remove));
        disposables.add(editor.onDidDispose(remove));
        disposables.add(webviewZone);
        disposables.add(webview);
        disposables.add(
            webview.onMessage(msg => this._proxy.$onDidReceiveMessage(handle, msg.message))
        );
        this._insets.set(handle, webviewZone);
    }
    $disposeEditorInset(handle) {
        const inset = this.getInset(handle);
        this._insets.delete(handle);
        inset.dispose();
    }
    $setHtml(handle, value) {
        const inset = this.getInset(handle);
        inset.webview.setHtml(value);
    }
    $setOptions(handle, options) {
        const inset = this.getInset(handle);
        inset.webview.contentOptions = reviveWebviewContentOptions(options);
    }
    async $postMessage(handle, value) {
        const inset = this.getInset(handle);
        inset.webview.postMessage(value);
        return true;
    }
    getInset(handle) {
        const inset = this._insets.get(handle);
        if (!inset) {
            throw ( new Error("Unknown inset"));
        }
        return inset;
    }
};
MainThreadEditorInsets = __decorate([extHostNamedCustomer(MainContext.MainThreadEditorInsets), ( __param(1, ICodeEditorService)), ( __param(2, IWebviewService))], MainThreadEditorInsets);

export { MainThreadEditorInsets };
