import { Disposable } from "../../base/common/lifecycle.js";
import { ICommandHandler } from "../../platform/commands/common/commands.js";
import { RawContextKey } from "../../platform/contextkey/common/contextkey.js";
import { IResourceEditorInput, ITextResourceEditorInput } from "../../platform/editor/common/editor.js";
import { IEditorPane, IUntitledTextResourceEditorInput, IUntypedEditorInput } from "../common/editor.js";
import { IEditorGroupsService } from "../services/editor/common/editorGroupsService.service.js";
import { PreferredGroup } from "../services/editor/common/editorService.js";
import { IEditorService } from "../services/editor/common/editorService.service.js";
export declare const inQuickPickContextKeyValue = "inQuickOpen";
export declare const InQuickPickContextKey: RawContextKey<boolean>;
export declare const inQuickPickContext: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
export declare const defaultQuickAccessContextKeyValue = "inFilesPicker";
export declare const defaultQuickAccessContext: import("../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
export interface IWorkbenchQuickAccessConfiguration {
    readonly workbench: {
        readonly commandPalette: {
            readonly history: number;
            readonly preserveInput: boolean;
            readonly showAskInChat: boolean;
            readonly experimental: {
                readonly suggestCommands: boolean;
                readonly enableNaturalLanguageSearch: boolean;
                readonly askChatLocation: "quickChat" | "chatView";
            };
        };
        readonly quickOpen: {
            readonly enableExperimentalNewVersion: boolean;
            readonly preserveInput: boolean;
        };
    };
}
export declare function getQuickNavigateHandler(id: string, next?: boolean): ICommandHandler;
export declare class PickerEditorState extends Disposable {
    private readonly editorService;
    private readonly editorGroupsService;
    private editorViewState;
    private readonly openedTransientEditors;
    constructor(editorService: IEditorService, editorGroupsService: IEditorGroupsService);
    set(): void;
    /**
     * Open a transient editor such that it may be closed when the state is restored.
     * Note that, when the state is restored, if the editor is no longer transient, it will not be closed.
     */
    openTransientEditor(editor: IResourceEditorInput | ITextResourceEditorInput | IUntitledTextResourceEditorInput | IUntypedEditorInput, group?: PreferredGroup): Promise<IEditorPane | undefined>;
    restore(): Promise<void>;
    reset(): void;
    dispose(): void;
}
