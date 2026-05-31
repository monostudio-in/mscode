import { CancellationToken } from "../../../base/common/cancellation.js";
import { IWorkspaceFolder } from "./workspace.js";
export interface IEditSessionIdentityProvider {
    readonly scheme: string;
    getEditSessionIdentifier(workspaceFolder: IWorkspaceFolder, token: CancellationToken): Promise<string | undefined>;
    provideEditSessionIdentityMatch(workspaceFolder: IWorkspaceFolder, identity1: string, identity2: string, token: CancellationToken): Promise<EditSessionIdentityMatch | undefined>;
}
export interface IEditSessionIdentityCreateParticipant {
    participate(workspaceFolder: IWorkspaceFolder, cancellationToken: CancellationToken): Promise<void>;
}
export declare enum EditSessionIdentityMatch {
    Complete = 100,
    Partial = 50,
    None = 0
}
