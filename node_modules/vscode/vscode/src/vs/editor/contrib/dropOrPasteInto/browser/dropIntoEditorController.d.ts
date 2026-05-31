import { IAction } from "../../../../base/common/actions.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { ITreeViewsDnDService } from "../../../common/services/treeViewsDndService.service.js";
export declare const dropAsPreferenceConfig = "editor.dropIntoEditor.preferences";
export declare const changeDropTypeCommandId = "editor.changeDropType";
export declare const dropWidgetVisibleCtx: RawContextKey<boolean>;
export declare class DropIntoEditorController extends Disposable implements IEditorContribution {
    private readonly _configService;
    private readonly _languageFeaturesService;
    private readonly _treeViewsDragAndDropService;
    static readonly ID = "editor.contrib.dropIntoEditorController";
    static get(editor: ICodeEditor): DropIntoEditorController | null;
    static setConfigureDefaultAction(action: IAction): void;
    private static _configureDefaultAction?;
    /**
     * Global tracking the current drop operation.
     *
     * TODO: figure out how to make this work with multiple windows
     */
    private static _currentDropOperation?;
    private readonly _dropProgressManager;
    private readonly _postDropWidgetManager;
    private readonly treeItemsTransfer;
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, _configService: IConfigurationService, _languageFeaturesService: ILanguageFeaturesService, _treeViewsDragAndDropService: ITreeViewsDnDService);
    clearWidgets(): void;
    changeDropType(): void;
    private onDropIntoEditor;
    private getDropEdits;
    private getInitialActiveEditIndex;
    private extractDataTransferData;
}
