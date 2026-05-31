import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { IObservable } from "../../../../../base/common/observable.js";
import { URI } from "../../../../../base/common/uri.js";
import { IExplanationState, IExplanationDiffInfo, IExplanationGenerationHandle } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/browser/chatEditing/chatEditingExplanationModelManager";
export declare const IChatEditingExplanationModelManager: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatEditingExplanationModelManager>;
export interface IChatEditingExplanationModelManager {
    readonly _serviceBrand: undefined;
    /**
    * Observable map from URI to explanation state.
    * When a URI has state, explanations are shown. When removed, they are hidden.
    * UI code can use autorun or derived to react to state changes.
    */
    readonly state: IObservable<ResourceMap<IExplanationState>>;
    /**
    * Generates explanations for the given diff infos using a single LLM request.
    * This allows the model to understand the complete change across files.
    * Returns a disposable handle for lifecycle management.
    * The generation can be cancelled by disposing the handle or via the cancellation token.
    * Disposing the handle also removes the explanations from the state.
    *
    * State is updated per-file as explanations are parsed from the response.
    *
    * @param diffInfos Array of diff info objects, one per file
    * @param chatSessionResource Chat session resource for follow-up actions
    * @param token Cancellation token for external cancellation control
    * @returns A handle with disposal and completion tracking
    */
    generateExplanations(diffInfos: readonly IExplanationDiffInfo[], chatSessionResource: URI | undefined, token: CancellationToken): IExplanationGenerationHandle;
}
