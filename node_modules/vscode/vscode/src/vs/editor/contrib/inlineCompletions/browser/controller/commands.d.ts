import { Action2 } from "../../../../../platform/actions/common/actions.js";
import { ICodeEditor } from "../../../../browser/editorBrowser.js";
import { EditorAction, ServicesAccessor } from "../../../../browser/editorExtensions.js";
import { InlineCompletionsProvider } from "../../../../common/languages.js";
export declare class ShowNextInlineSuggestionAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class ShowPreviousInlineSuggestionAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare const providerIdSchemaUri = "vscode://schemas/inlineCompletionProviderIdArgs";
export declare function inlineCompletionProviderGetMatcher(provider: InlineCompletionsProvider): string[];
export declare class TriggerInlineSuggestionAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor, args: unknown): Promise<void>;
}
export declare class AcceptNextWordOfInlineCompletion extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptNextLineOfInlineCompletion extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptInlineCompletion extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptInlineCompletionAlternativeAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class JumpToNextInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class HideInlineCompletion extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class ToggleInlineCompletionShowCollapsed extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class DevExtractReproSample extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<any>;
}
