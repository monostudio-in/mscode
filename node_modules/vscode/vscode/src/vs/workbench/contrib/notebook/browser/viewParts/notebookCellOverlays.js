
import { createElement } from '../../../../../base/browser/dom.js';
import { createFastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';

class NotebookCellOverlays extends Disposable {
    constructor(listView) {
        super();
        this.listView = listView;
        this._lastOverlayId = 0;
        this._overlays = Object.create(null);
        this.domNode = createFastDomNode(createElement('div'));
        this.domNode.setClassName('cell-overlays');
        this.domNode.setPosition('absolute');
        this.domNode.setAttribute('role', 'presentation');
        this.domNode.setAttribute('aria-hidden', 'true');
        this.domNode.setWidth('100%');
        this.listView.containerDomNode.appendChild(this.domNode.domNode);
    }
    changeCellOverlays(callback) {
        let overlaysHaveChanged = false;
        const changeAccessor = {
            addOverlay: (overlay) => {
                overlaysHaveChanged = true;
                return this._addOverlay(overlay);
            },
            removeOverlay: (id) => {
                overlaysHaveChanged = true;
                this._removeOverlay(id);
            },
            layoutOverlay: (id) => {
                overlaysHaveChanged = true;
                this._layoutOverlay(id);
            }
        };
        callback(changeAccessor);
        return overlaysHaveChanged;
    }
    onCellsChanged(e) {
        this.layout();
    }
    onHiddenRangesChange() {
        this.layout();
    }
    layout() {
        for (const id in this._overlays) {
            this._layoutOverlay(id);
        }
    }
    _addOverlay(overlay) {
        const overlayId = `${++this._lastOverlayId}`;
        const overlayWidget = {
            overlayId,
            overlay,
            domNode: createFastDomNode(overlay.domNode)
        };
        this._overlays[overlayId] = overlayWidget;
        overlayWidget.domNode.setClassName('cell-overlay');
        overlayWidget.domNode.setPosition('absolute');
        this.domNode.appendChild(overlayWidget.domNode);
        return overlayId;
    }
    _removeOverlay(id) {
        const overlay = this._overlays[id];
        if (overlay) {
            try {
                this.domNode.removeChild(overlay.domNode);
            }
            catch {
            }
            delete this._overlays[id];
        }
    }
    _layoutOverlay(id) {
        const overlay = this._overlays[id];
        if (!overlay) {
            return;
        }
        const isInHiddenRanges = this._isInHiddenRanges(overlay);
        if (isInHiddenRanges) {
            overlay.domNode.setDisplay('none');
            return;
        }
        overlay.domNode.setDisplay('block');
        const index = this.listView.indexOf(overlay.overlay.cell);
        if (index === -1) {
            return;
        }
        const top = this.listView.elementTop(index);
        overlay.domNode.setTop(top);
    }
    _isInHiddenRanges(zone) {
        const index = this.listView.indexOf(zone.overlay.cell);
        if (index === -1) {
            return true;
        }
        return false;
    }
}

export { NotebookCellOverlays };
