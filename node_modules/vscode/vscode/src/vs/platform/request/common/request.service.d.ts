import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { IRequestOptions, IRequestContext } from "../../../base/parts/request/common/request.js";
import { IRequestCompleteEvent, AuthInfo, Credentials } from "./request.js";
export declare const IRequestService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRequestService>;
export interface IRequestService {
    readonly _serviceBrand: undefined;
    /**
    * Fires when a request completes (successfully or with an error response).
    */
    readonly onDidCompleteRequest: Event<IRequestCompleteEvent>;
    request(options: IRequestOptions, token: CancellationToken): Promise<IRequestContext>;
    resolveProxy(url: string): Promise<string | undefined>;
    lookupAuthorization(authInfo: AuthInfo): Promise<Credentials | undefined>;
    lookupKerberosAuthorization(url: string): Promise<string | undefined>;
    loadCertificates(): Promise<string[]>;
}
