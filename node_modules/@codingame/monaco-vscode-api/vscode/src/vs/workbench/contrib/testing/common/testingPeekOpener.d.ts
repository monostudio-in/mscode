import { ITextEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IEditor } from "../../../../editor/common/editorCommon.js";
export interface IShowResultOptions {
    /** Reveal the peek, if configured, in the given editor */
    inEditor?: IEditor;
    /** Editor options, if a new editor is opened */
    options?: Partial<ITextEditorOptions>;
}
