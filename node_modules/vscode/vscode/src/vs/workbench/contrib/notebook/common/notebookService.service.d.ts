import { VSBufferReadableStream } from "../../../../base/common/buffer.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { SnapshotContext } from "../../../services/workingCopy/common/fileWorkingCopy.js";
import { NotebookCellTextModel } from "./model/notebookCellTextModel.js";
import { NotebookTextModel } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/model/notebookTextModel";
import { NotebookExtensionDescription, IOutputDto, IOrderedMimeType, INotebookRendererInfo, INotebookStaticPreloadInfo, INotebookContributionData } from "./notebookCommon.js";
import { NotebookProviderInfo } from "@codingame/monaco-vscode-notebook-service-override/vscode/vs/workbench/contrib/notebook/common/notebookProvider";
import { INotebookSerializer, SimpleNotebookProviderInfo } from "./notebookService.js";
export declare const INotebookService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INotebookService>;
export interface INotebookService {
    readonly _serviceBrand: undefined;
    canResolve(viewType: string): Promise<boolean>;
    readonly onAddViewType: Event<string>;
    readonly onWillRemoveViewType: Event<string>;
    readonly onDidChangeOutputRenderers: Event<void>;
    readonly onWillAddNotebookDocument: Event<NotebookTextModel>;
    readonly onDidAddNotebookDocument: Event<NotebookTextModel>;
    readonly onWillRemoveNotebookDocument: Event<NotebookTextModel>;
    readonly onDidRemoveNotebookDocument: Event<NotebookTextModel>;
    registerNotebookSerializer(viewType: string, extensionData: NotebookExtensionDescription, serializer: INotebookSerializer): IDisposable;
    withNotebookDataProvider(viewType: string): Promise<SimpleNotebookProviderInfo>;
    tryGetDataProviderSync(viewType: string): SimpleNotebookProviderInfo | undefined;
    getOutputMimeTypeInfo(textModel: NotebookTextModel, kernelProvides: readonly string[] | undefined, output: IOutputDto): readonly IOrderedMimeType[];
    getViewTypeProvider(viewType: string): string | undefined;
    getRendererInfo(id: string): INotebookRendererInfo | undefined;
    getRenderers(): INotebookRendererInfo[];
    getStaticPreloads(viewType: string): Iterable<INotebookStaticPreloadInfo>;
    /** Updates the preferred renderer for the given mimetype in the workspace. */
    updateMimePreferredRenderer(viewType: string, mimeType: string, rendererId: string, otherMimetypes: readonly string[]): void;
    saveMimeDisplayOrder(target: ConfigurationTarget): void;
    createNotebookTextModel(viewType: string, uri: URI, stream?: VSBufferReadableStream): Promise<NotebookTextModel>;
    createNotebookTextDocumentSnapshot(uri: URI, context: SnapshotContext, token: CancellationToken): Promise<VSBufferReadableStream>;
    restoreNotebookTextModelFromSnapshot(uri: URI, viewType: string, snapshot: VSBufferReadableStream): Promise<NotebookTextModel>;
    getNotebookTextModel(uri: URI): NotebookTextModel | undefined;
    getNotebookTextModels(): Iterable<NotebookTextModel>;
    listNotebookDocuments(): readonly NotebookTextModel[];
    /**	Register a notebook type that we will handle. The notebook editor will be registered for notebook types contributed by extensions */
    registerContributedNotebookType(viewType: string, data: INotebookContributionData): IDisposable;
    getContributedNotebookType(viewType: string): NotebookProviderInfo | undefined;
    getContributedNotebookTypes(resource?: URI): readonly NotebookProviderInfo[];
    hasSupportedNotebooks(resource: URI): boolean;
    getNotebookProviderResourceRoots(): URI[];
    setToCopy(items: NotebookCellTextModel[], isCopy: boolean): void;
    getToCopy(): {
        items: NotebookCellTextModel[];
        isCopy: boolean;
    } | undefined;
    clearEditorCache(): void;
}
