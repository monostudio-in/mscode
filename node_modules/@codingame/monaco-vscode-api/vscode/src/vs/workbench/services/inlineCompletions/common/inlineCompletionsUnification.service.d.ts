import { Event } from "../../../../base/common/event.js";
import { IInlineCompletionsUnificationState } from "@codingame/monaco-vscode-base-service-override/vscode/vs/workbench/services/inlineCompletions/common/inlineCompletionsUnification";
export declare const IInlineCompletionsUnificationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IInlineCompletionsUnificationService>;
export interface IInlineCompletionsUnificationService {
    readonly _serviceBrand: undefined;
    readonly state: IInlineCompletionsUnificationState;
    readonly onDidStateChange: Event<void>;
}
