import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
export declare class MiddleScrollController extends Disposable implements IEditorContribution {
    private readonly _editor;
    static readonly ID = "editor.contrib.middleScroll";
    static get(editor: ICodeEditor): MiddleScrollController | null;
    constructor(_editor: ICodeEditor);
}
