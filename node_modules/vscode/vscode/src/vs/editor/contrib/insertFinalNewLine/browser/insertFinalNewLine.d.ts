import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
export declare class InsertFinalNewLineAction extends EditorAction {
    static readonly ID = "editor.action.insertFinalNewLine";
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: unknown): void;
}
