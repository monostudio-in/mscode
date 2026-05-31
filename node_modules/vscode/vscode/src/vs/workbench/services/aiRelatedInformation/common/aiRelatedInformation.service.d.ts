import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { RelatedInformationType, RelatedInformationResult, IAiRelatedInformationProvider } from "@codingame/monaco-vscode-quickaccess-service-override/vscode/vs/workbench/services/aiRelatedInformation/common/aiRelatedInformation";
export declare const IAiRelatedInformationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IAiRelatedInformationService>;
export interface IAiRelatedInformationService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    getRelatedInformation(query: string, types: RelatedInformationType[], token: CancellationToken): Promise<RelatedInformationResult[]>;
    registerAiRelatedInformationProvider(type: RelatedInformationType, provider: IAiRelatedInformationProvider): IDisposable;
}
