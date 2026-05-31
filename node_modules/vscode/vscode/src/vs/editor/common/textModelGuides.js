

var HorizontalGuidesState;
(function(HorizontalGuidesState) {
    HorizontalGuidesState[HorizontalGuidesState["Disabled"] = 0] = "Disabled";
    HorizontalGuidesState[HorizontalGuidesState["EnabledForActive"] = 1] = "EnabledForActive";
    HorizontalGuidesState[HorizontalGuidesState["Enabled"] = 2] = "Enabled";
})(HorizontalGuidesState || (HorizontalGuidesState = {}));
class IndentGuide {
    constructor(
        visibleColumn,
        column,
        className,
        horizontalLine,
        forWrappedLinesAfterColumn,
        forWrappedLinesBeforeOrAtColumn
    ) {
        this.visibleColumn = visibleColumn;
        this.column = column;
        this.className = className;
        this.horizontalLine = horizontalLine;
        this.forWrappedLinesAfterColumn = forWrappedLinesAfterColumn;
        this.forWrappedLinesBeforeOrAtColumn = forWrappedLinesBeforeOrAtColumn;
        if ((visibleColumn !== -1) === (column !== -1)) {
            throw ( new Error());
        }
    }
}
class IndentGuideHorizontalLine {
    constructor(top, endColumn) {
        this.top = top;
        this.endColumn = endColumn;
    }
}

export { HorizontalGuidesState, IndentGuide, IndentGuideHorizontalLine };
