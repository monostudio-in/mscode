import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { MainThreadDecorationsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IDecorationsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/decorations/common/decorations.service";
export declare class MainThreadDecorations implements MainThreadDecorationsShape {
    private readonly _decorationsService;
    private readonly _provider;
    private readonly _proxy;
    constructor(context: IExtHostContext, _decorationsService: IDecorationsService);
    dispose(): void;
    $registerDecorationProvider(handle: number, label: string): void;
    $onDidChange(handle: number, resources: UriComponents[]): void;
    $unregisterDecorationProvider(handle: number): void;
}
