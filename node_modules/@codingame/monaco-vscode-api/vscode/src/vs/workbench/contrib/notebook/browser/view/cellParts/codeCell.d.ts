import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IDimension } from "../../../../../../editor/common/core/2d/dimension.js";
import { ILanguageService } from "../../../../../../editor/common/languages/language.service.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.service.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../../../platform/keybinding/common/keybinding.service.js";
import { INotebookExecutionStateService } from "../../../common/notebookExecutionStateService.service.js";
import { IActiveNotebookEditorDelegate } from "../../notebookBrowser.js";
import { CodeCellViewModel } from "../../viewModel/codeCellViewModel.js";
import { NotebookCellEditorPool } from "../notebookCellEditorPool.js";
import { CodeCellRenderTemplate } from "../notebookRenderingCommon.js";
import { INotebookLoggingService } from "../../../common/notebookLoggingService.service.js";
export declare class CodeCell extends Disposable {
    private readonly notebookEditor;
    private readonly viewCell;
    private readonly templateData;
    private readonly editorPool;
    private readonly instantiationService;
    private readonly keybindingService;
    private readonly languageService;
    private configurationService;
    private _outputContainerRenderer;
    private _inputCollapseElement;
    private _renderedInputCollapseState;
    private _renderedOutputCollapseState;
    private _isDisposed;
    private readonly cellParts;
    private _collapsedExecutionIcon;
    private _cellEditorOptions;
    private _useNewApproachForEditorLayout;
    private _pointerDownInEditor;
    private _pointerDraggingInEditor;
    private readonly _cellLayout;
    private readonly _debug;
    constructor(notebookEditor: IActiveNotebookEditorDelegate, viewCell: CodeCellViewModel, templateData: CodeCellRenderTemplate, editorPool: NotebookCellEditorPool, instantiationService: IInstantiationService, keybindingService: IKeybindingService, languageService: ILanguageService, configurationService: IConfigurationService, notebookExecutionStateService: INotebookExecutionStateService, notebookLogService: INotebookLoggingService);
    private updateCodeCellOptions;
    private _pendingLayout;
    private updateForLayout;
    private updateForOutputHover;
    private updateForOutputFocus;
    private calculateInitEditorHeight;
    private initializeEditor;
    private updateForOutputs;
    private updateEditorOptions;
    private registerNotebookEditorListeners;
    private adjustEditorPosition;
    private registerViewCellLayoutChange;
    private registerCellEditorEventListeners;
    private _reigsterModelListeners;
    private registerMouseListener;
    private shouldPreserveEditor;
    private updateEditorForFocusModeChange;
    private updateForCollapseState;
    private _collapseInput;
    private _attachInputExpandButton;
    private _showInput;
    private _getRichText;
    private _getRichTextFromLineTokens;
    private _removeInputCollapsePreview;
    private _updateOutputInnerContainer;
    private _collapseOutput;
    private _showOutput;
    private initialViewUpdateExpanded;
    private layoutEditor;
    private onCellWidthChange;
    private onCellEditorHeightChange;
    relayoutCell(): void;
    dispose(): void;
}
type CellLayoutChangeReason = "nbLayoutChange" | "nbDidScroll" | "viewCellLayoutChange" | "init" | "onDidChangeCursorSelection" | "onDidContentSizeChange" | "onDidResolveTextModel";
export declare class CodeCellLayout {
    private readonly _enabled;
    private readonly notebookEditor;
    private readonly viewCell;
    private readonly templateData;
    private readonly _logService;
    private readonly _initialEditorDimension;
    private _editorVisibility?;
    get editorVisibility(): "Full" | "Top Clipped" | "Bottom Clipped" | "Full (Small Viewport)" | "Invisible" | undefined;
    private _isUpdatingLayout?;
    get isUpdatingLayout(): boolean | undefined;
    _previousScrollBottom?: number;
    _lastChangedEditorScrolltop?: number;
    private _initialized;
    private _pointerDown;
    private _establishedContentHeight?;
    constructor(_enabled: boolean, notebookEditor: IActiveNotebookEditorDelegate, viewCell: CodeCellViewModel, templateData: CodeCellRenderTemplate, _logService: {
        debug: (output: string) => void;
    }, _initialEditorDimension: IDimension);
    setPointerDown(isDown: boolean): void;
    /**
     * Dynamically lays out the code cell's Monaco editor to simulate a "sticky" run/exec area while
     * constraining the visible editor height to the notebook viewport. It adjusts two things:
     *  - The absolute `top` offset of the editor part inside the cell (so the run / execution order
     *    area remains visible for a limited vertical travel band ~45px).
     *  - The editor's layout height plus the editor's internal scroll position (`editorScrollTop`) to
     *    crop content when the cell is partially visible (top or bottom clipped) or when content is
     *    taller than the viewport.
     *
     * Additional invariants:
     *  - Content height stability: once the layout has been initialized, scroll-driven re-layouts can
     *    observe transient Monaco content heights that reflect the current clipped layout (rather than
     *    the full input height). To keep the notebook list layout stable (avoiding overlapping cells
     *    while navigating/scrolling), we store the actual content height in `_establishedContentHeight`
     *    and reuse it for scroll-driven relayouts. This prevents the editor from shrinking back to its
     *    initial height after content has been added (e.g., pasting text) or when Monaco reports a
     *    transient smaller content height while the cell is clipped.
     *
     *    We refresh `_establishedContentHeight` when the editor's content size changes
     *    (`onDidContentSizeChange`) and also when width/layout changes can affect wrapping-driven height
     *    (`viewCellLayoutChange`/`nbLayoutChange`).
     *  - Pointer-drag gating: while the user is holding the mouse button down in the editor (drag
     *    selection or potential drag selection), we avoid programmatic `editor.setScrollTop(...)` updates
     *    to prevent selection/scroll feedback loops and "stuck selection" behavior.
     *
     * ---------------------------------------------------------------------------
     * SECTION 1. OVERALL NOTEBOOK VIEW (EACH CELL HAS AN 18px GAP ABOVE IT)
     * Legend:
     *   GAP (between cells & before first cell) ............. 18px
     *   CELL PADDING (top & bottom inside cell) ............. 6px
     *   STATUS BAR HEIGHT (typical) ......................... 22px
     *   LINE HEIGHT (logic clamp) ........................... 21px
     *   BORDER/OUTLINE HEIGHT (visual conceal adjustment) ... 1px
     *   EDITOR_HEIGHT (example visible editor) .............. 200px (capped by viewport)
     *   EDITOR_CONTENT_HEIGHT (example full content) ........ 380px (e.g. 50 lines)
     *   extraOffset = -(CELL_PADDING + BORDER_HEIGHT) ....... -7
     *
     *   (The list ensures the editor's laid out height never exceeds viewport height.)
     *
     *   ┌────────────────────────────── Notebook Viewport (scrolling container) ────────────────────────────┐
     *   │ (scrollTop)                                                                                       │
     *   │                                                                                                   │
     *   │  18px GAP (top spacing before first cell)                                                         │
     *   │  ▼                                                                                                │
     *   │  ┌──────── Cell A Outer Container ────────────────────────────────────────────────────────────┐   │
     *   │  │ ▲ 6px top padding                                                                          │   │
     *   │  │ │                                                                                          │   │
     *   │  │ │  ┌─ Execution Order / Run Column (~45px vertical travel band)─┐  ┌─ Editor Part ───────┐ │   │
     *   │  │ │  │ (Run button, execution # label)                            │  │ Visible Lines ...   │ │   │
     *   │  │ │  │                                                            │  │                     │ │   │
     *   │  │ │  │                                                            │  │ EDITOR_HEIGHT=200px │ │   │
     *   │  │ │  │                                                            │  │ (Content=380px)     │ │   │
     *   │  │ │  └────────────────────────────────────────────────────────────┘  └─────────────────────┘ │   │
     *   │  │ │                                                                                          │   │
     *   │  │ │  ┌─ Status Bar (22px) ─────────────────────────────────────────────────────────────────┐ │   │
     *   │  │ │  │ language | indent | selection info | kernel/status bits ...                         │ │   │
     *   │  │ │  └─────────────────────────────────────────────────────────────────────────────────────┘ │   │
     *   │  │ │                                                                                          │   │
     *   │  │ ▼ 6px bottom padding                                                                       │   │
     *   │  └────────────────────────────────────────────────────────────────────────────────────────────┘   │
     *   │  18px GAP                                                                                         │
     *   │  ┌──────── Cell B Outer Container ────────────────────────────────────────────────────────────┐   │
     *   │  │ (same structure as Cell A)                                                                 │   │
     *   │  └────────────────────────────────────────────────────────────────────────────────────────────┘   │
     *   │                                                                                                   │
     *   │ (scrollBottom)                                                                                    │
     *   └───────────────────────────────────────────────────────────────────────────────────────────────────┘
     *
     * SECTION 2. SINGLE CELL STRUCTURE (VERTICAL LAYERS)
     *
     *   Inter-Cell GAP (18px)
     *   ┌─────────────────────────────── Cell Wrapper (<li>) ──────────────────────────────┐
     *   │ ┌──────────────────────────── .cell-inner-container ───────────────────────────┐ │
     *   │ │ 6px top padding                                                              │ │
     *   │ │                                                                              │ │
     *   │ │ ┌─ Left Gutter (Run / Exec / Focus Border) ─┬──────── Editor Part ─────────┐ │ │
     *   │ │ │  Sticky vertical travel (~45px allowance) │  (Monaco surface)            │ │ │
     *   │ │ │                                         │  Visible height 200px          │ │ │
     *   │ │ │                                         │  Content height 380px          │ │ │
     *   │ │ └─────────────────────────────────────────┴────────────────────────────────┘ │ │
     *   │ │                                                                              │ │
     *   │ │ ┌─ Status Bar (22px) ──────────────────────────────────────────────────────┐ │ │
     *   │ │ │ language | indent | selection | kernel | state                           │ │ │
     *   │ │ └──────────────────────────────────────────────────────────────────────────┘ │ │
     *   │ │ 6px bottom padding                                                           │ │
     *   │ └──────────────────────────────────────────────────────────────────────────────┘ │
     *   │ (Outputs region begins at outputContainerOffset below input area)                │
     *   └──────────────────────────────────────────────────────────────────────────────────┘
     */
    layoutEditor(reason: CellLayoutChangeReason): void;
}
export {};
