
import { equals } from '../../base/common/objects.js';

var OverviewRulerLane;
(function (OverviewRulerLane) {
    OverviewRulerLane[OverviewRulerLane["Left"] = 1] = "Left";
    OverviewRulerLane[OverviewRulerLane["Center"] = 2] = "Center";
    OverviewRulerLane[OverviewRulerLane["Right"] = 4] = "Right";
    OverviewRulerLane[OverviewRulerLane["Full"] = 7] = "Full";
})(OverviewRulerLane || (OverviewRulerLane = {}));
var GlyphMarginLane;
(function (GlyphMarginLane) {
    GlyphMarginLane[GlyphMarginLane["Left"] = 1] = "Left";
    GlyphMarginLane[GlyphMarginLane["Center"] = 2] = "Center";
    GlyphMarginLane[GlyphMarginLane["Right"] = 3] = "Right";
})(GlyphMarginLane || (GlyphMarginLane = {}));
var MinimapPosition;
(function (MinimapPosition) {
    MinimapPosition[MinimapPosition["Inline"] = 1] = "Inline";
    MinimapPosition[MinimapPosition["Gutter"] = 2] = "Gutter";
})(MinimapPosition || (MinimapPosition = {}));
var MinimapSectionHeaderStyle;
(function (MinimapSectionHeaderStyle) {
    MinimapSectionHeaderStyle[MinimapSectionHeaderStyle["Normal"] = 1] = "Normal";
    MinimapSectionHeaderStyle[MinimapSectionHeaderStyle["Underlined"] = 2] = "Underlined";
})(MinimapSectionHeaderStyle || (MinimapSectionHeaderStyle = {}));
var TextDirection;
(function (TextDirection) {
    TextDirection[TextDirection["LTR"] = 0] = "LTR";
    TextDirection[TextDirection["RTL"] = 1] = "RTL";
})(TextDirection || (TextDirection = {}));
var InjectedTextCursorStops;
(function (InjectedTextCursorStops) {
    InjectedTextCursorStops[InjectedTextCursorStops["Both"] = 0] = "Both";
    InjectedTextCursorStops[InjectedTextCursorStops["Right"] = 1] = "Right";
    InjectedTextCursorStops[InjectedTextCursorStops["Left"] = 2] = "Left";
    InjectedTextCursorStops[InjectedTextCursorStops["None"] = 3] = "None";
})(InjectedTextCursorStops || (InjectedTextCursorStops = {}));
var EndOfLinePreference;
(function (EndOfLinePreference) {
    EndOfLinePreference[EndOfLinePreference["TextDefined"] = 0] = "TextDefined";
    EndOfLinePreference[EndOfLinePreference["LF"] = 1] = "LF";
    EndOfLinePreference[EndOfLinePreference["CRLF"] = 2] = "CRLF";
})(EndOfLinePreference || (EndOfLinePreference = {}));
var DefaultEndOfLine;
(function (DefaultEndOfLine) {
    DefaultEndOfLine[DefaultEndOfLine["LF"] = 1] = "LF";
    DefaultEndOfLine[DefaultEndOfLine["CRLF"] = 2] = "CRLF";
})(DefaultEndOfLine || (DefaultEndOfLine = {}));
var EndOfLineSequence;
(function (EndOfLineSequence) {
    EndOfLineSequence[EndOfLineSequence["LF"] = 0] = "LF";
    EndOfLineSequence[EndOfLineSequence["CRLF"] = 1] = "CRLF";
})(EndOfLineSequence || (EndOfLineSequence = {}));
class TextModelResolvedOptions {
    get originalIndentSize() {
        return this._indentSizeIsTabSize ? 'tabSize' : this.indentSize;
    }
    constructor(src) {
        this._textModelResolvedOptionsBrand = undefined;
        this.tabSize = Math.max(1, src.tabSize | 0);
        if (src.indentSize === 'tabSize') {
            this.indentSize = this.tabSize;
            this._indentSizeIsTabSize = true;
        }
        else {
            this.indentSize = Math.max(1, src.indentSize | 0);
            this._indentSizeIsTabSize = false;
        }
        this.insertSpaces = Boolean(src.insertSpaces);
        this.defaultEOL = src.defaultEOL | 0;
        this.trimAutoWhitespace = Boolean(src.trimAutoWhitespace);
        this.bracketPairColorizationOptions = src.bracketPairColorizationOptions;
    }
    equals(other) {
        return (this.tabSize === other.tabSize
            && this._indentSizeIsTabSize === other._indentSizeIsTabSize
            && this.indentSize === other.indentSize
            && this.insertSpaces === other.insertSpaces
            && this.defaultEOL === other.defaultEOL
            && this.trimAutoWhitespace === other.trimAutoWhitespace
            && equals(this.bracketPairColorizationOptions, other.bracketPairColorizationOptions));
    }
    createChangeEvent(newOpts) {
        return {
            tabSize: this.tabSize !== newOpts.tabSize,
            indentSize: this.indentSize !== newOpts.indentSize,
            insertSpaces: this.insertSpaces !== newOpts.insertSpaces,
            trimAutoWhitespace: this.trimAutoWhitespace !== newOpts.trimAutoWhitespace,
        };
    }
}
class FindMatch {
    constructor(range, matches) {
        this._findMatchBrand = undefined;
        this.range = range;
        this.matches = matches;
    }
}
var TrackedRangeStickiness;
(function (TrackedRangeStickiness) {
    TrackedRangeStickiness[TrackedRangeStickiness["AlwaysGrowsWhenTypingAtEdges"] = 0] = "AlwaysGrowsWhenTypingAtEdges";
    TrackedRangeStickiness[TrackedRangeStickiness["NeverGrowsWhenTypingAtEdges"] = 1] = "NeverGrowsWhenTypingAtEdges";
    TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingBefore"] = 2] = "GrowsOnlyWhenTypingBefore";
    TrackedRangeStickiness[TrackedRangeStickiness["GrowsOnlyWhenTypingAfter"] = 3] = "GrowsOnlyWhenTypingAfter";
})(TrackedRangeStickiness || (TrackedRangeStickiness = {}));
function isITextSnapshot(obj) {
    return (!!obj && typeof obj.read === 'function');
}
function isITextModel(obj) {
    return Boolean(obj && obj.uri);
}
var PositionAffinity;
(function (PositionAffinity) {
    PositionAffinity[PositionAffinity["Left"] = 0] = "Left";
    PositionAffinity[PositionAffinity["Right"] = 1] = "Right";
    PositionAffinity[PositionAffinity["None"] = 2] = "None";
    PositionAffinity[PositionAffinity["LeftOfInjectedText"] = 3] = "LeftOfInjectedText";
    PositionAffinity[PositionAffinity["RightOfInjectedText"] = 4] = "RightOfInjectedText";
})(PositionAffinity || (PositionAffinity = {}));
var ModelConstants;
(function (ModelConstants) {
    ModelConstants[ModelConstants["FIRST_LINE_DETECTION_LENGTH_LIMIT"] = 1000] = "FIRST_LINE_DETECTION_LENGTH_LIMIT";
})(ModelConstants || (ModelConstants = {}));
class ValidAnnotatedEditOperation {
    constructor(identifier, range, text, forceMoveMarkers, isAutoWhitespaceEdit, _isTracked) {
        this.identifier = identifier;
        this.range = range;
        this.text = text;
        this.forceMoveMarkers = forceMoveMarkers;
        this.isAutoWhitespaceEdit = isAutoWhitespaceEdit;
        this._isTracked = _isTracked;
    }
}
class SearchData {
    constructor(regex, wordSeparators, simpleSearch) {
        this.regex = regex;
        this.wordSeparators = wordSeparators;
        this.simpleSearch = simpleSearch;
    }
}
class ApplyEditsResult {
    constructor(reverseEdits, changes, trimAutoWhitespaceLineNumbers) {
        this.reverseEdits = reverseEdits;
        this.changes = changes;
        this.trimAutoWhitespaceLineNumbers = trimAutoWhitespaceLineNumbers;
    }
}
function shouldSynchronizeModel(model) {
    return (!model.isTooLargeForSyncing() && !model.isForSimpleWidget);
}

export { ApplyEditsResult, DefaultEndOfLine, EndOfLinePreference, EndOfLineSequence, FindMatch, GlyphMarginLane, InjectedTextCursorStops, MinimapPosition, MinimapSectionHeaderStyle, ModelConstants, OverviewRulerLane, PositionAffinity, SearchData, TextDirection, TextModelResolvedOptions, TrackedRangeStickiness, ValidAnnotatedEditOperation, isITextModel, isITextSnapshot, shouldSynchronizeModel };
