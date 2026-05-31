import { GroupIdentifier, ISaveOptions, IMoveResult, IRevertOptions, EditorInputCapabilities, Verbosity, IUntypedEditorInput, IFileLimitedEditorInputOptions } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { INotebookService } from "./notebookService.service.js";
import { URI } from "../../../../base/common/uri.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IFileDialogService } from "../../../../platform/dialogs/common/dialogs.service.js";
import { INotebookEditorModelResolverService } from "./notebookEditorModelResolverService.service.js";
import { IReference } from "../../../../base/common/lifecycle.js";
import { IResolvedNotebookEditorModel } from "./notebookCommon.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { AbstractResourceEditorInput } from "../../../common/editor/resourceEditorInput.js";
import { IResourceEditorInput } from "../../../../platform/editor/common/editor.js";
import { IWorkingCopyIdentifier } from "../../../services/workingCopy/common/workingCopy.js";
import { NotebookPerfMarks } from "./notebookPerformance.js";
import { IFilesConfigurationService } from "../../../services/filesConfiguration/common/filesConfigurationService.service.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.service.js";
import { ICustomEditorLabelService } from "../../../services/editor/common/customEditorLabelService.service.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.service.js";
import { IPathService } from "../../../services/path/common/pathService.service.js";
export interface NotebookEditorInputOptions {
    startDirty?: boolean;
    /**
     * backupId for webview
     */
    _backupId?: string;
    _workingCopy?: IWorkingCopyIdentifier;
}
export declare class NotebookEditorInput extends AbstractResourceEditorInput {
    readonly viewType: string;
    readonly options: NotebookEditorInputOptions;
    private readonly _notebookService;
    private readonly _notebookModelResolverService;
    private readonly _fileDialogService;
    protected readonly environmentService: IWorkbenchEnvironmentService;
    private readonly pathService;
    static getOrCreate(instantiationService: IInstantiationService, resource: URI, preferredResource: URI | undefined, viewType: string, options?: NotebookEditorInputOptions): NotebookEditorInput;
    static readonly ID: string;
    protected editorModelReference: IReference<IResolvedNotebookEditorModel> | null;
    private _sideLoadedListener;
    private _defaultDirtyState;
    constructor(resource: URI, preferredResource: URI | undefined, viewType: string, options: NotebookEditorInputOptions, _notebookService: INotebookService, _notebookModelResolverService: INotebookEditorModelResolverService, _fileDialogService: IFileDialogService, labelService: ILabelService, fileService: IFileService, filesConfigurationService: IFilesConfigurationService, extensionService: IExtensionService, editorService: IEditorService, textResourceConfigurationService: ITextResourceConfigurationService, customEditorLabelService: ICustomEditorLabelService, environmentService: IWorkbenchEnvironmentService, pathService: IPathService);
    dispose(): void;
    get typeId(): string;
    get editorId(): string | undefined;
    get capabilities(): EditorInputCapabilities;
    getDescription(verbosity?: Verbosity): string | undefined;
    isReadonly(): boolean | IMarkdownString;
    isDirty(): boolean;
    isSaving(): boolean;
    save(group: GroupIdentifier, options?: ISaveOptions): Promise<EditorInput | IUntypedEditorInput | undefined>;
    saveAs(group: GroupIdentifier, options?: ISaveOptions): Promise<IUntypedEditorInput | undefined>;
    private _suggestName;
    private ensureAbsolutePath;
    private ensureProviderExtension;
    rename(group: GroupIdentifier, target: URI): Promise<IMoveResult | undefined>;
    revert(_group: GroupIdentifier, options?: IRevertOptions): Promise<void>;
    resolve(_options?: IFileLimitedEditorInputOptions, perf?: NotebookPerfMarks): Promise<IResolvedNotebookEditorModel | null>;
    toUntyped(): IResourceEditorInput;
    matches(otherInput: EditorInput | IUntypedEditorInput): boolean;
}
export interface ICompositeNotebookEditorInput {
    readonly editorInputs: NotebookEditorInput[];
}
export declare function isCompositeNotebookEditorInput(thing: unknown): thing is ICompositeNotebookEditorInput;
export declare function isNotebookEditorInput(thing: EditorInput | undefined): thing is NotebookEditorInput;
