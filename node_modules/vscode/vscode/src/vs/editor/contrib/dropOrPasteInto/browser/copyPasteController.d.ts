import { IAction } from "../../../../base/common/actions.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.service.js";
import { ICommandService } from "../../../../platform/commands/common/commands.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
import { IProgressService } from "../../../../platform/progress/common/progress.service.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.service.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IBulkEditService } from "../../../browser/services/bulkEditService.service.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
export declare const changePasteTypeCommandId = "editor.changePasteType";
export declare const pasteAsPreferenceConfig = "editor.pasteAs.preferences";
export declare const pasteWidgetVisibleCtx: RawContextKey<boolean>;
export type PastePreference = {
    readonly only: HierarchicalKind;
} | {
    readonly preferences: readonly HierarchicalKind[];
} | {
    readonly providerId: string;
};
export declare class CopyPasteController extends Disposable implements IEditorContribution {
    private readonly _logService;
    private readonly _bulkEditService;
    private readonly _clipboardService;
    private readonly _commandService;
    private readonly _configService;
    private readonly _languageFeaturesService;
    private readonly _quickInputService;
    private readonly _progressService;
    static readonly ID = "editor.contrib.copyPasteActionController";
    static get(editor: ICodeEditor): CopyPasteController | null;
    static setConfigureDefaultAction(action: IAction): void;
    private static _configureDefaultAction?;
    /**
     * Global tracking the last copy operation.
     *
     * This is shared across all editors so that you can copy and paste between groups.
     *
     * TODO: figure out how to make this work with multiple windows
     */
    private static _currentCopyOperation?;
    private readonly _editor;
    private _currentPasteOperation?;
    private _pasteAsActionContext?;
    private readonly _pasteProgressManager;
    private readonly _postPasteWidgetManager;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, _logService: ILogService, _bulkEditService: IBulkEditService, _clipboardService: IClipboardService, _commandService: ICommandService, _configService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _quickInputService: IQuickInputService, _progressService: IProgressService);
    changePasteType(): void;
    pasteAs(preferred?: PastePreference): Promise<void>;
    clearWidgets(): void;
    private isPasteAsEnabled;
    finishedPaste(): Promise<void>;
    private handleCopy;
    private handlePaste;
    private showPasteAsNoEditMessage;
    private doPasteInline;
    private showPasteAsPick;
    private setCopyMetadata;
    private fetchCopyMetadata;
    private mergeInDataFromCopy;
    private getPasteEdits;
    private applyDefaultPasteHandler;
    /**
     * Filter out providers if they:
     * - Don't handle any of the data transfer types we have
     * - Don't match the preferred paste kind
     */
    private isSupportedPasteProvider;
    private providerMatchesPreference;
    private getInitialActiveEditIndex;
}
