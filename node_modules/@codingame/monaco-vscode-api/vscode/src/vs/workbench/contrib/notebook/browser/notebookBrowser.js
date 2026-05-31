
import { NOTEBOOK_EDITOR_ID, NOTEBOOK_DIFF_EDITOR_ID } from '../common/notebookCommon.js';
import { isCompositeNotebookEditorInput } from '../common/notebookEditorInput.js';
import { cellRangesToIndexes, reduceCellRanges } from '../common/notebookRange.js';

const EXPAND_CELL_INPUT_COMMAND_ID = "notebook.cell.expandCellInput";
const EXECUTE_CELL_COMMAND_ID = "notebook.cell.execute";
const DETECT_CELL_LANGUAGE = "notebook.cell.detectLanguage";
const CHANGE_CELL_LANGUAGE = "notebook.cell.changeLanguage";
const QUIT_EDIT_CELL_COMMAND_ID = "notebook.cell.quitEdit";
const EXPAND_CELL_OUTPUT_COMMAND_ID = "notebook.cell.expandCellOutput";
const IPYNB_VIEW_TYPE = "jupyter-notebook";
const JUPYTER_EXTENSION_ID = "ms-toolsai.jupyter";
const KERNEL_EXTENSIONS = ( new Map([[IPYNB_VIEW_TYPE, JUPYTER_EXTENSION_ID]]));
const KERNEL_RECOMMENDATIONS = ( new Map());
KERNEL_RECOMMENDATIONS.set(IPYNB_VIEW_TYPE, ( new Map()));
KERNEL_RECOMMENDATIONS.get(IPYNB_VIEW_TYPE)?.set("python", {
    extensionIds: ["ms-python.python", JUPYTER_EXTENSION_ID],
    displayName: "Python + Jupyter"
});
var RenderOutputType;
(function(RenderOutputType) {
    RenderOutputType[RenderOutputType["Html"] = 0] = "Html";
    RenderOutputType[RenderOutputType["Extension"] = 1] = "Extension";
})(RenderOutputType || (RenderOutputType = {}));
var ScrollToRevealBehavior;
(function(ScrollToRevealBehavior) {
    ScrollToRevealBehavior[ScrollToRevealBehavior["fullCell"] = 0] = "fullCell";
    ScrollToRevealBehavior[ScrollToRevealBehavior["firstLine"] = 1] = "firstLine";
})(ScrollToRevealBehavior || (ScrollToRevealBehavior = {}));
var CellLayoutState;
(function(CellLayoutState) {
    CellLayoutState[CellLayoutState["Uninitialized"] = 0] = "Uninitialized";
    CellLayoutState[CellLayoutState["Estimated"] = 1] = "Estimated";
    CellLayoutState[CellLayoutState["FromCache"] = 2] = "FromCache";
    CellLayoutState[CellLayoutState["Measured"] = 3] = "Measured";
})(CellLayoutState || (CellLayoutState = {}));
var CellLayoutContext;
(function(CellLayoutContext) {
    CellLayoutContext[CellLayoutContext["Fold"] = 0] = "Fold";
})(CellLayoutContext || (CellLayoutContext = {}));
var NotebookOverviewRulerLane;
(function(NotebookOverviewRulerLane) {
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Left"] = 1] = "Left";
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Center"] = 2] = "Center";
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Right"] = 4] = "Right";
    NotebookOverviewRulerLane[NotebookOverviewRulerLane["Full"] = 7] = "Full";
})(NotebookOverviewRulerLane || (NotebookOverviewRulerLane = {}));
function isNotebookCellDecoration(obj) {
    return !!obj && typeof obj.handle === "number";
}
var CellRevealType;
(function(CellRevealType) {
    CellRevealType[CellRevealType["Default"] = 1] = "Default";
    CellRevealType[CellRevealType["Top"] = 2] = "Top";
    CellRevealType[CellRevealType["Center"] = 3] = "Center";
    CellRevealType[CellRevealType["CenterIfOutsideViewport"] = 4] = "CenterIfOutsideViewport";
    CellRevealType[CellRevealType["NearTopIfOutsideViewport"] = 5] = "NearTopIfOutsideViewport";
    CellRevealType[CellRevealType["FirstLineIfOutsideViewport"] = 6] = "FirstLineIfOutsideViewport";
})(CellRevealType || (CellRevealType = {}));
var CellRevealRangeType;
(function(CellRevealRangeType) {
    CellRevealRangeType[CellRevealRangeType["Default"] = 1] = "Default";
    CellRevealRangeType[CellRevealRangeType["Center"] = 2] = "Center";
    CellRevealRangeType[CellRevealRangeType["CenterIfOutsideViewport"] = 3] = "CenterIfOutsideViewport";
})(CellRevealRangeType || (CellRevealRangeType = {}));
var CellEditState;
(function(CellEditState) {
    CellEditState[CellEditState["Preview"] = 0] = "Preview";
    CellEditState[CellEditState["Editing"] = 1] = "Editing";
})(CellEditState || (CellEditState = {}));
var CellFocusMode;
(function(CellFocusMode) {
    CellFocusMode[CellFocusMode["Container"] = 0] = "Container";
    CellFocusMode[CellFocusMode["Editor"] = 1] = "Editor";
    CellFocusMode[CellFocusMode["Output"] = 2] = "Output";
    CellFocusMode[CellFocusMode["ChatInput"] = 3] = "ChatInput";
})(CellFocusMode || (CellFocusMode = {}));
var CursorAtBoundary;
(function(CursorAtBoundary) {
    CursorAtBoundary[CursorAtBoundary["None"] = 0] = "None";
    CursorAtBoundary[CursorAtBoundary["Top"] = 1] = "Top";
    CursorAtBoundary[CursorAtBoundary["Bottom"] = 2] = "Bottom";
    CursorAtBoundary[CursorAtBoundary["Both"] = 3] = "Both";
})(CursorAtBoundary || (CursorAtBoundary = {}));
var CursorAtLineBoundary;
(function(CursorAtLineBoundary) {
    CursorAtLineBoundary[CursorAtLineBoundary["None"] = 0] = "None";
    CursorAtLineBoundary[CursorAtLineBoundary["Start"] = 1] = "Start";
    CursorAtLineBoundary[CursorAtLineBoundary["End"] = 2] = "End";
    CursorAtLineBoundary[CursorAtLineBoundary["Both"] = 3] = "Both";
})(CursorAtLineBoundary || (CursorAtLineBoundary = {}));
function getNotebookEditorFromEditorPane(editorPane) {
    if (!editorPane) {
        return;
    }
    if (editorPane.getId() === NOTEBOOK_EDITOR_ID) {
        return editorPane.getControl();
    }
    if (editorPane.getId() === NOTEBOOK_DIFF_EDITOR_ID) {
        return editorPane.getControl().inlineNotebookEditor;
    }
    const input = editorPane.input;
    const isCompositeNotebook = input && isCompositeNotebookEditorInput(input);
    if (isCompositeNotebook) {
        return editorPane.getControl()?.notebookEditor;
    }
    return undefined;
}
function expandCellRangesWithHiddenCells(editor, ranges) {
    const indexes = cellRangesToIndexes(ranges);
    const modelRanges = [];
    indexes.forEach(index => {
        const viewCell = editor.cellAt(index);
        if (!viewCell) {
            return;
        }
        const viewIndex = editor.getViewIndexByModelIndex(index);
        if (viewIndex < 0) {
            return;
        }
        const nextViewIndex = viewIndex + 1;
        const range = editor.getCellRangeFromViewRange(viewIndex, nextViewIndex);
        if (range) {
            modelRanges.push(range);
        }
    });
    return reduceCellRanges(modelRanges);
}
function cellRangeToViewCells(editor, ranges) {
    const cells = [];
    reduceCellRanges(ranges).forEach(range => {
        cells.push(...editor.getCellsInRange(range));
    });
    return cells;
}
var CellFoldingState;
(function(CellFoldingState) {
    CellFoldingState[CellFoldingState["None"] = 0] = "None";
    CellFoldingState[CellFoldingState["Expanded"] = 1] = "Expanded";
    CellFoldingState[CellFoldingState["Collapsed"] = 2] = "Collapsed";
})(CellFoldingState || (CellFoldingState = {}));

export { CHANGE_CELL_LANGUAGE, CellEditState, CellFocusMode, CellFoldingState, CellLayoutContext, CellLayoutState, CellRevealRangeType, CellRevealType, CursorAtBoundary, CursorAtLineBoundary, DETECT_CELL_LANGUAGE, EXECUTE_CELL_COMMAND_ID, EXPAND_CELL_INPUT_COMMAND_ID, EXPAND_CELL_OUTPUT_COMMAND_ID, IPYNB_VIEW_TYPE, JUPYTER_EXTENSION_ID, KERNEL_EXTENSIONS, KERNEL_RECOMMENDATIONS, NotebookOverviewRulerLane, QUIT_EDIT_CELL_COMMAND_ID, RenderOutputType, ScrollToRevealBehavior, cellRangeToViewCells, expandCellRangesWithHiddenCells, getNotebookEditorFromEditorPane, isNotebookCellDecoration };
