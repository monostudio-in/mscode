import { ICodeEditor } from "../editorBrowser.js";
import { ITextResourceEditorInput } from "../../../platform/editor/common/editor.js";
export interface ICodeEditorOpenHandler {
    (input: ITextResourceEditorInput, source: ICodeEditor | null, sideBySide?: boolean): Promise<ICodeEditor | null>;
}
