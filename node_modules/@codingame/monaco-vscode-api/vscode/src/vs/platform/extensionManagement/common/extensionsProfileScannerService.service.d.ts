import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IExtension, IExtensionIdentifier } from "../../extensions/common/extensions.js";
import { Metadata } from "./extensionManagement.js";
import { ProfileExtensionsEvent, DidAddProfileExtensionsEvent, DidRemoveProfileExtensionsEvent, IProfileExtensionsScanOptions, IScannedProfileExtension } from "./extensionsProfileScannerService.js";
export declare const IExtensionsProfileScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionsProfileScannerService>;
export interface IExtensionsProfileScannerService {
    readonly _serviceBrand: undefined;
    readonly onAddExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidAddExtensions: Event<DidAddProfileExtensionsEvent>;
    readonly onRemoveExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidRemoveExtensions: Event<DidRemoveProfileExtensionsEvent>;
    scanProfileExtensions(profileLocation: URI, options?: IProfileExtensionsScanOptions): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [
        IExtension,
        Metadata | undefined
    ][], profileLocation: URI, keepExistingVersions?: boolean): Promise<IScannedProfileExtension[]>;
    updateMetadata(extensions: [
        IExtension,
        Metadata | undefined
    ][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionsFromProfile(extensions: IExtensionIdentifier[], profileLocation: URI): Promise<void>;
}
