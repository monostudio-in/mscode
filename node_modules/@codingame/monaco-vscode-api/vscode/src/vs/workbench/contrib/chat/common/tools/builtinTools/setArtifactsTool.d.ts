import { CancellationToken } from "../../../../../../base/common/cancellation.js";
import { IFileService } from "../../../../../../platform/files/common/files.service.js";
import { IToolData, IToolImpl, IToolInvocation, IToolResult, IToolInvocationPreparationContext, IPreparedToolInvocation } from "../languageModelToolsService.js";
import { IChatArtifactsService } from "../chatArtifactsService.service.js";
import { IChatService } from "../../chatService/chatService.service.js";
export declare const SetArtifactsToolId = "setArtifacts";
export declare const SetArtifactsToolData: IToolData;
export declare class SetArtifactsTool implements IToolImpl {
    private readonly _chatArtifactsService;
    private readonly _fileService;
    private readonly _chatService;
    constructor(_chatArtifactsService: IChatArtifactsService, _fileService: IFileService, _chatService: IChatService);
    prepareToolInvocation(_context: IToolInvocationPreparationContext, _token: CancellationToken): Promise<IPreparedToolInvocation | undefined>;
    invoke(invocation: IToolInvocation, _countTokens: never, _progress: never, _token: CancellationToken): Promise<IToolResult>;
    private _resolveSubagentName;
}
