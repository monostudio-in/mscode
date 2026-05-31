
import { scheduleAtNextAnimationFrame, getWindow } from '../../../base/browser/dom.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { EditorOption } from '../../common/config/editorOptions.js';
import { Position } from '../../common/core/position.js';
import { NavigationCommandRevealType } from '../coreCommands.js';
import { createEditorPagePosition, PageCoordinates, createCoordinatesRelativeToEditor } from '../editorDom.js';
import { MouseTarget } from './mouseTarget.js';

class DragScrolling extends Disposable {
    constructor(_context, _viewHelper, _mouseTargetFactory, _dispatchMouse) {
        super();
        this._context = _context;
        this._viewHelper = _viewHelper;
        this._mouseTargetFactory = _mouseTargetFactory;
        this._dispatchMouse = _dispatchMouse;
        this._operation = null;
    }
    dispose() {
        super.dispose();
        this.stop();
    }
    start(position, mouseEvent) {
        if (this._operation) {
            this._operation.setPosition(position, mouseEvent);
        } else {
            this._operation = this._createDragScrollingOperation(position, mouseEvent);
        }
    }
    stop() {
        if (this._operation) {
            this._operation.dispose();
            this._operation = null;
        }
    }
}
class DragScrollingOperation extends Disposable {
    constructor(
        _context,
        _viewHelper,
        _mouseTargetFactory,
        _dispatchMouse,
        position,
        mouseEvent
    ) {
        super();
        this._context = _context;
        this._viewHelper = _viewHelper;
        this._mouseTargetFactory = _mouseTargetFactory;
        this._dispatchMouse = _dispatchMouse;
        this._position = position;
        this._mouseEvent = mouseEvent;
        this._lastTime = Date.now();
        this._animationFrameDisposable = scheduleAtNextAnimationFrame(getWindow(mouseEvent.browserEvent), () => this._execute());
    }
    dispose() {
        this._animationFrameDisposable.dispose();
        super.dispose();
    }
    setPosition(position, mouseEvent) {
        this._position = position;
        this._mouseEvent = mouseEvent;
    }
    _tick() {
        const now = Date.now();
        const elapsed = now - this._lastTime;
        this._lastTime = now;
        return elapsed;
    }
}
class TopBottomDragScrolling extends DragScrolling {
    _createDragScrollingOperation(position, mouseEvent) {
        return ( new TopBottomDragScrollingOperation(
            this._context,
            this._viewHelper,
            this._mouseTargetFactory,
            this._dispatchMouse,
            position,
            mouseEvent
        ));
    }
}
class TopBottomDragScrollingOperation extends DragScrollingOperation {
    _getScrollSpeed() {
        const lineHeight = this._context.configuration.options.get(EditorOption.lineHeight);
        const viewportInLines = this._context.configuration.options.get(EditorOption.layoutInfo).height / lineHeight;
        const outsideDistanceInLines = this._position.outsideDistance / lineHeight;
        if (outsideDistanceInLines <= 1.5) {
            return Math.max(30, viewportInLines * (1 + outsideDistanceInLines));
        }
        if (outsideDistanceInLines <= 3) {
            return Math.max(60, viewportInLines * (2 + outsideDistanceInLines));
        }
        return Math.max(200, viewportInLines * (7 + outsideDistanceInLines));
    }
    _execute() {
        const lineHeight = this._context.configuration.options.get(EditorOption.lineHeight);
        const scrollSpeedInLines = this._getScrollSpeed();
        const elapsed = this._tick();
        const scrollInPixels = scrollSpeedInLines * (elapsed / 1000) * lineHeight;
        const scrollValue = (this._position.outsidePosition === "above" ? -scrollInPixels : scrollInPixels);
        this._context.viewModel.viewLayout.deltaScrollNow(0, scrollValue);
        this._viewHelper.renderNow();
        const viewportData = this._context.viewLayout.getLinesViewportData();
        const edgeLineNumber = (this._position.outsidePosition === "above" ? viewportData.startLineNumber : viewportData.endLineNumber);
        const cannotScrollAnymore = (this._position.outsidePosition === "above" ? viewportData.startLineNumber === 1 : viewportData.endLineNumber === this._context.viewModel.getLineCount());
        let mouseTarget;
        {
            const editorPos = createEditorPagePosition(this._viewHelper.viewDomNode);
            const horizontalScrollbarHeight = this._context.configuration.options.get(EditorOption.layoutInfo).horizontalScrollbarHeight;
            const pos = ( new PageCoordinates(
                this._mouseEvent.pos.x,
                editorPos.y + editorPos.height - horizontalScrollbarHeight - 0.1
            ));
            const relativePos = createCoordinatesRelativeToEditor(this._viewHelper.viewDomNode, editorPos, pos);
            mouseTarget = this._mouseTargetFactory.createMouseTarget(this._viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
        }
        if (!mouseTarget.position || mouseTarget.position.lineNumber !== edgeLineNumber || cannotScrollAnymore) {
            if (this._position.outsidePosition === "above") {
                mouseTarget = MouseTarget.createOutsideEditor(this._position.mouseColumn, ( new Position(edgeLineNumber, 1)), "above", this._position.outsideDistance);
            } else {
                mouseTarget = MouseTarget.createOutsideEditor(this._position.mouseColumn, ( new Position(edgeLineNumber, this._context.viewModel.getLineMaxColumn(edgeLineNumber))), "below", this._position.outsideDistance);
            }
        }
        this._dispatchMouse(mouseTarget, true, NavigationCommandRevealType.None);
        this._animationFrameDisposable = scheduleAtNextAnimationFrame(getWindow(mouseTarget.element), () => this._execute());
    }
}
class LeftRightDragScrolling extends DragScrolling {
    _createDragScrollingOperation(position, mouseEvent) {
        return ( new LeftRightDragScrollingOperation(
            this._context,
            this._viewHelper,
            this._mouseTargetFactory,
            this._dispatchMouse,
            position,
            mouseEvent
        ));
    }
}
class LeftRightDragScrollingOperation extends DragScrollingOperation {
    _getScrollSpeed() {
        const charWidth = this._context.configuration.options.get(EditorOption.fontInfo).typicalFullwidthCharacterWidth;
        const viewportInChars = this._context.configuration.options.get(EditorOption.layoutInfo).contentWidth / charWidth;
        const outsideDistanceInChars = this._position.outsideDistance / charWidth;
        if (outsideDistanceInChars <= 1.5) {
            return Math.max(30, viewportInChars * (1 + outsideDistanceInChars));
        }
        if (outsideDistanceInChars <= 3) {
            return Math.max(60, viewportInChars * (2 + outsideDistanceInChars));
        }
        return Math.max(200, viewportInChars * (7 + outsideDistanceInChars));
    }
    _execute() {
        const charWidth = this._context.configuration.options.get(EditorOption.fontInfo).typicalFullwidthCharacterWidth;
        const scrollSpeedInChars = this._getScrollSpeed();
        const elapsed = this._tick();
        const scrollInPixels = scrollSpeedInChars * (elapsed / 1000) * charWidth * 0.5;
        const scrollValue = (this._position.outsidePosition === "left" ? -scrollInPixels : scrollInPixels);
        this._context.viewModel.viewLayout.deltaScrollNow(scrollValue, 0);
        this._viewHelper.renderNow();
        if (!this._position.position) {
            return;
        }
        const edgeLineNumber = this._position.position.lineNumber;
        let mouseTarget;
        {
            const editorPos = createEditorPagePosition(this._viewHelper.viewDomNode);
            const horizontalScrollbarHeight = this._context.configuration.options.get(EditorOption.layoutInfo).horizontalScrollbarHeight;
            const pos = ( new PageCoordinates(
                this._mouseEvent.pos.x,
                editorPos.y + editorPos.height - horizontalScrollbarHeight - 0.1
            ));
            const relativePos = createCoordinatesRelativeToEditor(this._viewHelper.viewDomNode, editorPos, pos);
            mouseTarget = this._mouseTargetFactory.createMouseTarget(this._viewHelper.getLastRenderData(), editorPos, pos, relativePos, null);
        }
        if (this._position.outsidePosition === "left") {
            mouseTarget = MouseTarget.createOutsideEditor(mouseTarget.mouseColumn, ( new Position(edgeLineNumber, mouseTarget.mouseColumn)), "left", this._position.outsideDistance);
        } else {
            mouseTarget = MouseTarget.createOutsideEditor(mouseTarget.mouseColumn, ( new Position(edgeLineNumber, mouseTarget.mouseColumn)), "right", this._position.outsideDistance);
        }
        this._dispatchMouse(mouseTarget, true, NavigationCommandRevealType.None);
        this._animationFrameDisposable = scheduleAtNextAnimationFrame(getWindow(mouseTarget.element), () => this._execute());
    }
}

export { DragScrolling, DragScrollingOperation, LeftRightDragScrolling, LeftRightDragScrollingOperation, TopBottomDragScrolling, TopBottomDragScrollingOperation };
