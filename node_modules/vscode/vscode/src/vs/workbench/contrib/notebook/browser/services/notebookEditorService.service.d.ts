import { Dimension } from "../../../../../base/browser/dom.js";
import { CodeWindow } from "../../../../../base/browser/window.js";
import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { ICodeEditor } from "../../../../../editor/browser/editorBrowser.js";
import { type ServicesAccessor } from "../../../../../platform/instantiation/common/instantiation.js";
import { INotebookEditorCreationOptions, INotebookEditor } from "../notebookBrowser.js";
import { NotebookEditorWidget } from "../notebookEditorWidget.js";
import { IBorrowValue } from "./notebookEditorService.js";
export declare const INotebookEditorService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookEditorService>;
export interface INotebookEditorService {
    _serviceBrand: undefined;
    retrieveWidget(accessor: ServicesAccessor, groupId: number, input: {
        resource: URI;
        typeId: string;
    }, creationOptions?: INotebookEditorCreationOptions, dimension?: Dimension, codeWindow?: CodeWindow): IBorrowValue<INotebookEditor>;
    retrieveExistingWidgetFromURI(resource: URI): IBorrowValue<NotebookEditorWidget> | undefined;
    retrieveAllExistingWidgets(): IBorrowValue<NotebookEditorWidget>[];
    readonly onDidAddNotebookEditor: Event<INotebookEditor>;
    readonly onDidRemoveNotebookEditor: Event<INotebookEditor>;
    addNotebookEditor(editor: INotebookEditor): void;
    removeNotebookEditor(editor: INotebookEditor): void;
    getNotebookEditor(editorId: string): INotebookEditor | undefined;
    listNotebookEditors(): readonly INotebookEditor[];
    getNotebookForPossibleCell(editor: ICodeEditor): INotebookEditor | undefined;
    updateReplContextKey(uri: string): void;
}
