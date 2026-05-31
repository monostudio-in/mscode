import { CancellationToken } from "../../../../base/common/cancellation.js";
import { CountTokensCallback, IToolData, IToolImpl, IToolInvocation, IToolResult, ToolProgress } from "../../chat/common/tools/languageModelToolsService.js";
import { IExtensionsWorkbenchService } from "./extensions.service.js";
export declare const SearchExtensionsToolId = "vscode_searchExtensions_internal";
export declare const SearchExtensionsToolData: IToolData;
export declare class SearchExtensionsTool implements IToolImpl {
    private readonly extensionWorkbenchService;
    constructor(extensionWorkbenchService: IExtensionsWorkbenchService);
    invoke(invocation: IToolInvocation, _countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
