import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { UriComponents } from "../../../../../../base/common/uri.js";
import { INotebookService } from "../../../../notebook/common/notebookService.service.js";
import { ICodeMapperService } from "../../editing/chatCodeMapperService.service.js";
import { IChatService } from "../../chatService/chatService.service.js";
import { CountTokensCallback, IPreparedToolInvocation, IToolData, IToolImpl, IToolInvocation, IToolInvocationPreparationContext, IToolResult, ToolProgress } from "../languageModelToolsService.js";
export declare const ExtensionEditToolId = "vscode_editFile";
export declare const InternalEditToolId = "vscode_editFile_internal";
export declare const EditToolData: IToolData;
export interface EditToolParams {
    uri: UriComponents;
    explanation: string;
    code: string;
}
export declare class EditTool implements IToolImpl {
    private readonly chatService;
    private readonly codeMapperService;
    private readonly notebookService;
    constructor(chatService: IChatService, codeMapperService: ICodeMapperService, notebookService: INotebookService);
    invoke(invocation: IToolInvocation, countTokens: CountTokensCallback, _progress: ToolProgress, token: CancellationToken): Promise<IToolResult>;
    prepareToolInvocation(context: IToolInvocationPreparationContext, token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
}
