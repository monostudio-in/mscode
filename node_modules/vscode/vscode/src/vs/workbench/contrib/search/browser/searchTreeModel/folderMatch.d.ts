import { Emitter, Event } from "../../../../../base/common/event.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { ResourceMap } from "../../../../../base/common/map.js";
import { TernarySearchTree } from "../../../../../base/common/ternarySearchTree.js";
import { URI } from "../../../../../base/common/uri.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../../platform/label/common/label.service.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IReplaceService } from "../replace.service.js";
import { IFileMatch, ITextQuery } from "../../../../services/search/common/search.js";
import { FileMatchImpl } from "./fileMatch.js";
import { IChangeEvent, ISearchTreeFileMatch, ISearchTreeFolderMatch, ISearchTreeFolderMatchWithResource, ISearchTreeFolderMatchNoRoot, ISearchTreeFolderMatchWorkspaceRoot, ISearchModel, ISearchResult, ITextSearchHeading } from "./searchTreeCommon.js";
import { NotebookEditorWidget } from "../../../notebook/browser/notebookEditorWidget.js";
export declare class FolderMatchImpl extends Disposable implements ISearchTreeFolderMatch {
    protected _resource: URI | null;
    protected _index: number;
    protected _query: ITextQuery;
    private _parent;
    private _searchResult;
    private _closestRoot;
    private readonly replaceService;
    protected readonly instantiationService: IInstantiationService;
    protected readonly uriIdentityService: IUriIdentityService;
    protected _onChange: Emitter<IChangeEvent>;
    readonly onChange: Event<IChangeEvent>;
    private _onDispose;
    readonly onDispose: Event<void>;
    protected _fileMatches: ResourceMap<ISearchTreeFileMatch>;
    protected _folderMatches: ResourceMap<FolderMatchWithResourceImpl>;
    protected _folderMatchesMap: TernarySearchTree<URI, FolderMatchWithResourceImpl>;
    protected _unDisposedFileMatches: ResourceMap<ISearchTreeFileMatch>;
    protected _unDisposedFolderMatches: ResourceMap<FolderMatchWithResourceImpl>;
    private _replacingAll;
    private _name;
    private readonly _id;
    constructor(_resource: URI | null, _id: string, _index: number, _query: ITextQuery, _parent: ITextSearchHeading | FolderMatchImpl, _searchResult: ISearchResult, _closestRoot: ISearchTreeFolderMatchWorkspaceRoot | null, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    get searchModel(): ISearchModel;
    get showHighlights(): boolean;
    get closestRoot(): ISearchTreeFolderMatchWorkspaceRoot | null;
    set replacingAll(b: boolean);
    id(): string;
    get resource(): URI | null;
    index(): number;
    name(): string;
    parent(): ITextSearchHeading | FolderMatchImpl;
    isAIContributed(): boolean;
    get hasChildren(): boolean;
    bindModel(model: ITextModel): void;
    createIntermediateFolderMatch(resource: URI, id: string, index: number, query: ITextQuery, baseWorkspaceFolder: ISearchTreeFolderMatchWorkspaceRoot): FolderMatchWithResourceImpl;
    configureIntermediateMatch(folderMatch: FolderMatchWithResourceImpl): void;
    clear(clearingAll?: boolean): void;
    remove(matches: ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource | (ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource)[]): void;
    replace(match: FileMatchImpl): Promise<any>;
    replaceAll(): Promise<any>;
    matches(): (ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource)[];
    fileMatchesIterator(): IterableIterator<ISearchTreeFileMatch>;
    folderMatchesIterator(): IterableIterator<ISearchTreeFolderMatchWithResource>;
    isEmpty(): boolean;
    getDownstreamFileMatch(uri: URI): ISearchTreeFileMatch | null;
    allDownstreamFileMatches(): ISearchTreeFileMatch[];
    private fileCount;
    private folderCount;
    count(): number;
    recursiveFileCount(): number;
    recursiveMatchCount(): number;
    get query(): ITextQuery | null;
    doAddFile(fileMatch: ISearchTreeFileMatch): void;
    hasOnlyReadOnlyMatches(): boolean;
    protected uriHasParent(parent: URI, child: URI): boolean;
    private isInParentChain;
    getFolderMatch(resource: URI): FolderMatchWithResourceImpl | undefined;
    doAddFolder(folderMatch: FolderMatchWithResourceImpl): void;
    private batchReplace;
    onFileChange(fileMatch: ISearchTreeFileMatch, removed?: boolean): void;
    onFolderChange(folderMatch: FolderMatchWithResourceImpl, event: IChangeEvent): void;
    doRemoveFile(fileMatches: ISearchTreeFileMatch[], dispose?: boolean, trigger?: boolean, keepReadonly?: boolean): void;
    bindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): Promise<void>;
    addFileMatch(raw: IFileMatch[], silent: boolean, searchInstanceID: string): void;
    unbindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): void;
    disposeMatches(): void;
    dispose(): void;
}
export declare class FolderMatchWithResourceImpl extends FolderMatchImpl implements ISearchTreeFolderMatchWithResource {
    protected _normalizedResource: Lazy<URI>;
    constructor(_resource: URI, _id: string, _index: number, _query: ITextQuery, _parent: ITextSearchHeading | FolderMatchImpl, _searchResult: ISearchResult, _closestRoot: ISearchTreeFolderMatchWorkspaceRoot | null, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    get resource(): URI;
    get normalizedResource(): URI;
}
/**
 * FolderMatchWorkspaceRoot => folder for workspace root
 */
export declare class FolderMatchWorkspaceRootImpl extends FolderMatchWithResourceImpl implements ISearchTreeFolderMatchWorkspaceRoot {
    constructor(_resource: URI, _id: string, _index: number, _query: ITextQuery, _parent: ITextSearchHeading, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    private normalizedUriParent;
    private uriEquals;
    private createFileMatch;
    createAndConfigureFileMatch(rawFileMatch: IFileMatch<URI>, searchInstanceID: string): FileMatchImpl;
}
export declare class FolderMatchNoRootImpl extends FolderMatchImpl implements ISearchTreeFolderMatchNoRoot {
    constructor(_id: string, _index: number, _query: ITextQuery, _parent: ITextSearchHeading, replaceService: IReplaceService, instantiationService: IInstantiationService, labelService: ILabelService, uriIdentityService: IUriIdentityService);
    createAndConfigureFileMatch(rawFileMatch: IFileMatch, searchInstanceID: string): ISearchTreeFileMatch;
}
