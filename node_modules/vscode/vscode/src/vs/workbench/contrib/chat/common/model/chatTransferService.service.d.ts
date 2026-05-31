import { URI } from "../../../../../base/common/uri.js";
export declare const IChatTransferService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatTransferService>;
export interface IChatTransferService {
    readonly _serviceBrand: undefined;
    checkAndSetTransferredWorkspaceTrust(): Promise<void>;
    addWorkspaceToTransferred(workspace: URI): void;
}
