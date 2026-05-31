import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../browser/editorExtensions.js";
interface ExpandLinesSelectionArgs {
    source?: string;
}
export declare class ExpandLineSelectionAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: ExpandLinesSelectionArgs): void;
}
export {};
