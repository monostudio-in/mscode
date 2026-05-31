import { Event } from "../../../base/common/event.js";
import { ExtensionGalleryManifestStatus, IExtensionGalleryManifest } from "./extensionGalleryManifest.js";
export declare const IExtensionGalleryManifestService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionGalleryManifestService>;
export interface IExtensionGalleryManifestService {
    readonly _serviceBrand: undefined;
    readonly extensionGalleryManifestStatus: ExtensionGalleryManifestStatus;
    readonly onDidChangeExtensionGalleryManifestStatus: Event<ExtensionGalleryManifestStatus>;
    readonly onDidChangeExtensionGalleryManifest: Event<IExtensionGalleryManifest | null>;
    getExtensionGalleryManifest(): Promise<IExtensionGalleryManifest | null>;
}
