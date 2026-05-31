
import '../../../../../../../../base/common/observableInternal/index.js';
import { Size2D } from '../../../../../../../common/core/2d/size.js';
import { LineRange } from '../../../../../../../common/core/ranges/lineRange.js';
import { OffsetRange } from '../../../../../../../common/core/ranges/offsetRange.js';
import { getMaxTowerHeightInAvailableArea } from '../../utils/towersLayout.js';
import { derived } from '../../../../../../../../base/common/observableInternal/observables/derived.js';

class WidgetPlacementContext {
    constructor(_lineRangeInfo, editorTrueContentWidth, endOfLinePadding) {
        this._lineRangeInfo = _lineRangeInfo;
        this.availableSpaceSizes = ( _lineRangeInfo.sizes.map((s, idx) => {
            const lineNumber = _lineRangeInfo.lineRange.startLineNumber + idx;
            const linePaddingLeft = endOfLinePadding(lineNumber);
            return ( new Size2D(Math.max(0, editorTrueContentWidth - s.width - linePaddingLeft), s.height));
        }));
        this.availableSpaceHeightPrefixSums = getSums(this.availableSpaceSizes, s => s.height);
        this.availableSpaceSizesTransposed = ( this.availableSpaceSizes.map(s => s.transpose()));
    }
    getWidgetVerticalOutline(lineNumber, previewEditorHeight, layoutConstants) {
        const sizeIdx = lineNumber - this._lineRangeInfo.lineRange.startLineNumber;
        const top = this._lineRangeInfo.top + this.availableSpaceHeightPrefixSums[sizeIdx];
        const editorRange = OffsetRange.ofStartAndLength(top, previewEditorHeight);
        const {
            previewEditorMargin,
            widgetPadding,
            widgetBorder,
            lowerBarHeight
        } = layoutConstants;
        const verticalWidgetRange = editorRange.withMargin(previewEditorMargin + widgetPadding + widgetBorder).withMargin(0, lowerBarHeight);
        return verticalWidgetRange;
    }
    tryFindWidgetOutline(
        targetLineNumber,
        previewEditorHeight,
        editorTrueContentRight,
        layoutConstants
    ) {
        if (this._lineRangeInfo.lineRange.length < 3) {
            return undefined;
        }
        return findFirstMinimzeDistance(
            this._lineRangeInfo.lineRange.addMargin(-1, -1),
            targetLineNumber,
            lineNumber => {
                const verticalWidgetRange = this.getWidgetVerticalOutline(lineNumber, previewEditorHeight, layoutConstants);
                const maxWidth = getMaxTowerHeightInAvailableArea(
                    verticalWidgetRange.delta(-this._lineRangeInfo.top),
                    this.availableSpaceSizesTransposed
                );
                if (maxWidth < layoutConstants.minWidgetWidth) {
                    return undefined;
                }
                const horizontalWidgetRange = OffsetRange.ofStartAndLength(editorTrueContentRight - maxWidth, maxWidth);
                return {
                    horizontalWidgetRange,
                    verticalWidgetRange
                };
            }
        );
    }
}
function splitIntoContinuousLineRanges(lineRange, sizes, top, editorObs, reader) {
    const result = [];
    let currentRangeStart = lineRange.startLineNumber;
    let currentRangeTop = top;
    let currentSizes = [];
    for (let i = 0; i < sizes.length; i++) {
        const lineNumber = lineRange.startLineNumber + i;
        const expectedTop = currentRangeTop + currentSizes.reduce((p, c) => p + c.height, 0);
        const actualTop = editorObs.editor.getTopForLineNumber(lineNumber);
        if (i > 0 && actualTop !== expectedTop) {
            result.push({
                lineRange: LineRange.ofLength(currentRangeStart, lineNumber - currentRangeStart),
                top: currentRangeTop,
                sizes: currentSizes
            });
            currentRangeStart = lineNumber;
            currentRangeTop = actualTop;
            currentSizes = [];
        }
        currentSizes.push(sizes[i]);
    }
    result.push({
        lineRange: LineRange.ofLength(currentRangeStart, lineRange.endLineNumberExclusive - currentRangeStart),
        top: currentRangeTop,
        sizes: currentSizes
    });
    derived({
        owner: "splitIntoContinuousLineRanges"
    }, r => {
        return editorObs.observeTopForLineNumber(lineRange.endLineNumberExclusive - 1).read(r);
    }).read(reader);
    return result;
}
function findFirstMinimzeDistance(range, targetLine, predicate) {
    for (let offset = 0; ; offset++) {
        const down = targetLine + offset;
        if (down <= range.endLineNumberExclusive) {
            const result = predicate(down);
            if (result !== undefined) {
                return result;
            }
        }
        const up = targetLine - offset;
        if (up >= range.startLineNumber) {
            const result = predicate(up);
            if (result !== undefined) {
                return result;
            }
        }
        if (up < range.startLineNumber && down > range.endLineNumberExclusive) {
            return undefined;
        }
    }
}
function getSums(array, fn) {
    const result = [0];
    let sum = 0;
    for (const item of array) {
        sum += fn(item);
        result.push(sum);
    }
    return result;
}

export { WidgetPlacementContext, splitIntoContinuousLineRanges };
