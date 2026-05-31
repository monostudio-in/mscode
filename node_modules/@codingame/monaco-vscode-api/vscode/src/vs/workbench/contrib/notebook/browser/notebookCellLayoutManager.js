
import { DeferredPromise } from '../../../../base/common/async.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { scheduleAtNextAnimationFrame, getWindow } from '../../../../base/browser/dom.js';

class NotebookCellLayoutManager extends Disposable {
    constructor(notebookWidget, _list, loggingService) {
        super();
        this.notebookWidget = notebookWidget;
        this._list = _list;
        this.loggingService = loggingService;
        this._pendingLayouts = ( new WeakMap());
        this._layoutDisposables = ( new Set());
        this._layoutStack = [];
        this._isDisposed = false;
    }
    checkStackDepth() {
        if (this._layoutStack.length > 30) {
            const layoutTrace = this._layoutStack.join(" -> ");
            throw ( new Error("NotebookCellLayoutManager: layout stack is too deep: " + layoutTrace));
        }
    }
    async layoutNotebookCell(cell, height) {
        const layoutTag = `cell:${cell.handle}, height:${height}`;
        this.loggingService.debug("cell layout", layoutTag);
        const viewIndex = this._list.getViewIndex(cell);
        if (viewIndex === undefined) {
            return;
        }
        if (this._pendingLayouts?.has(cell)) {
            const oldPendingLayout = this._pendingLayouts.get(cell);
            oldPendingLayout.dispose();
            this._layoutDisposables.delete(oldPendingLayout);
        }
        const deferred = ( new DeferredPromise());
        const doLayout = () => {
            const pendingLayout = this._pendingLayouts?.get(cell);
            this._pendingLayouts?.delete(cell);
            this._layoutStack.push(layoutTag);
            try {
                if (this._isDisposed) {
                    return;
                }
                if (!this.notebookWidget.viewModel?.hasCell(cell)) {
                    return;
                }
                if (this._list.getViewIndex(cell) === undefined) {
                    return;
                }
                if (this._list.elementHeight(cell) === height) {
                    return;
                }
                this.checkStackDepth();
                if (!this.notebookWidget.hasEditorFocus()) {
                    const cellIndex = this.notebookWidget.viewModel?.getCellIndex(cell);
                    const visibleRanges = this.notebookWidget.visibleRanges;
                    if (
                    cellIndex !== undefined && visibleRanges && visibleRanges.length && visibleRanges[0].start === cellIndex && this._list.scrollTop > this.notebookWidget.getAbsoluteTopOfElement(cell)) {
                        return this._list.updateElementHeight2(cell, height, Math.min(cellIndex + 1, this.notebookWidget.getLength() - 1));
                    }
                }
                this._list.updateElementHeight2(cell, height);
            } finally {
                this._layoutStack.pop();
                deferred.complete(undefined);
                if (pendingLayout) {
                    pendingLayout.dispose();
                    this._layoutDisposables.delete(pendingLayout);
                }
            }
        };
        if (this._list.inRenderingTransaction) {
            const layoutDisposable = scheduleAtNextAnimationFrame(getWindow(this.notebookWidget.getDomNode()), doLayout);
            const disposable = toDisposable(() => {
                layoutDisposable.dispose();
                deferred.complete(undefined);
            });
            this._pendingLayouts?.set(cell, disposable);
            this._layoutDisposables.add(disposable);
        } else {
            doLayout();
        }
        return deferred.p;
    }
    dispose() {
        super.dispose();
        this._isDisposed = true;
        this._layoutDisposables.forEach(d => d.dispose());
    }
}

export { NotebookCellLayoutManager };
