
import { ResizableHTMLElement } from '../../../../base/browser/ui/resizable/resizable.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ContentWidgetPositionPreference } from '../../../browser/editorBrowser.js';
import { EditorOption } from '../../../common/config/editorOptions.js';
import { Position } from '../../../common/core/position.js';
import { Dimension, getDomNodePagePosition, getClientArea } from '../../../../base/browser/dom.js';

const TOP_HEIGHT = 30;
const BOTTOM_HEIGHT = 24;
class ResizableContentWidget extends Disposable {
    constructor(_editor, minimumSize = new Dimension(10, 10)) {
        super();
        this._editor = _editor;
        this.allowEditorOverflow = true;
        this.suppressMouseDown = false;
        this._resizableNode = this._register(( new ResizableHTMLElement()));
        this._contentPosition = null;
        this._isResizing = false;
        this._resizableNode.domNode.style.position = "absolute";
        this._resizableNode.minSize = Dimension.lift(minimumSize);
        this._resizableNode.layout(minimumSize.height, minimumSize.width);
        this._resizableNode.enableSashes(true, true, true, true);
        this._register(this._resizableNode.onDidResize(e => {
            this._resize(new Dimension(e.dimension.width, e.dimension.height));
            if (e.done) {
                this._isResizing = false;
            }
        }));
        this._register(this._resizableNode.onDidWillResize(() => {
            this._isResizing = true;
        }));
    }
    get isResizing() {
        return this._isResizing;
    }
    getDomNode() {
        return this._resizableNode.domNode;
    }
    getPosition() {
        return this._contentPosition;
    }
    get position() {
        return this._contentPosition?.position ? Position.lift(this._contentPosition.position) : undefined;
    }
    _availableVerticalSpaceAbove(position) {
        const editorDomNode = this._editor.getDomNode();
        const mouseBox = this._editor.getScrolledVisiblePosition(position);
        if (!editorDomNode || !mouseBox) {
            return;
        }
        const editorBox = getDomNodePagePosition(editorDomNode);
        return editorBox.top + mouseBox.top - TOP_HEIGHT;
    }
    _availableVerticalSpaceBelow(position) {
        const editorDomNode = this._editor.getDomNode();
        const mouseBox = this._editor.getScrolledVisiblePosition(position);
        if (!editorDomNode || !mouseBox) {
            return;
        }
        const editorBox = getDomNodePagePosition(editorDomNode);
        const bodyBox = getClientArea(editorDomNode.ownerDocument.body);
        const mouseBottom = editorBox.top + mouseBox.top + mouseBox.height;
        return bodyBox.height - mouseBottom - BOTTOM_HEIGHT;
    }
    _findPositionPreference(widgetHeight, showAtPosition) {
        const maxHeightBelow = Math.min(
            this._availableVerticalSpaceBelow(showAtPosition) ?? Infinity,
            widgetHeight
        );
        const maxHeightAbove = Math.min(
            this._availableVerticalSpaceAbove(showAtPosition) ?? Infinity,
            widgetHeight
        );
        const maxHeight = Math.min(Math.max(maxHeightAbove, maxHeightBelow), widgetHeight);
        const height = Math.min(widgetHeight, maxHeight);
        let renderingAbove;
        if (this._editor.getOption(EditorOption.hover).above) {
            renderingAbove = height <= maxHeightAbove ? ContentWidgetPositionPreference.ABOVE : ContentWidgetPositionPreference.BELOW;
        } else {
            renderingAbove = height <= maxHeightBelow ? ContentWidgetPositionPreference.BELOW : ContentWidgetPositionPreference.ABOVE;
        }
        if (renderingAbove === ContentWidgetPositionPreference.ABOVE) {
            this._resizableNode.enableSashes(true, true, false, false);
        } else {
            this._resizableNode.enableSashes(false, true, true, false);
        }
        return renderingAbove;
    }
    _resize(dimension) {
        this._resizableNode.layout(dimension.height, dimension.width);
    }
}

export { ResizableContentWidget };
