import { ICodeEditor, IDiffEditor } from "../../editorBrowser.js";
import { EditorAction2, ServicesAccessor } from "../../editorExtensions.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { DiffEditorSelectionHunkToolbarContext } from "./features/gutterFeature.js";
import { URI } from "../../../../base/common/uri.js";
export declare class ToggleCollapseUnchangedRegions extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ToggleShowMovedCodeBlocks extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class ToggleUseInlineViewWhenSpaceIsLimited extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, ...args: unknown[]): void;
}
export declare class SwitchSide extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, arg?: {
        dryRun: boolean;
    }): unknown;
}
export declare class ExitCompareMove extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class CollapseAllUnchangedRegions extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class ShowAllUnchangedRegions extends EditorAction2 {
    constructor();
    runEditorCommand(accessor: ServicesAccessor, editor: ICodeEditor, ...args: unknown[]): void;
}
export declare class RevertHunkOrSelection extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, arg?: DiffEditorSelectionHunkToolbarContext): unknown;
    runViaCursorOrSelection(accessor: ServicesAccessor): unknown;
    runViaToolbarContext(accessor: ServicesAccessor, arg: DiffEditorSelectionHunkToolbarContext): unknown;
}
export declare class AccessibleDiffViewerNext extends Action2 {
    static id: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare class AccessibleDiffViewerPrev extends Action2 {
    static id: string;
    constructor();
    run(accessor: ServicesAccessor): void;
}
export declare function findDiffEditor(accessor: ServicesAccessor, originalUri: URI, modifiedUri: URI): IDiffEditor | null;
export declare function findFocusedDiffEditor(accessor: ServicesAccessor): IDiffEditor | null;
/**
 * If `editor` is the original or modified editor of a diff editor, it returns it.
 * It returns null otherwise.
 */
export declare function findDiffEditorContainingCodeEditor(accessor: ServicesAccessor, editor: ICodeEditor): IDiffEditor | null;
