import { ILocalExtension } from "../../extensionManagement/common/extensionManagement.js";
export declare const IIgnoredExtensionsManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IIgnoredExtensionsManagementService>;
export interface IIgnoredExtensionsManagementService {
    readonly _serviceBrand: undefined;
    getIgnoredExtensions(installed: ILocalExtension[]): string[];
    hasToNeverSyncExtension(extensionId: string): boolean;
    hasToAlwaysSyncExtension(extensionId: string): boolean;
    updateIgnoredExtensions(ignoredExtensionId: string, ignore: boolean): Promise<void>;
    updateSynchronizedExtensions(ignoredExtensionId: string, sync: boolean): Promise<void>;
}
