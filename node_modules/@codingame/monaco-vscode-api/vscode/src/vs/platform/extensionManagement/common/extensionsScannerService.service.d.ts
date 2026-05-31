import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { ExtensionType } from "../../extensions/common/extensions.js";
import { SystemExtensionsScanOptions, UserExtensionsScanOptions, IScannedExtension, ScanOptions, ManifestMetadata } from "./extensionsScannerService.js";
export declare const IExtensionsScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionsScannerService>;
export interface IExtensionsScannerService {
    readonly _serviceBrand: undefined;
    readonly systemExtensionsLocation: URI;
    readonly userExtensionsLocation: URI;
    readonly onDidChangeCache: Event<ExtensionType>;
    scanAllExtensions(systemScanOptions: SystemExtensionsScanOptions, userScanOptions: UserExtensionsScanOptions): Promise<IScannedExtension[]>;
    scanSystemExtensions(scanOptions: SystemExtensionsScanOptions): Promise<IScannedExtension[]>;
    scanUserExtensions(scanOptions: UserExtensionsScanOptions): Promise<IScannedExtension[]>;
    scanAllUserExtensions(): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(existingExtensions: IScannedExtension[], scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension | null>;
    scanMultipleExtensions(extensionLocations: URI[], extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanOneOrMultipleExtensions(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    updateManifestMetadata(extensionLocation: URI, metadata: ManifestMetadata): Promise<void>;
    initializeDefaultProfileExtensions(): Promise<void>;
}
