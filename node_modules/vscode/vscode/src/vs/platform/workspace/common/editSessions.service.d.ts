import { CancellationToken } from "../../../base/common/cancellation.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import { IEditSessionIdentityProvider, EditSessionIdentityMatch, IEditSessionIdentityCreateParticipant } from "./editSessions.js";
import { IWorkspaceFolder } from "./workspace.js";
export declare const IEditSessionIdentityService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEditSessionIdentityService>;
export interface IEditSessionIdentityService {
    readonly _serviceBrand: undefined;
    registerEditSessionIdentityProvider(provider: IEditSessionIdentityProvider): IDisposable;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, cancellationToken: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
    addEditSessionIdentityCreateParticipant(participants: IEditSessionIdentityCreateParticipant): IDisposable;
    onWillCreateEditSessionIdentity(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
}
