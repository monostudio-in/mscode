import { ITextSearchMatch } from "../../../../services/search/common/search.js";
import { ICellViewModel } from "../../../notebook/browser/notebookBrowser.js";
import { NotebookEditorWidget } from "../../../notebook/browser/notebookEditorWidget.js";
import { INotebookCellMatchNoModel } from "../../common/searchNotebookHelpers.js";
import { ISearchTreeFileMatch, ISearchTreeMatch } from "../searchTreeModel/searchTreeCommon.js";
import { INotebookCellMatchWithModel } from "./searchNotebookHelpers.js";
export interface INotebookFileInstanceMatch extends ISearchTreeFileMatch {
    bindNotebookEditorWidget(editor: NotebookEditorWidget): void;
    updateMatchesForEditorWidget(): Promise<void>;
    unbindNotebookEditorWidget(editor: NotebookEditorWidget): void;
    updateNotebookHighlights(): void;
    getCellMatch(cellID: string): ICellMatch | undefined;
    addCellMatch(rawCell: INotebookCellMatchNoModel | INotebookCellMatchWithModel): void;
    showMatch(match: IMatchInNotebook): Promise<void>;
    cellMatches(): ICellMatch[];
}
export declare function isNotebookFileMatch(obj: any): obj is INotebookFileInstanceMatch;
export interface IMatchInNotebook extends ISearchTreeMatch {
    parent(): INotebookFileInstanceMatch;
    cellParent: ICellMatch;
    isWebviewMatch(): boolean;
    cellIndex: number;
    webviewIndex: number | undefined;
    cell: ICellViewModel | undefined;
}
export declare function isIMatchInNotebook(obj: any): obj is IMatchInNotebook;
export interface ICellMatch {
    hasCellViewModel(): boolean;
    context: Map<number, string>;
    matches(): IMatchInNotebook[];
    contentMatches: IMatchInNotebook[];
    webviewMatches: IMatchInNotebook[];
    remove(matches: IMatchInNotebook | IMatchInNotebook[]): void;
    clearAllMatches(): void;
    addContentMatches(textSearchMatches: ITextSearchMatch[]): void;
    addContext(textSearchMatches: ITextSearchMatch[]): void;
    addWebviewMatches(textSearchMatches: ITextSearchMatch[]): void;
    setCellModel(cell: ICellViewModel): void;
    parent: INotebookFileInstanceMatch;
    id: string;
    cellIndex: number;
    cell: ICellViewModel | undefined;
}
