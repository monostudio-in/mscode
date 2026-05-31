import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { ICodeEditorService } from "@codingame/monaco-vscode-api/vscode/vs/editor/browser/services/codeEditorService.service";
import { ExtensionIdentifier } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { IWebviewContentOptions, MainThreadEditorInsetsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IWebviewService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/webview/browser/webview.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadEditorInsets implements MainThreadEditorInsetsShape {
    private readonly _editorService;
    private readonly _webviewService;
    private readonly _proxy;
    private readonly _disposables;
    private readonly _insets;
    constructor(context: IExtHostContext, _editorService: ICodeEditorService, _webviewService: IWebviewService);
    dispose(): void;
    $createEditorInset(handle: number, id: string, uri: UriComponents, line: number, height: number, options: IWebviewContentOptions, extensionId: ExtensionIdentifier, extensionLocation: UriComponents): Promise<void>;
    $disposeEditorInset(handle: number): void;
    $setHtml(handle: number, value: string): void;
    $setOptions(handle: number, options: IWebviewContentOptions): void;
    $postMessage(handle: number, value: unknown): Promise<boolean>;
    private getInset;
}
