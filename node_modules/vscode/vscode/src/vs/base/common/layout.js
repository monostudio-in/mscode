
import { Range } from './range.js';

var AnchorAlignment;
(function (AnchorAlignment) {
    AnchorAlignment[AnchorAlignment["LEFT"] = 0] = "LEFT";
    AnchorAlignment[AnchorAlignment["RIGHT"] = 1] = "RIGHT";
})(AnchorAlignment || (AnchorAlignment = {}));
var AnchorPosition;
(function (AnchorPosition) {
    AnchorPosition[AnchorPosition["BELOW"] = 0] = "BELOW";
    AnchorPosition[AnchorPosition["ABOVE"] = 1] = "ABOVE";
})(AnchorPosition || (AnchorPosition = {}));
var AnchorAxisAlignment;
(function (AnchorAxisAlignment) {
    AnchorAxisAlignment[AnchorAxisAlignment["VERTICAL"] = 0] = "VERTICAL";
    AnchorAxisAlignment[AnchorAxisAlignment["HORIZONTAL"] = 1] = "HORIZONTAL";
})(AnchorAxisAlignment || (AnchorAxisAlignment = {}));
var LayoutAnchorPosition;
(function (LayoutAnchorPosition) {
    LayoutAnchorPosition[LayoutAnchorPosition["Before"] = 0] = "Before";
    LayoutAnchorPosition[LayoutAnchorPosition["After"] = 1] = "After";
})(LayoutAnchorPosition || (LayoutAnchorPosition = {}));
var LayoutAnchorMode;
(function (LayoutAnchorMode) {
    LayoutAnchorMode[LayoutAnchorMode["AVOID"] = 0] = "AVOID";
    LayoutAnchorMode[LayoutAnchorMode["ALIGN"] = 1] = "ALIGN";
})(LayoutAnchorMode || (LayoutAnchorMode = {}));
function layout(viewportSize, viewSize, anchor) {
    const layoutAfterAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset : anchor.offset + anchor.size;
    const layoutBeforeAnchorBoundary = anchor.mode === LayoutAnchorMode.ALIGN ? anchor.offset + anchor.size : anchor.offset;
    if (anchor.position === LayoutAnchorPosition.Before) {
        if (viewSize <= viewportSize - layoutAfterAnchorBoundary) {
            return { position: layoutAfterAnchorBoundary, result: 'ok' };
        }
        if (viewSize <= layoutBeforeAnchorBoundary) {
            return { position: layoutBeforeAnchorBoundary - viewSize, result: 'flipped' };
        }
        return { position: Math.max(viewportSize - viewSize, 0), result: 'overlap' };
    }
    else {
        if (viewSize <= layoutBeforeAnchorBoundary) {
            return { position: layoutBeforeAnchorBoundary - viewSize, result: 'ok' };
        }
        if (viewSize <= viewportSize - layoutAfterAnchorBoundary && layoutBeforeAnchorBoundary < viewSize / 2) {
            return { position: layoutAfterAnchorBoundary, result: 'flipped' };
        }
        return { position: 0, result: 'overlap' };
    }
}
function layout2d(viewport, view, anchor, options) {
    let anchorAlignment = options?.anchorAlignment ?? AnchorAlignment.LEFT;
    let anchorPosition = options?.anchorPosition ?? AnchorPosition.BELOW;
    const anchorAxisAlignment = options?.anchorAxisAlignment ?? AnchorAxisAlignment.VERTICAL;
    let top;
    let left;
    if (anchorAxisAlignment === AnchorAxisAlignment.VERTICAL) {
        const verticalAnchor = { offset: anchor.top - viewport.top, size: anchor.height, position: anchorPosition === AnchorPosition.BELOW ? LayoutAnchorPosition.Before : LayoutAnchorPosition.After };
        const horizontalAnchor = { offset: anchor.left, size: anchor.width, position: anchorAlignment === AnchorAlignment.LEFT ? LayoutAnchorPosition.Before : LayoutAnchorPosition.After, mode: LayoutAnchorMode.ALIGN };
        const verticalLayoutResult = layout(viewport.height, view.height, verticalAnchor);
        top = verticalLayoutResult.position + viewport.top;
        if (verticalLayoutResult.result === 'flipped') {
            anchorPosition = anchorPosition === AnchorPosition.BELOW ? AnchorPosition.ABOVE : AnchorPosition.BELOW;
        }
        if (Range.intersects({ start: top, end: top + view.height }, { start: verticalAnchor.offset, end: verticalAnchor.offset + verticalAnchor.size })) {
            horizontalAnchor.mode = LayoutAnchorMode.AVOID;
        }
        const horizontalLayoutResult = layout(viewport.width, view.width, horizontalAnchor);
        left = horizontalLayoutResult.position;
        if (horizontalLayoutResult.result === 'flipped') {
            anchorAlignment = anchorAlignment === AnchorAlignment.LEFT ? AnchorAlignment.RIGHT : AnchorAlignment.LEFT;
        }
    }
    else {
        const horizontalAnchor = { offset: anchor.left, size: anchor.width, position: anchorAlignment === AnchorAlignment.LEFT ? LayoutAnchorPosition.Before : LayoutAnchorPosition.After };
        const verticalAnchor = { offset: anchor.top, size: anchor.height, position: anchorPosition === AnchorPosition.BELOW ? LayoutAnchorPosition.Before : LayoutAnchorPosition.After, mode: LayoutAnchorMode.ALIGN };
        const horizontalLayoutResult = layout(viewport.width, view.width, horizontalAnchor);
        left = horizontalLayoutResult.position;
        if (horizontalLayoutResult.result === 'flipped') {
            anchorAlignment = anchorAlignment === AnchorAlignment.LEFT ? AnchorAlignment.RIGHT : AnchorAlignment.LEFT;
        }
        if (Range.intersects({ start: left, end: left + view.width }, { start: horizontalAnchor.offset, end: horizontalAnchor.offset + horizontalAnchor.size })) {
            verticalAnchor.mode = LayoutAnchorMode.AVOID;
        }
        const verticalLayoutResult = layout(viewport.height, view.height, verticalAnchor);
        top = verticalLayoutResult.position + viewport.top;
        if (verticalLayoutResult.result === 'flipped') {
            anchorPosition = anchorPosition === AnchorPosition.BELOW ? AnchorPosition.ABOVE : AnchorPosition.BELOW;
        }
    }
    const right = viewport.width - (left + view.width);
    const bottom = viewport.height - (top + view.height);
    return { top, left, bottom, right, anchorAlignment, anchorPosition };
}

export { AnchorAlignment, AnchorAxisAlignment, AnchorPosition, LayoutAnchorMode, LayoutAnchorPosition, layout, layout2d };
