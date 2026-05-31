import { URI } from "../../../base/common/uri.js";
export declare enum WorkspaceTrustScope {
    Local = 0,
    Remote = 1
}
export interface WorkspaceTrustRequestButton {
    readonly label: string;
    readonly type: "ContinueWithTrust" | "ContinueWithoutTrust" | "Manage" | "Cancel";
}
export interface ResourceTrustRequestOptions {
    readonly uri: URI;
    readonly message?: string;
}
export interface WorkspaceTrustRequestOptions {
    readonly buttons?: WorkspaceTrustRequestButton[];
    readonly message?: string;
}
export declare enum WorkspaceTrustUriResponse {
    Open = 1,
    OpenInNewWindow = 2,
    Cancel = 3
}
export interface IWorkspaceTrustTransitionParticipant {
    participate(trusted: boolean): Promise<void>;
}
export interface IWorkspaceTrustUriInfo {
    uri: URI;
    trusted: boolean;
}
export interface IWorkspaceTrustInfo {
    uriTrustInfo: IWorkspaceTrustUriInfo[];
}
