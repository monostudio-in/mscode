import { CancellationToken } from "@codingame/monaco-vscode-api/vscode/vs/base/common/cancellation";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service";
import { IFileService } from "@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { ILabelService } from "@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { AuthInfo, Credentials } from "@codingame/monaco-vscode-api/vscode/vs/platform/request/common/request";
import { IRequestService } from "@codingame/monaco-vscode-api/vscode/vs/platform/request/common/request.service";
import { WorkspaceTrustRequestOptions } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspaceTrust";
import { IWorkspaceTrustRequestService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspaceTrust.service";
import { IWorkspaceTrustManagementService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspaceTrust.service";
import { IWorkspaceContextService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IFileQueryBuilderOptions, ITextQueryBuilderOptions } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/queryBuilder";
import { IEditorService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/editor/common/editorService.service";
import { IPatternInfo } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/search";
import { ISearchService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/search.service";
import { IWorkspaceEditingService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/workspaces/common/workspaceEditing.service";
import { ITextSearchComplete, MainThreadWorkspaceShape, ResourceTrustRequestOptionsDto } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IEditSessionIdentityService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/editSessions.service";
import { ICanonicalUriService } from "@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/canonicalUri.service";
import { ITextFileService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/textfile/common/textfiles.service";
export declare class MainThreadWorkspace extends Disposable implements MainThreadWorkspaceShape {
    private readonly _searchService;
    private readonly _contextService;
    private readonly _editSessionIdentityService;
    private readonly _canonicalUriService;
    private readonly _editorService;
    private readonly _workspaceEditingService;
    private readonly _notificationService;
    private readonly _requestService;
    private readonly _instantiationService;
    private readonly _labelService;
    private readonly _environmentService;
    private readonly _workspaceTrustManagementService;
    private readonly _workspaceTrustRequestService;
    private readonly _textFileService;
    private readonly _activeCancelTokens;
    private readonly _proxy;
    private readonly _queryBuilder;
    constructor(extHostContext: IExtHostContext, _searchService: ISearchService, _contextService: IWorkspaceContextService, _editSessionIdentityService: IEditSessionIdentityService, _canonicalUriService: ICanonicalUriService, _editorService: IEditorService, _workspaceEditingService: IWorkspaceEditingService, _notificationService: INotificationService, _requestService: IRequestService, _instantiationService: IInstantiationService, _labelService: ILabelService, _environmentService: IEnvironmentService, fileService: IFileService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _textFileService: ITextFileService);
    dispose(): void;
    $updateWorkspaceFolders(extensionName: string, index: number, deleteCount: number, foldersToAdd: {
        uri: UriComponents;
        name?: string;
    }[]): Promise<void>;
    private getStatusMessage;
    private _onDidChangeWorkspace;
    private getWorkspaceData;
    $startFileSearch(_includeFolder: UriComponents | null, options: IFileQueryBuilderOptions<UriComponents>, token: CancellationToken): Promise<UriComponents[] | null>;
    $startTextSearch(pattern: IPatternInfo, _folder: UriComponents | null, options: ITextQueryBuilderOptions<UriComponents>, requestId: number, token: CancellationToken): Promise<ITextSearchComplete | null>;
    $checkExists(folders: readonly UriComponents[], includes: string[], token: CancellationToken): Promise<boolean>;
    $save(uriComponents: UriComponents, options: {
        saveAs: boolean;
    }): Promise<UriComponents | undefined>;
    private _saveResultToUris;
    $saveAll(includeUntitled?: boolean): Promise<boolean>;
    $resolveProxy(url: string): Promise<string | undefined>;
    $lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    $lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    $loadCertificates(): Promise<string[]>;
    $requestResourceTrust(optionsDto: ResourceTrustRequestOptionsDto): Promise<boolean | undefined>;
    $requestWorkspaceTrust(options?: WorkspaceTrustRequestOptions): Promise<boolean | undefined>;
    $isResourceTrusted(resource: UriComponents): Promise<boolean>;
    private isWorkspaceTrusted;
    private _onDidGrantWorkspaceTrust;
    private _onDidChangeWorkspaceTrustedFolders;
    private registeredEditSessionProviders;
    $registerEditSessionIdentityProvider(handle: number, scheme: string): void;
    $unregisterEditSessionIdentityProvider(handle: number): void;
    private registeredCanonicalUriProviders;
    $registerCanonicalUriProvider(handle: number, scheme: string): void;
    $unregisterCanonicalUriProvider(handle: number): void;
    $resolveDecoding(resource: UriComponents | undefined, options?: {
        encoding: string;
    }): Promise<{
        preferredEncoding: string;
        guessEncoding: boolean;
        candidateGuessEncodings: string[];
    }>;
    $validateDetectedEncoding(resource: UriComponents | undefined, detectedEncoding: string, options?: {
        encoding?: string;
    }): Promise<string>;
    $resolveEncoding(resource: UriComponents | undefined, options?: {
        encoding: string;
    }): Promise<{
        encoding: string;
        addBOM: boolean;
    }>;
}
