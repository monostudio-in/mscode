
import { addDisposableListener, EventType } from '../../../../../../base/browser/dom.js';
import { CellContentPart } from '../cellPart.js';

class CollapsedCellInput extends CellContentPart {
    constructor(notebookEditor, cellInputCollapsedContainer) {
        super();
        this.notebookEditor = notebookEditor;
        this._register(addDisposableListener(cellInputCollapsedContainer, EventType.DBLCLICK, e => {
            if (!this.currentCell || !this.notebookEditor.hasModel()) {
                return;
            }
            if (this.currentCell.isInputCollapsed) {
                this.currentCell.isInputCollapsed = false;
            }
            else {
                this.currentCell.isOutputCollapsed = false;
            }
        }));
        this._register(addDisposableListener(cellInputCollapsedContainer, EventType.CLICK, e => {
            if (!this.currentCell || !this.notebookEditor.hasModel()) {
                return;
            }
            const element = e.target;
            if (element && element.classList && element.classList.contains('expandInputIcon')) {
                this.currentCell.isInputCollapsed = false;
            }
        }));
    }
}

export { CollapsedCellInput };
