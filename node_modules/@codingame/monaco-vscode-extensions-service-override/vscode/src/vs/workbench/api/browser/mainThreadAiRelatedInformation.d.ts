import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { MainThreadAiRelatedInformationShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { RelatedInformationType } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHostTypes";
import { RelatedInformationResult } from "@codingame/monaco-vscode-quickaccess-service-override/vscode/vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation";
import { IAiRelatedInformationService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadAiRelatedInformation extends Disposable implements MainThreadAiRelatedInformationShape {
    private readonly _aiRelatedInformationService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _aiRelatedInformationService: IAiRelatedInformationService);
    $getAiRelatedInformation(query: string, types: RelatedInformationType[]): Promise<RelatedInformationResult[]>;
    $registerAiRelatedInformationProvider(handle: number, type: RelatedInformationType): void;
    $unregisterAiRelatedInformationProvider(handle: number): void;
}
