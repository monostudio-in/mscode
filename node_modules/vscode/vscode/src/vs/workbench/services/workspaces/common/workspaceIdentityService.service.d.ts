import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IWorkspaceStateFolder } from "../../../../platform/userDataSync/common/userDataSync.js";
export declare const IWorkspaceIdentityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceIdentityService>;
export interface IWorkspaceIdentityService {
    _serviceBrand: undefined;
    matches(folders: IWorkspaceStateFolder[], cancellationToken: CancellationToken): Promise<((obj: unknown) => unknown) | false>;
    getWorkspaceStateFolders(cancellationToken: CancellationToken): Promise<IWorkspaceStateFolder[]>;
}
