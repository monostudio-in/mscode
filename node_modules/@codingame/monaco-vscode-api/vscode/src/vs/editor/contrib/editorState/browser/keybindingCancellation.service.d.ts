import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
export declare const IEditorCancellationTokens: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorCancellationTokens>;
export interface IEditorCancellationTokens {
    readonly _serviceBrand: undefined;
    add(editor: ICodeEditor, cts: CancellationTokenSource): () => void;
    cancel(editor: ICodeEditor): void;
}
