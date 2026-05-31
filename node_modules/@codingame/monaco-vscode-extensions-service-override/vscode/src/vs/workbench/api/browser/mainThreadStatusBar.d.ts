import { MainThreadStatusBarShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { ThemeColor } from "@codingame/monaco-vscode-api/vscode/vs/base/common/themables";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { Command } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages";
import { IAccessibilityInformation } from "@codingame/monaco-vscode-api/vscode/vs/platform/accessibility/common/accessibility";
import { IMarkdownString } from "@codingame/monaco-vscode-api/vscode/vs/base/common/htmlContent";
import { IExtensionStatusBarItemService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/browser/statusBarService";
export declare class MainThreadStatusBar extends Disposable implements MainThreadStatusBarShape {
    private readonly statusbarService;
    private readonly _proxy;
    private readonly _entryDisposables;
    constructor(extHostContext: IExtHostContext, statusbarService: IExtensionStatusBarItemService);
    $setEntry(entryId: string, id: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined, hasTooltipProvider: boolean, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): void;
    $disposeEntry(entryId: string): void;
}
