import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from "../languageModelToolsService.js";
export declare const ConfirmationToolId = "vscode_get_confirmation";
export declare const ConfirmationToolWithOptionsId = "vscode_get_confirmation_with_options";
export declare const ModifiedFilesConfirmationToolId = "vscode_get_modified_files_confirmation";
export declare const ConfirmationToolData: IToolData;
export declare const ConfirmationToolWithOptionsData: IToolData;
export declare const ModifiedFilesConfirmationToolData: IToolData;
export interface IConfirmationToolParams {
    title: string;
    message: string;
    confirmationType?: "basic" | "terminal";
    terminalCommand?: string;
    buttons?: string[];
}
export interface IModifiedFilesConfirmationToolParams {
    title: string;
    message: string;
    options: string[];
    modifiedFiles: {
        uri: string;
        originalUri?: string;
        insertions?: number;
        deletions?: number;
        title?: string;
        description?: string;
    }[];
}
export declare class ConfirmationTool implements IToolImpl {
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
export declare class ModifiedFilesConfirmationTool implements IToolImpl {
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
}
