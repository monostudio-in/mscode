import { IUntitledTextResourceEditorInput, IUntypedEditorInput, Verbosity } from "../../../common/editor.js";
import { EditorInput, IUntypedEditorOptions } from "../../../common/editor/editorInput.js";
import { AbstractTextResourceEditorInput } from "../../../common/editor/textResourceEditorInput.js";
import { IUntitledTextEditorModel } from "./untitledTextEditorModel.js";
import { EncodingMode, IEncodingSupport, ILanguageSupport } from "../../textfile/common/textfiles.js";
import { ITextFileService } from "../../textfile/common/textfiles.service.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { IEditorService } from "../../editor/common/editorService.service.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { IWorkbenchEnvironmentService } from "../../environment/common/environmentService.service.js";
import { IPathService } from "../../path/common/pathService.service.js";
import { IFilesConfigurationService } from "../../filesConfiguration/common/filesConfigurationService.service.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.service.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.service.js";
import { ICustomEditorLabelService } from "../../editor/common/customEditorLabelService.service.js";
/**
 * An editor input to be used for untitled text buffers.
 */
export declare class UntitledTextEditorInput extends AbstractTextResourceEditorInput implements IEncodingSupport, ILanguageSupport {
    protected model: IUntitledTextEditorModel;
    private readonly environmentService;
    private readonly pathService;
    private readonly textModelService;
    static readonly ID: string;
    get typeId(): string;
    get editorId(): string | undefined;
    private modelResolve;
    private readonly modelDisposables;
    private cachedUntitledTextEditorModelReference;
    constructor(model: IUntitledTextEditorModel, textFileService: ITextFileService, labelService: ILabelService, editorService: IEditorService, fileService: IFileService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService, filesConfigurationService: IFilesConfigurationService, textModelService: ITextModelService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService);
    private registerModelListeners;
    private onDidCreateUntitledModel;
    getName(): string;
    getDescription(verbosity?: Verbosity): string | undefined;
    getTitle(verbosity: Verbosity): string;
    isDirty(): boolean;
    getEncoding(): string | undefined;
    setEncoding(encoding: string, mode: EncodingMode): Promise<void>;
    get hasLanguageSetExplicitly(): boolean;
    get hasAssociatedFilePath(): boolean;
    setLanguageId(languageId: string, source?: string): void;
    getLanguageId(): string | undefined;
    resolve(): Promise<IUntitledTextEditorModel>;
    toUntyped(options?: IUntypedEditorOptions): IUntitledTextResourceEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
    dispose(): void;
    private disposeModelReference;
}
