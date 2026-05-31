import { Event } from "../../../base/common/event.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { IWorkspaceTrustUriInfo, IWorkspaceTrustTransitionParticipant, type ResourceTrustRequestOptions, type WorkspaceTrustRequestOptions, type WorkspaceTrustUriResponse } from "./workspaceTrust.js";
export declare const IWorkspaceTrustEnablementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceTrustEnablementService>;
export interface IWorkspaceTrustEnablementService {
    readonly _serviceBrand: undefined;
    isWorkspaceTrustEnabled(): boolean;
}
export declare const IWorkspaceTrustManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceTrustManagementService>;
export interface IWorkspaceTrustManagementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeTrust: Event<boolean>;
    readonly onDidChangeTrustedFolders: Event<void>;
    readonly workspaceResolved: Promise<void>;
    readonly workspaceTrustInitialized: Promise<void>;
    acceptsOutOfWorkspaceFiles: boolean;
    isWorkspaceTrusted(): boolean;
    isWorkspaceTrustForced(): boolean;
    canSetParentFolderTrust(): boolean;
    setParentFolderTrust(trusted: boolean): Promise<void>;
    canSetWorkspaceTrust(): boolean;
    setWorkspaceTrust(trusted: boolean): Promise<void>;
    getUriTrustInfo(uri: URI): Promise<IWorkspaceTrustUriInfo>;
    setUrisTrust(uri: URI[], trusted: boolean): Promise<void>;
    getTrustedUris(): URI[];
    setTrustedUris(uris: URI[]): Promise<void>;
    addWorkspaceTrustTransitionParticipant(participant: IWorkspaceTrustTransitionParticipant): IDisposable;
}
export declare const IWorkspaceTrustRequestService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceTrustRequestService>;
export interface IWorkspaceTrustRequestService {
    readonly _serviceBrand: undefined;
    readonly onDidInitiateOpenFilesTrustRequest: Event<void>;
    readonly onDidInitiateWorkspaceTrustRequest: Event<WorkspaceTrustRequestOptions | undefined>;
    readonly onDidInitiateWorkspaceTrustRequestOnStartup: Event<void>;
    readonly onDidInitiateResourcesTrustRequest: Event<ResourceTrustRequestOptions>;
    completeOpenFilesTrustRequest(result: WorkspaceTrustUriResponse, saveResponse?: boolean): Promise<void>;
    requestOpenFilesTrust(openFiles: URI[]): Promise<WorkspaceTrustUriResponse>;
    completeResourcesTrustRequest(uri: URI, result: WorkspaceTrustUriResponse): Promise<void>;
    requestResourcesTrust(options: ResourceTrustRequestOptions): Promise<boolean | undefined>;
    cancelWorkspaceTrustRequest(): void;
    completeWorkspaceTrustRequest(trusted?: boolean): Promise<void>;
    requestWorkspaceTrust(options?: WorkspaceTrustRequestOptions): Promise<boolean | undefined>;
    requestWorkspaceTrustOnStartup(): void;
}
