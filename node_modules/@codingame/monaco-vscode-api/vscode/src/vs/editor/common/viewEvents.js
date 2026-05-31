

var ViewEventType;
(function (ViewEventType) {
    ViewEventType[ViewEventType["ViewCompositionStart"] = 0] = "ViewCompositionStart";
    ViewEventType[ViewEventType["ViewCompositionEnd"] = 1] = "ViewCompositionEnd";
    ViewEventType[ViewEventType["ViewConfigurationChanged"] = 2] = "ViewConfigurationChanged";
    ViewEventType[ViewEventType["ViewCursorStateChanged"] = 3] = "ViewCursorStateChanged";
    ViewEventType[ViewEventType["ViewDecorationsChanged"] = 4] = "ViewDecorationsChanged";
    ViewEventType[ViewEventType["ViewFlushed"] = 5] = "ViewFlushed";
    ViewEventType[ViewEventType["ViewFocusChanged"] = 6] = "ViewFocusChanged";
    ViewEventType[ViewEventType["ViewLanguageConfigurationChanged"] = 7] = "ViewLanguageConfigurationChanged";
    ViewEventType[ViewEventType["ViewLineMappingChanged"] = 8] = "ViewLineMappingChanged";
    ViewEventType[ViewEventType["ViewLinesChanged"] = 9] = "ViewLinesChanged";
    ViewEventType[ViewEventType["ViewLinesDeleted"] = 10] = "ViewLinesDeleted";
    ViewEventType[ViewEventType["ViewLinesInserted"] = 11] = "ViewLinesInserted";
    ViewEventType[ViewEventType["ViewRevealRangeRequest"] = 12] = "ViewRevealRangeRequest";
    ViewEventType[ViewEventType["ViewScrollChanged"] = 13] = "ViewScrollChanged";
    ViewEventType[ViewEventType["ViewThemeChanged"] = 14] = "ViewThemeChanged";
    ViewEventType[ViewEventType["ViewTokensChanged"] = 15] = "ViewTokensChanged";
    ViewEventType[ViewEventType["ViewTokensColorsChanged"] = 16] = "ViewTokensColorsChanged";
    ViewEventType[ViewEventType["ViewZonesChanged"] = 17] = "ViewZonesChanged";
})(ViewEventType || (ViewEventType = {}));
class ViewCompositionStartEvent {
    constructor() {
        this.type = ViewEventType.ViewCompositionStart;
    }
}
class ViewCompositionEndEvent {
    constructor() {
        this.type = ViewEventType.ViewCompositionEnd;
    }
}
class ViewConfigurationChangedEvent {
    constructor(source) {
        this.type = ViewEventType.ViewConfigurationChanged;
        this._source = source;
    }
    hasChanged(id) {
        return this._source.hasChanged(id);
    }
}
class ViewCursorStateChangedEvent {
    constructor(selections, modelSelections, reason) {
        this.selections = selections;
        this.modelSelections = modelSelections;
        this.reason = reason;
        this.type = ViewEventType.ViewCursorStateChanged;
    }
}
class ViewDecorationsChangedEvent {
    constructor(source) {
        this.type = ViewEventType.ViewDecorationsChanged;
        if (source) {
            this.affectsMinimap = source.affectsMinimap;
            this.affectsOverviewRuler = source.affectsOverviewRuler;
            this.affectsGlyphMargin = source.affectsGlyphMargin;
            this.affectsLineNumber = source.affectsLineNumber;
        }
        else {
            this.affectsMinimap = true;
            this.affectsOverviewRuler = true;
            this.affectsGlyphMargin = true;
            this.affectsLineNumber = true;
        }
    }
}
class ViewFlushedEvent {
    constructor() {
        this.type = ViewEventType.ViewFlushed;
    }
}
class ViewFocusChangedEvent {
    constructor(isFocused) {
        this.type = ViewEventType.ViewFocusChanged;
        this.isFocused = isFocused;
    }
}
class ViewLanguageConfigurationEvent {
    constructor() {
        this.type = ViewEventType.ViewLanguageConfigurationChanged;
    }
}
class ViewLineMappingChangedEvent {
    constructor() {
        this.type = ViewEventType.ViewLineMappingChanged;
    }
}
class ViewLinesChangedEvent {
    constructor(
    fromLineNumber,
    count) {
        this.fromLineNumber = fromLineNumber;
        this.count = count;
        this.type = ViewEventType.ViewLinesChanged;
    }
}
class ViewLinesDeletedEvent {
    constructor(fromLineNumber, toLineNumber) {
        this.type = ViewEventType.ViewLinesDeleted;
        this.fromLineNumber = fromLineNumber;
        this.toLineNumber = toLineNumber;
    }
}
class ViewLinesInsertedEvent {
    constructor(fromLineNumber, toLineNumber) {
        this.type = ViewEventType.ViewLinesInserted;
        this.fromLineNumber = fromLineNumber;
        this.toLineNumber = toLineNumber;
    }
}
var VerticalRevealType;
(function (VerticalRevealType) {
    VerticalRevealType[VerticalRevealType["Simple"] = 0] = "Simple";
    VerticalRevealType[VerticalRevealType["Center"] = 1] = "Center";
    VerticalRevealType[VerticalRevealType["CenterIfOutsideViewport"] = 2] = "CenterIfOutsideViewport";
    VerticalRevealType[VerticalRevealType["Top"] = 3] = "Top";
    VerticalRevealType[VerticalRevealType["Bottom"] = 4] = "Bottom";
    VerticalRevealType[VerticalRevealType["NearTop"] = 5] = "NearTop";
    VerticalRevealType[VerticalRevealType["NearTopIfOutsideViewport"] = 6] = "NearTopIfOutsideViewport";
})(VerticalRevealType || (VerticalRevealType = {}));
class ViewRevealRangeRequestEvent {
    constructor(
    source,
    minimalReveal,
    range,
    selections,
    verticalType,
    revealHorizontal,
    scrollType) {
        this.source = source;
        this.minimalReveal = minimalReveal;
        this.range = range;
        this.selections = selections;
        this.verticalType = verticalType;
        this.revealHorizontal = revealHorizontal;
        this.scrollType = scrollType;
        this.type = ViewEventType.ViewRevealRangeRequest;
    }
}
class ViewScrollChangedEvent {
    constructor(source) {
        this.type = ViewEventType.ViewScrollChanged;
        this.scrollWidth = source.scrollWidth;
        this.scrollLeft = source.scrollLeft;
        this.scrollHeight = source.scrollHeight;
        this.scrollTop = source.scrollTop;
        this.scrollWidthChanged = source.scrollWidthChanged;
        this.scrollLeftChanged = source.scrollLeftChanged;
        this.scrollHeightChanged = source.scrollHeightChanged;
        this.scrollTopChanged = source.scrollTopChanged;
    }
}
class ViewThemeChangedEvent {
    constructor(theme) {
        this.theme = theme;
        this.type = ViewEventType.ViewThemeChanged;
    }
}
class ViewTokensChangedEvent {
    constructor(ranges) {
        this.type = ViewEventType.ViewTokensChanged;
        this.ranges = ranges;
    }
}
class ViewTokensColorsChangedEvent {
    constructor() {
        this.type = ViewEventType.ViewTokensColorsChanged;
    }
}
class ViewZonesChangedEvent {
    constructor() {
        this.type = ViewEventType.ViewZonesChanged;
    }
}

export { VerticalRevealType, ViewCompositionEndEvent, ViewCompositionStartEvent, ViewConfigurationChangedEvent, ViewCursorStateChangedEvent, ViewDecorationsChangedEvent, ViewEventType, ViewFlushedEvent, ViewFocusChangedEvent, ViewLanguageConfigurationEvent, ViewLineMappingChangedEvent, ViewLinesChangedEvent, ViewLinesDeletedEvent, ViewLinesInsertedEvent, ViewRevealRangeRequestEvent, ViewScrollChangedEvent, ViewThemeChangedEvent, ViewTokensChangedEvent, ViewTokensColorsChangedEvent, ViewZonesChangedEvent };
