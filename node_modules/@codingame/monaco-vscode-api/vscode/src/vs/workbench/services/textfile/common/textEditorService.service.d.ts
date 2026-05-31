import { IUntypedEditorInput, IUntypedFileEditorInput, IFileEditorInput } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
export declare const ITextEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITextEditorService>;
export interface ITextEditorService {
    readonly _serviceBrand: undefined;
    /**
    * @deprecated this method should not be used, rather consider using
    * `IEditorResolverService` instead with `DEFAULT_EDITOR_ASSOCIATION.id`.
    */
    createTextEditor(input: IUntypedEditorInput): EditorInput;
    /**
    * @deprecated this method should not be used, rather consider using
    * `IEditorResolverService` instead with `DEFAULT_EDITOR_ASSOCIATION.id`.
    */
    createTextEditor(input: IUntypedFileEditorInput): IFileEditorInput;
    /**
    * A way to create text editor inputs from an untyped editor input. Depending
    * on the passed in input this will be:
    * - a `IFileEditorInput` for file resources
    * - a `UntitledEditorInput` for untitled resources
    * - a `TextResourceEditorInput` for virtual resources
    *
    * @param input the untyped editor input to create a typed input from
    */
    resolveTextEditor(input: IUntypedEditorInput): Promise<EditorInput>;
    resolveTextEditor(input: IUntypedFileEditorInput): Promise<IFileEditorInput>;
}
