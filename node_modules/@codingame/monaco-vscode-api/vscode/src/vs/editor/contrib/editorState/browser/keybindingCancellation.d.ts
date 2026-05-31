import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { CancellationTokenSource, CancellationToken } from "../../../../base/common/cancellation.js";
import { IEditorCancellationTokens } from "./keybindingCancellation.service.js";
export declare class EditorCancellationTokens implements IEditorCancellationTokens {
    readonly _serviceBrand: undefined;
    private readonly _tokens;
    add(editor: ICodeEditor, cts: CancellationTokenSource): () => void;
    cancel(editor: ICodeEditor): void;
}
export declare class EditorKeybindingCancellationTokenSource extends CancellationTokenSource {
    readonly editor: ICodeEditor;
    private readonly _unregister;
    constructor(editor: ICodeEditor, parent?: CancellationToken);
    dispose(): void;
}
