import type * as vscode from "vscode";
import { URI } from "../../../../base/common/uri.js";
import { ICellMetadataEdit, IDocumentMetadataEdit } from "../../../contrib/notebook/common/notebookCommon.js";
import { NotebookEdit } from "./notebooks.js";
import { SnippetTextEdit } from "./snippetTextEdit.js";
import { Position } from "./position.js";
import { Range } from "./range.js";
import { TextEdit } from "./textEdit.js";
export interface IFileOperationOptions {
    readonly overwrite?: boolean;
    readonly ignoreIfExists?: boolean;
    readonly ignoreIfNotExists?: boolean;
    readonly recursive?: boolean;
    readonly contents?: Uint8Array | vscode.DataTransferFile;
}
export declare enum FileEditType {
    File = 1,
    Text = 2,
    Cell = 3,
    CellReplace = 5,
    Snippet = 6
}
export interface IFileOperation {
    readonly _type: FileEditType.File;
    readonly from?: URI;
    readonly to?: URI;
    readonly options?: IFileOperationOptions;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface IFileTextEdit {
    readonly _type: FileEditType.Text;
    readonly uri: URI;
    readonly edit: TextEdit;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface IFileSnippetTextEdit {
    readonly _type: FileEditType.Snippet;
    readonly uri: URI;
    readonly range: vscode.Range;
    readonly edit: vscode.SnippetString;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
    readonly keepWhitespace?: boolean;
}
export interface IFileCellEdit {
    readonly _type: FileEditType.Cell;
    readonly uri: URI;
    readonly edit?: ICellMetadataEdit | IDocumentMetadataEdit;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
}
export interface ICellEdit {
    readonly _type: FileEditType.CellReplace;
    readonly metadata?: vscode.WorkspaceEditEntryMetadata;
    readonly uri: URI;
    readonly index: number;
    readonly count: number;
    readonly cells: vscode.NotebookCellData[];
}
export type WorkspaceEditEntry = IFileOperation | IFileTextEdit | IFileSnippetTextEdit | IFileCellEdit | ICellEdit;
export declare class WorkspaceEdit implements vscode.WorkspaceEdit {
    private readonly _edits;
    _allEntries(): ReadonlyArray<WorkspaceEditEntry>;
    renameFile(from: vscode.Uri, to: vscode.Uri, options?: {
        readonly overwrite?: boolean;
        readonly ignoreIfExists?: boolean;
    }, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    createFile(uri: vscode.Uri, options?: {
        readonly overwrite?: boolean;
        readonly ignoreIfExists?: boolean;
        readonly contents?: Uint8Array | vscode.DataTransferFile;
    }, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    deleteFile(uri: vscode.Uri, options?: {
        readonly recursive?: boolean;
        readonly ignoreIfNotExists?: boolean;
    }, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    private replaceNotebookMetadata;
    private replaceNotebookCells;
    private replaceNotebookCellMetadata;
    replace(uri: URI, range: Range, newText: string, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    insert(resource: URI, position: Position, newText: string, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    delete(resource: URI, range: Range, metadata?: vscode.WorkspaceEditEntryMetadata): void;
    has(uri: URI): boolean;
    set(uri: URI, edits: ReadonlyArray<TextEdit | SnippetTextEdit>): void;
    set(uri: URI, edits: ReadonlyArray<[
        TextEdit | SnippetTextEdit,
        vscode.WorkspaceEditEntryMetadata | undefined
    ]>): void;
    set(uri: URI, edits: readonly NotebookEdit[]): void;
    set(uri: URI, edits: ReadonlyArray<[
        NotebookEdit,
        vscode.WorkspaceEditEntryMetadata | undefined
    ]>): void;
    get(uri: URI): TextEdit[];
    entries(): [
        URI,
        TextEdit[]
    ][];
    get size(): number;
    toJSON(): [
        URI,
        TextEdit[]
    ][];
}
