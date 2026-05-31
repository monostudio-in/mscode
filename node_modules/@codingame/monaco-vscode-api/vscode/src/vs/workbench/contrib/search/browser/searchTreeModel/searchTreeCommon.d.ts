import { Range } from "../../../../../editor/common/core/range.js";
import { IFileMatch, ISearchComplete, ISearchProgressItem, ISearchRange, ITextQuery, ITextSearchQuery, ITextSearchResult } from "../../../../services/search/common/search.js";
import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { URI } from "../../../../../base/common/uri.js";
import { ITextModel } from "../../../../../editor/common/model.js";
import { IFileStatWithPartialMetadata } from "../../../../../platform/files/common/files.js";
import { IFileService } from "../../../../../platform/files/common/files.service.js";
import { IProgress, IProgressStep } from "../../../../../platform/progress/common/progress.js";
import { ReplacePattern } from "@codingame/monaco-vscode-search-service-override/vscode/vs/workbench/services/search/common/replace";
import { NotebookEditorWidget } from "../../../notebook/browser/notebookEditorWidget.js";
import { RangeHighlightDecorations } from "./rangeDecorations.js";
import { Event } from "../../../../../base/common/event.js";
export type FileMatchOrMatch = ISearchTreeFileMatch | ISearchTreeMatch;
export type RenderableMatch = ITextSearchHeading | ISearchTreeFolderMatch | ISearchTreeFileMatch | ISearchTreeMatch;
export declare function arrayContainsElementOrParent(element: RenderableMatch, testArray: RenderableMatch[]): boolean;
export interface IChangeEvent {
    elements: ISearchTreeFileMatch[];
    added?: boolean;
    removed?: boolean;
    clearingAll?: boolean;
}
export declare enum SearchModelLocation {
    PANEL = 0,
    QUICK_ACCESS = 1
}
export declare const PLAIN_TEXT_SEARCH__RESULT_ID = "plainTextSearch";
export declare const AI_TEXT_SEARCH_RESULT_ID = "aiTextSearch";
export declare function createParentList(element: RenderableMatch): RenderableMatch[];
export declare const SEARCH_MODEL_PREFIX = "SEARCH_MODEL_";
export declare const SEARCH_RESULT_PREFIX = "SEARCH_RESULT_";
export declare const TEXT_SEARCH_HEADING_PREFIX = "TEXT_SEARCH_HEADING_";
export declare const FOLDER_MATCH_PREFIX = "FOLDER_MATCH_";
export declare const FILE_MATCH_PREFIX = "FILE_MATCH_";
export declare const MATCH_PREFIX = "MATCH_";
export declare function mergeSearchResultEvents(events: IChangeEvent[]): IChangeEvent;
export interface ISearchModel {
    readonly onReplaceTermChanged: Event<void>;
    readonly onSearchResultChanged: Event<IChangeEvent>;
    location: SearchModelLocation;
    id(): string;
    getAITextResultProviderName(): Promise<string>;
    isReplaceActive(): boolean;
    replaceActive: boolean;
    replacePattern: ReplacePattern | null;
    replaceString: string;
    preserveCase: boolean;
    searchResult: ISearchResult;
    aiSearch(onResultReported: (result: ISearchProgressItem | undefined) => void): Promise<ISearchComplete>;
    hasAIResults: boolean;
    hasPlainResults: boolean;
    search(query: ITextQuery, onProgress?: (result: ISearchProgressItem) => void, callerToken?: CancellationToken): {
        asyncResults: Promise<ISearchComplete>;
        syncResults: IFileMatch<URI>[];
    };
    cancelSearch(cancelledForNewSearch?: boolean): boolean;
    cancelAISearch(cancelledForNewSearch?: boolean): boolean;
    clearAiSearchResults(): void;
    dispose(): void;
}
export interface ISearchResult {
    readonly onChange: Event<IChangeEvent>;
    readonly searchModel: ISearchModel;
    readonly plainTextSearchResult: IPlainTextSearchHeading;
    readonly aiTextSearchResult: ITextSearchHeading;
    readonly children: ITextSearchHeading[];
    readonly hasChildren: boolean;
    readonly isDirty: boolean;
    query: ITextQuery | null;
    batchReplace(elementsToReplace: RenderableMatch[]): Promise<void>;
    batchRemove(elementsToRemove: RenderableMatch[]): void;
    folderMatches(ai?: boolean): ISearchTreeFolderMatch[];
    add(allRaw: IFileMatch[], searchInstanceID: string, ai: boolean, silent?: boolean): void;
    clear(): void;
    remove(matches: ISearchTreeFileMatch | ISearchTreeFolderMatch | (ISearchTreeFileMatch | ISearchTreeFolderMatch)[], ai?: boolean): void;
    replace(match: ISearchTreeFileMatch): Promise<any>;
    matches(ai?: boolean): ISearchTreeFileMatch[];
    isEmpty(): boolean;
    fileCount(ignoreSemanticSearchResults?: boolean): number;
    count(ignoreSemanticSearchResults?: boolean): number;
    id(): string;
    setCachedSearchComplete(cachedSearchComplete: ISearchComplete | undefined, ai: boolean): void;
    getCachedSearchComplete(ai: boolean): ISearchComplete | undefined;
    toggleHighlights(value: boolean, ai?: boolean): void;
    getRangeHighlightDecorations(ai?: boolean): RangeHighlightDecorations;
    replaceAll(progress: IProgress<IProgressStep>): Promise<any>;
    setAIQueryUsingTextQuery(query?: ITextQuery | null): void;
    dispose(): void;
}
export interface ITextSearchHeading {
    readonly onChange: Event<IChangeEvent>;
    resource: URI | null;
    hidden: boolean;
    cachedSearchComplete: ISearchComplete | undefined;
    hide(): void;
    readonly isAIContributed: boolean;
    id(): string;
    parent(): ISearchResult;
    readonly hasChildren: boolean;
    name(): string;
    readonly isDirty: boolean;
    getFolderMatch(resource: URI): ISearchTreeFolderMatch | undefined;
    add(allRaw: IFileMatch[], searchInstanceID: string, ai: boolean, silent?: boolean): void;
    remove(matches: ISearchTreeFileMatch | ISearchTreeFolderMatch | (ISearchTreeFileMatch | ISearchTreeFolderMatch)[], ai?: boolean): void;
    groupFilesByFolder(fileMatches: ISearchTreeFileMatch[]): {
        byFolder: Map<URI, ISearchTreeFileMatch[]>;
        other: ISearchTreeFileMatch[];
    };
    isEmpty(): boolean;
    findFolderSubstr(resource: URI): ISearchTreeFolderMatch | undefined;
    query: ITextSearchQuery | null;
    folderMatches(): ISearchTreeFolderMatch[];
    matches(): ISearchTreeFileMatch[];
    showHighlights: boolean;
    toggleHighlights(value: boolean): void;
    rangeHighlightDecorations: RangeHighlightDecorations;
    fileCount(): number;
    count(): number;
    clear(clearAll: boolean): void;
    dispose(): void;
}
export interface IPlainTextSearchHeading extends ITextSearchHeading {
    replace(match: ISearchTreeFileMatch): Promise<any>;
    replaceAll(progress: IProgress<IProgressStep>): Promise<any>;
}
export interface ISearchTreeFolderMatch {
    readonly onChange: Event<IChangeEvent>;
    readonly onDispose: Event<void>;
    id(): string;
    resource: URI | null;
    index(): number;
    name(): string;
    count(): number;
    hasChildren: boolean;
    parent(): ISearchTreeFolderMatch | ITextSearchHeading;
    matches(): (ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource)[];
    allDownstreamFileMatches(): ISearchTreeFileMatch[];
    remove(matches: ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource | (ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource)[]): void;
    addFileMatch(raw: IFileMatch[], silent: boolean, searchInstanceID: string): void;
    isEmpty(): boolean;
    clear(clearingAll?: boolean): void;
    showHighlights: boolean;
    searchModel: ISearchModel;
    query: ITextSearchQuery | null;
    replace(match: ISearchTreeFileMatch): Promise<any>;
    replacingAll: boolean;
    bindModel(model: ITextModel): void;
    getDownstreamFileMatch(uri: URI): ISearchTreeFileMatch | null;
    replaceAll(): Promise<any>;
    recursiveFileCount(): number;
    doRemoveFile(fileMatches: ISearchTreeFileMatch[], dispose?: boolean, trigger?: boolean, keepReadonly?: boolean): void;
    unbindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): void;
    bindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): Promise<void>;
    unbindNotebookEditorWidget(editor: NotebookEditorWidget, resource: URI): void;
    hasOnlyReadOnlyMatches(): boolean;
    fileMatchesIterator(): IterableIterator<ISearchTreeFileMatch>;
    folderMatchesIterator(): IterableIterator<ISearchTreeFolderMatchWithResource>;
    recursiveFileCount(): number;
    recursiveMatchCount(): number;
    dispose(): void;
    isAIContributed(): boolean;
}
export interface ISearchTreeFolderMatchWithResource extends ISearchTreeFolderMatch {
    resource: URI;
}
export interface ISearchTreeFolderMatchWorkspaceRoot extends ISearchTreeFolderMatchWithResource {
    createAndConfigureFileMatch(rawFileMatch: IFileMatch<URI>, searchInstanceID: string): ISearchTreeFileMatch;
}
export interface ISearchTreeFolderMatchNoRoot extends ISearchTreeFolderMatch {
    createAndConfigureFileMatch(rawFileMatch: IFileMatch<URI>, searchInstanceID: string): ISearchTreeFileMatch;
}
export interface ISearchTreeFileMatch {
    id(): string;
    resource: URI;
    onChange: Event<{
        didRemove?: boolean;
        forceUpdateModel?: boolean;
    }>;
    hasChildren: boolean;
    readonly onDispose: Event<void>;
    name(): string;
    count(): number;
    hasOnlyReadOnlyMatches(): boolean;
    matches(): ISearchTreeMatch[];
    updateHighlights(): void;
    getSelectedMatch(): ISearchTreeMatch | null;
    parent(): ISearchTreeFolderMatch;
    bindModel(model: ITextModel): void;
    hasReadonlyMatches(): boolean;
    addContext(results: ITextSearchResult[] | undefined): void;
    add(match: ISearchTreeMatch, trigger?: boolean): void;
    replace(toReplace: ISearchTreeMatch): Promise<void>;
    remove(matches: ISearchTreeMatch | (ISearchTreeMatch[])): void;
    setSelectedMatch(match: ISearchTreeMatch | null): void;
    fileStat: IFileStatWithPartialMetadata | undefined;
    resolveFileStat(fileService: IFileService): Promise<void>;
    textMatches(): ISearchTreeMatch[];
    readonly context: Map<number, string>;
    readonly closestRoot: ISearchTreeFolderMatchWorkspaceRoot | null;
    isMatchSelected(match: ISearchTreeMatch): boolean;
    dispose(): void;
}
export interface ISearchTreeMatch {
    id(): string;
    parent(): ISearchTreeFileMatch;
    text(): string;
    range(): Range;
    preview(): {
        before: string;
        fullBefore: string;
        inside: string;
        after: string;
    };
    replaceString: string;
    fullMatchText(includeSurrounding?: boolean): string;
    rangeInPreview(): ISearchRange;
    fullPreviewLines(): string[];
    getMatchString(): string;
    isReadonly: boolean;
}
export declare function isSearchModel(obj: any): obj is ISearchModel;
export declare function isSearchResult(obj: any): obj is ISearchResult;
export declare function isTextSearchHeading(obj: any): obj is ITextSearchHeading;
export declare function isPlainTextSearchHeading(obj: any): obj is IPlainTextSearchHeading;
export declare function isSearchTreeFolderMatch(obj: any): obj is ISearchTreeFolderMatch;
export declare function isSearchTreeFolderMatchWithResource(obj: any): obj is ISearchTreeFolderMatchWithResource;
export declare function isSearchTreeFolderMatchWorkspaceRoot(obj: any): obj is ISearchTreeFolderMatchWorkspaceRoot;
export declare function isSearchTreeFolderMatchNoRoot(obj: any): obj is ISearchTreeFolderMatchNoRoot;
export declare function isSearchTreeFileMatch(obj: any): obj is ISearchTreeFileMatch;
export declare function isSearchTreeMatch(obj: any): obj is ISearchTreeMatch;
export declare function isSearchHeader(obj: any): boolean;
export declare function getFileMatches(matches: (ISearchTreeFileMatch | ISearchTreeFolderMatchWithResource)[]): ISearchTreeFileMatch[];
