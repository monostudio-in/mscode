
import { RawContextKey, ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { NOTEBOOK_EDITOR_ID, INTERACTIVE_WINDOW_EDITOR_ID, REPL_EDITOR_ID } from './notebookCommon.js';

const HAS_OPENED_NOTEBOOK = ( new RawContextKey("userHasOpenedNotebook", false));
const KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED = ( new RawContextKey("notebookFindWidgetFocused", false));
const InteractiveWindowOpen = ( new RawContextKey("interactiveWindowOpen", false));
const MOST_RECENT_REPL_EDITOR = ( new RawContextKey("mostRecentReplEditor", undefined));
const NOTEBOOK_IS_ACTIVE_EDITOR = ( ContextKeyExpr.equals("activeEditor", NOTEBOOK_EDITOR_ID));
const INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR = ( ContextKeyExpr.equals("activeEditor", INTERACTIVE_WINDOW_EDITOR_ID));
const REPL_NOTEBOOK_IS_ACTIVE_EDITOR = ( ContextKeyExpr.equals("activeEditor", REPL_EDITOR_ID));
const NOTEBOOK_OR_COMPOSITE_IS_ACTIVE_EDITOR = ( ContextKeyExpr.or(
    NOTEBOOK_IS_ACTIVE_EDITOR,
    INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR,
    REPL_NOTEBOOK_IS_ACTIVE_EDITOR
));
const IS_COMPOSITE_NOTEBOOK = ( new RawContextKey("isCompositeNotebook", false));
const NOTEBOOK_EDITOR_FOCUSED = ( new RawContextKey("notebookEditorFocused", false));
const NOTEBOOK_CELL_LIST_FOCUSED = ( new RawContextKey("notebookCellListFocused", false));
const NOTEBOOK_OUTPUT_FOCUSED = ( new RawContextKey("notebookOutputFocused", false));
const NOTEBOOK_OUTPUT_INPUT_FOCUSED = ( new RawContextKey("notebookOutputInputFocused", false));
const NOTEBOOK_EDITOR_EDITABLE = ( new RawContextKey("notebookEditable", true));
const NOTEBOOK_HAS_RUNNING_CELL = ( new RawContextKey("notebookHasRunningCell", false));
const NOTEBOOK_HAS_SOMETHING_RUNNING = ( new RawContextKey("notebookHasSomethingRunning", false));
const NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON = ( new RawContextKey("notebookUseConsolidatedOutputButton", false));
const NOTEBOOK_CELL_TOOLBAR_LOCATION = ( new RawContextKey("notebookCellToolbarLocation", "left"));
const NOTEBOOK_CURSOR_NAVIGATION_MODE = ( new RawContextKey("notebookCursorNavigationMode", false));
const NOTEBOOK_LAST_CELL_FAILED = ( new RawContextKey("notebookLastCellFailed", false));
const NOTEBOOK_VIEW_TYPE = ( new RawContextKey("notebookType", undefined));
const NOTEBOOK_CELL_TYPE = ( new RawContextKey("notebookCellType", undefined));
const NOTEBOOK_CELL_EDITABLE = ( new RawContextKey("notebookCellEditable", false));
const NOTEBOOK_CELL_FOCUSED = ( new RawContextKey("notebookCellFocused", false));
const NOTEBOOK_CELL_EDITOR_FOCUSED = ( new RawContextKey("notebookCellEditorFocused", false));
const NOTEBOOK_CELL_MARKDOWN_EDIT_MODE = ( new RawContextKey("notebookCellMarkdownEditMode", false));
const NOTEBOOK_CELL_LINE_NUMBERS = ( new RawContextKey("notebookCellLineNumbers", "inherit"));
const NOTEBOOK_CELL_EXECUTION_STATE = ( new RawContextKey("notebookCellExecutionState", undefined));
const NOTEBOOK_CELL_EXECUTING = ( new RawContextKey("notebookCellExecuting", false));
const NOTEBOOK_CELL_HAS_OUTPUTS = ( new RawContextKey("notebookCellHasOutputs", false));
const NOTEBOOK_CELL_IS_FIRST_OUTPUT = ( new RawContextKey("notebookCellIsFirstOutput", false));
const NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS = ( new RawContextKey("hasHiddenOutputs", false));
const NOTEBOOK_CELL_OUTPUT_MIMETYPE = ( new RawContextKey("notebookCellOutputMimeType", undefined));
const NOTEBOOK_CELL_INPUT_COLLAPSED = ( new RawContextKey("notebookCellInputIsCollapsed", false));
const NOTEBOOK_CELL_OUTPUT_COLLAPSED = ( new RawContextKey("notebookCellOutputIsCollapsed", false));
const NOTEBOOK_CELL_RESOURCE = ( new RawContextKey("notebookCellResource", ""));
const NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS = ( new RawContextKey("notebookCellHasErrorDiagnostics", false));
const NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT = ( new RawContextKey("notebookCellOutputMimeTypeListForChat", []));
const NOTEBOOK_KERNEL = ( new RawContextKey("notebookKernel", undefined));
const NOTEBOOK_KERNEL_COUNT = ( new RawContextKey("notebookKernelCount", 0));
const NOTEBOOK_KERNEL_SOURCE_COUNT = ( new RawContextKey("notebookKernelSourceCount", 0));
const NOTEBOOK_KERNEL_SELECTED = ( new RawContextKey("notebookKernelSelected", false));
const NOTEBOOK_INTERRUPTIBLE_KERNEL = ( new RawContextKey("notebookInterruptibleKernel", false));
const NOTEBOOK_MISSING_KERNEL_EXTENSION = ( new RawContextKey("notebookMissingKernelExtension", false));
const NOTEBOOK_HAS_OUTPUTS = ( new RawContextKey("notebookHasOutputs", false));
const KERNEL_HAS_VARIABLE_PROVIDER = ( new RawContextKey("kernelHasVariableProvider", false));

export { HAS_OPENED_NOTEBOOK, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, IS_COMPOSITE_NOTEBOOK, InteractiveWindowOpen, KERNEL_HAS_VARIABLE_PROVIDER, KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED, MOST_RECENT_REPL_EDITOR, NOTEBOOK_CELL_EDITABLE, NOTEBOOK_CELL_EDITOR_FOCUSED, NOTEBOOK_CELL_EXECUTING, NOTEBOOK_CELL_EXECUTION_STATE, NOTEBOOK_CELL_FOCUSED, NOTEBOOK_CELL_HAS_ERROR_DIAGNOSTICS, NOTEBOOK_CELL_HAS_HIDDEN_OUTPUTS, NOTEBOOK_CELL_HAS_OUTPUTS, NOTEBOOK_CELL_INPUT_COLLAPSED, NOTEBOOK_CELL_IS_FIRST_OUTPUT, NOTEBOOK_CELL_LINE_NUMBERS, NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_CELL_MARKDOWN_EDIT_MODE, NOTEBOOK_CELL_OUTPUT_COLLAPSED, NOTEBOOK_CELL_OUTPUT_MIMETYPE, NOTEBOOK_CELL_OUTPUT_MIME_TYPE_LIST_FOR_CHAT, NOTEBOOK_CELL_RESOURCE, NOTEBOOK_CELL_TOOLBAR_LOCATION, NOTEBOOK_CELL_TYPE, NOTEBOOK_CURSOR_NAVIGATION_MODE, NOTEBOOK_EDITOR_EDITABLE, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_HAS_OUTPUTS, NOTEBOOK_HAS_RUNNING_CELL, NOTEBOOK_HAS_SOMETHING_RUNNING, NOTEBOOK_INTERRUPTIBLE_KERNEL, NOTEBOOK_IS_ACTIVE_EDITOR, NOTEBOOK_KERNEL, NOTEBOOK_KERNEL_COUNT, NOTEBOOK_KERNEL_SELECTED, NOTEBOOK_KERNEL_SOURCE_COUNT, NOTEBOOK_LAST_CELL_FAILED, NOTEBOOK_MISSING_KERNEL_EXTENSION, NOTEBOOK_OR_COMPOSITE_IS_ACTIVE_EDITOR, NOTEBOOK_OUTPUT_FOCUSED, NOTEBOOK_OUTPUT_INPUT_FOCUSED, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON, NOTEBOOK_VIEW_TYPE, REPL_NOTEBOOK_IS_ACTIVE_EDITOR };
