import { InstallExtensionSummary } from "../../extensionManagement/common/extensionManagement.js";
import { IExtensionDescription } from "../../extensions/common/extensions.js";
export declare const IRemoteExtensionsScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IRemoteExtensionsScannerService>;
export interface IRemoteExtensionsScannerService {
    readonly _serviceBrand: undefined;
    /**
    * Returns a promise that resolves to an array of extension identifiers that failed to install
    */
    whenExtensionsReady(): Promise<InstallExtensionSummary>;
    scanExtensions(): Promise<IExtensionDescription[]>;
}
