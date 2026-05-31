import { URI } from "../../../../base/common/uri.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { EditorInputCapabilities, IResourceMergeEditorInput, IRevertOptions, IUntypedEditorInput } from "../../../common/editor.js";
import { EditorInput, IEditorCloseHandler } from "../../../common/editor/editorInput.js";
import { ICustomEditorLabelService } from "../../../services/editor/common/customEditorLabelService.service.js";
import { AbstractTextResourceEditorInput } from "../../../common/editor/textResourceEditorInput.js";
import { IMergeEditorInputModel } from "./mergeEditorInputModel.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.service.js";
import { ILanguageSupport, ITextFileSaveOptions } from "../../../services/textfile/common/textfiles.js";
import { ITextFileService } from "../../../services/textfile/common/textfiles.service.js";
import { MergeEditorType } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/workbench/contrib/mergeEditor/browser/view/viewModel";
import { ILogService } from "../../../../platform/log/common/log.service.js";
export declare class MergeEditorInputData {
    readonly uri: URI;
    readonly title: string | undefined;
    readonly detail: string | undefined;
    readonly description: string | undefined;
    constructor(uri: URI, title: string | undefined, detail: string | undefined, description: string | undefined);
}
export declare class MergeEditorInput extends AbstractTextResourceEditorInput implements ILanguageSupport {
    readonly base: URI;
    readonly input1: MergeEditorInputData;
    readonly input2: MergeEditorInputData;
    readonly result: URI;
    private readonly _instaService;
    private readonly configurationService;
    private readonly logService;
    static readonly ID = "mergeEditor.Input";
    private _inputModel?;
    private _focusedEditor;
    closeHandler: IEditorCloseHandler;
    private get useWorkingCopy();
    constructor(base: URI, input1: MergeEditorInputData, input2: MergeEditorInputData, result: URI, _instaService: IInstantiationService, editorService: IEditorService, textFileService: ITextFileService, labelService: ILabelService, fileService: IFileService, configurationService: IConfigurationService, filesConfigurationService: IFilesConfigurationService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService, logService: ILogService);
    dispose(): void;
    get typeId(): string;
    get editorId(): string;
    get capabilities(): EditorInputCapabilities;
    getName(): string;
    private readonly mergeEditorModeFactory;
    resolve(): Promise<IMergeEditorInputModel>;
    accept(): Promise<void>;
    save(group: number, options?: ITextFileSaveOptions | undefined): Promise<IUntypedEditorInput | undefined>;
    toUntyped(): IResourceMergeEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    revert(group: number, options?: IRevertOptions): Promise<void>;
    isDirty(): boolean;
    setLanguageId(languageId: string, source?: string): void;
    /**
     * Updates the focused editor and triggers a name change event
     */
    updateFocusedEditor(editor: MergeEditorType): void;
}
