
import { createTrustedTypesPolicy } from '../../../../../../base/browser/trustedTypes.js';
import { applyFontInfo } from '../../../../config/domFontInfo.js';
import { EditorOption, EditorFontLigatures } from '../../../../../common/config/editorOptions.js';
import { Position } from '../../../../../common/core/position.js';
import { StringBuilder } from '../../../../../common/core/stringBuilder.js';
import { LineDecoration } from '../../../../../common/viewLayout/lineDecorations.js';
import { RenderLineOutput, renderViewLine, RenderLineInput } from '../../../../../common/viewLayout/viewLineRenderer.js';
import { ViewLineRenderingData } from '../../../../../common/viewModel.js';
import { getColumnOfNodeOffset } from '../../../../viewParts/viewLines/viewLine.js';

const ttPolicy = createTrustedTypesPolicy("diffEditorWidget", {
    createHTML: value => value
});
function renderLines(source, options, decorations, domNode, noExtra = false) {
    applyFontInfo(domNode, options.fontInfo);
    const hasCharChanges = (decorations.length > 0);
    const sb = ( new StringBuilder(10000));
    let maxCharsPerLine = 0;
    let renderedLineCount = 0;
    const viewLineCounts = [];
    const renderOutputs = [];
    for (let lineIndex = 0; lineIndex < source.lineTokens.length; lineIndex++) {
        const lineNumber = lineIndex + 1;
        const lineTokens = source.lineTokens[lineIndex];
        const lineBreakData = source.lineBreakData[lineIndex];
        const actualDecorations = LineDecoration.filter(decorations, lineNumber, 1, Number.MAX_SAFE_INTEGER);
        if (lineBreakData) {
            let lastBreakOffset = 0;
            for (const breakOffset of lineBreakData.breakOffsets) {
                const viewLineTokens = lineTokens.sliceAndInflate(lastBreakOffset, breakOffset, 0);
                const result = renderOriginalLine(
                    renderedLineCount,
                    viewLineTokens,
                    LineDecoration.extractWrapped(actualDecorations, lastBreakOffset, breakOffset),
                    hasCharChanges,
                    source.mightContainNonBasicASCII,
                    source.mightContainRTL,
                    options,
                    sb,
                    noExtra
                );
                maxCharsPerLine = Math.max(maxCharsPerLine, result.maxCharWidth);
                renderOutputs.push(( new RenderLineOutputWithOffset(
                    result.output.characterMapping,
                    result.output.containsForeignElements,
                    lastBreakOffset
                )));
                renderedLineCount++;
                lastBreakOffset = breakOffset;
            }
            viewLineCounts.push(lineBreakData.breakOffsets.length);
        } else {
            viewLineCounts.push(1);
            const result = renderOriginalLine(
                renderedLineCount,
                lineTokens,
                actualDecorations,
                hasCharChanges,
                source.mightContainNonBasicASCII,
                source.mightContainRTL,
                options,
                sb,
                noExtra
            );
            maxCharsPerLine = Math.max(maxCharsPerLine, result.maxCharWidth);
            renderOutputs.push(( new RenderLineOutputWithOffset(result.output.characterMapping, result.output.containsForeignElements, 0)));
            renderedLineCount++;
        }
    }
    maxCharsPerLine += options.scrollBeyondLastColumn;
    const html = sb.build();
    const trustedhtml = ttPolicy ? ttPolicy.createHTML(html) : html;
    domNode.innerHTML = trustedhtml;
    const minWidthInPx = (maxCharsPerLine * options.typicalHalfwidthCharacterWidth);
    return ( new RenderLinesResult(renderedLineCount, minWidthInPx, viewLineCounts, renderOutputs, source));
}
class LineSource {
    constructor(
        lineTokens,
        lineBreakData = ( lineTokens.map(t => null)),
        mightContainNonBasicASCII = true,
        mightContainRTL = true
    ) {
        this.lineTokens = lineTokens;
        this.lineBreakData = lineBreakData;
        this.mightContainNonBasicASCII = mightContainNonBasicASCII;
        this.mightContainRTL = mightContainRTL;
    }
}
class RenderOptions {
    static fromEditor(editor) {
        const modifiedEditorOptions = editor.getOptions();
        const fontInfo = modifiedEditorOptions.get(EditorOption.fontInfo);
        const layoutInfo = modifiedEditorOptions.get(EditorOption.layoutInfo);
        return ( new RenderOptions(
            editor.getModel()?.getOptions().tabSize || 0,
            fontInfo,
            modifiedEditorOptions.get(EditorOption.disableMonospaceOptimizations),
            fontInfo.typicalHalfwidthCharacterWidth,
            modifiedEditorOptions.get(EditorOption.scrollBeyondLastColumn),
            modifiedEditorOptions.get(EditorOption.lineHeight),
            layoutInfo.decorationsWidth,
            modifiedEditorOptions.get(EditorOption.stopRenderingLineAfter),
            modifiedEditorOptions.get(EditorOption.renderWhitespace),
            modifiedEditorOptions.get(EditorOption.renderControlCharacters),
            modifiedEditorOptions.get(EditorOption.fontLigatures),
            modifiedEditorOptions.get(EditorOption.scrollbar).verticalScrollbarSize
        ));
    }
    constructor(
        tabSize,
        fontInfo,
        disableMonospaceOptimizations,
        typicalHalfwidthCharacterWidth,
        scrollBeyondLastColumn,
        lineHeight,
        lineDecorationsWidth,
        stopRenderingLineAfter,
        renderWhitespace,
        renderControlCharacters,
        fontLigatures,
        verticalScrollbarSize,
        setWidth = true
    ) {
        this.tabSize = tabSize;
        this.fontInfo = fontInfo;
        this.disableMonospaceOptimizations = disableMonospaceOptimizations;
        this.typicalHalfwidthCharacterWidth = typicalHalfwidthCharacterWidth;
        this.scrollBeyondLastColumn = scrollBeyondLastColumn;
        this.lineHeight = lineHeight;
        this.lineDecorationsWidth = lineDecorationsWidth;
        this.stopRenderingLineAfter = stopRenderingLineAfter;
        this.renderWhitespace = renderWhitespace;
        this.renderControlCharacters = renderControlCharacters;
        this.fontLigatures = fontLigatures;
        this.verticalScrollbarSize = verticalScrollbarSize;
        this.setWidth = setWidth;
    }
    withSetWidth(setWidth) {
        return ( new RenderOptions(
            this.tabSize,
            this.fontInfo,
            this.disableMonospaceOptimizations,
            this.typicalHalfwidthCharacterWidth,
            this.scrollBeyondLastColumn,
            this.lineHeight,
            this.lineDecorationsWidth,
            this.stopRenderingLineAfter,
            this.renderWhitespace,
            this.renderControlCharacters,
            this.fontLigatures,
            this.verticalScrollbarSize,
            setWidth
        ));
    }
    withScrollBeyondLastColumn(scrollBeyondLastColumn) {
        return ( new RenderOptions(
            this.tabSize,
            this.fontInfo,
            this.disableMonospaceOptimizations,
            this.typicalHalfwidthCharacterWidth,
            scrollBeyondLastColumn,
            this.lineHeight,
            this.lineDecorationsWidth,
            this.stopRenderingLineAfter,
            this.renderWhitespace,
            this.renderControlCharacters,
            this.fontLigatures,
            this.verticalScrollbarSize,
            this.setWidth
        ));
    }
}
class RenderLinesResult {
    constructor(heightInLines, minWidthInPx, viewLineCounts, _renderOutputs, _source) {
        this.heightInLines = heightInLines;
        this.minWidthInPx = minWidthInPx;
        this.viewLineCounts = viewLineCounts;
        this._renderOutputs = _renderOutputs;
        this._source = _source;
    }
    getModelPositionAt(domNode, offset) {
        let viewLineElement = domNode;
        while (viewLineElement && !viewLineElement.classList.contains("view-line")) {
            viewLineElement = viewLineElement.parentElement;
        }
        if (!viewLineElement) {
            return undefined;
        }
        const container = viewLineElement.parentElement;
        if (!container) {
            return undefined;
        }
        const viewLines = container.querySelectorAll(".view-line");
        let viewLineIndex = -1;
        for (let i = 0; i < viewLines.length; i++) {
            if (viewLines[i] === viewLineElement) {
                viewLineIndex = i;
                break;
            }
        }
        if (viewLineIndex === -1 || viewLineIndex >= this._renderOutputs.length) {
            return undefined;
        }
        let modelLineNumber = 1;
        let remainingViewLines = viewLineIndex;
        for (let i = 0; i < this.viewLineCounts.length; i++) {
            if (remainingViewLines < this.viewLineCounts[i]) {
                modelLineNumber = i + 1;
                break;
            }
            remainingViewLines -= this.viewLineCounts[i];
        }
        if (modelLineNumber > this._source.lineTokens.length) {
            return undefined;
        }
        const renderOutput = this._renderOutputs[viewLineIndex];
        if (!renderOutput) {
            return undefined;
        }
        const column = getColumnOfNodeOffset(renderOutput.characterMapping, domNode, offset) + renderOutput.offset;
        return ( new Position(modelLineNumber, column));
    }
}
class RenderLineOutputWithOffset extends RenderLineOutput {
    constructor(characterMapping, containsForeignElements, offset) {
        super(characterMapping, containsForeignElements);
        this.offset = offset;
    }
}
function renderOriginalLine(
    viewLineIdx,
    lineTokens,
    decorations,
    hasCharChanges,
    mightContainNonBasicASCII,
    mightContainRTL,
    options,
    sb,
    noExtra
) {
    sb.appendString("<div class=\"view-line");
    if (!noExtra && !hasCharChanges) {
        sb.appendString(" char-delete");
    }
    sb.appendString("\" style=\"top:");
    sb.appendString(String(viewLineIdx * options.lineHeight));
    if (options.setWidth) {
        sb.appendString("px;width:1000000px;\">");
    } else {
        sb.appendString("px;\">");
    }
    const lineContent = lineTokens.getLineContent();
    const isBasicASCII = ViewLineRenderingData.isBasicASCII(lineContent, mightContainNonBasicASCII);
    const containsRTL = ViewLineRenderingData.containsRTL(lineContent, isBasicASCII, mightContainRTL);
    const output = renderViewLine(( new RenderLineInput(
        (options.fontInfo.isMonospace && !options.disableMonospaceOptimizations),
        options.fontInfo.canUseHalfwidthRightwardsArrow,
        lineContent,
        false,
        isBasicASCII,
        containsRTL,
        0,
        lineTokens,
        decorations,
        options.tabSize,
        0,
        options.fontInfo.spaceWidth,
        options.fontInfo.middotWidth,
        options.fontInfo.wsmiddotWidth,
        options.stopRenderingLineAfter,
        options.renderWhitespace,
        options.renderControlCharacters,
        options.fontLigatures !== EditorFontLigatures.OFF,
        null,
        null,
        options.verticalScrollbarSize
    )), sb);
    sb.appendString("</div>");
    const maxCharWidth = output.characterMapping.getHorizontalOffset(output.characterMapping.length);
    return {
        output,
        maxCharWidth
    };
}

export { LineSource, RenderLinesResult, RenderOptions, renderLines };
