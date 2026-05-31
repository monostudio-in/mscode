import { IExtensionDescription } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { IWorkbenchEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service";
export declare class ExtensionsProposedApi {
    private readonly _logService;
    private readonly _environmentService;
    private readonly _envEnablesProposedApiForAll;
    private readonly _envEnabledExtensions;
    private readonly _productEnabledExtensions;
    constructor(_logService: ILogService, _environmentService: IWorkbenchEnvironmentService, productService: IProductService);
    updateEnabledApiProposals(extensions: IExtensionDescription[]): void;
    private doUpdateEnabledApiProposals;
}
