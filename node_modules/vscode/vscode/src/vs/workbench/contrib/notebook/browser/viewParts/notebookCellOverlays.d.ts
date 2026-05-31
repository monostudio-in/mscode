import { FastDomNode } from "../../../../../base/browser/fastDomNode.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { INotebookCellOverlayChangeAccessor, INotebookViewCellsUpdateEvent } from "../notebookBrowser.js";
import { NotebookCellListView } from "../view/notebookCellListView.js";
import { CellViewModel } from "../viewModel/notebookViewModelImpl.js";
export declare class NotebookCellOverlays extends Disposable {
    private readonly listView;
    private _lastOverlayId;
    domNode: FastDomNode<HTMLElement>;
    private _overlays;
    constructor(listView: NotebookCellListView<CellViewModel>);
    changeCellOverlays(callback: (changeAccessor: INotebookCellOverlayChangeAccessor) => void): boolean;
    onCellsChanged(e: INotebookViewCellsUpdateEvent): void;
    onHiddenRangesChange(): void;
    layout(): void;
    private _addOverlay;
    private _removeOverlay;
    private _layoutOverlay;
    private _isInHiddenRanges;
}
