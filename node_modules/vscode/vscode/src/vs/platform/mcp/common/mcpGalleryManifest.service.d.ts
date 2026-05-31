import { Event } from "../../../base/common/event.js";
import { McpGalleryManifestStatus, IMcpGalleryManifest } from "./mcpGalleryManifest.js";
export declare const IMcpGalleryManifestService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IMcpGalleryManifestService>;
export interface IMcpGalleryManifestService {
    readonly _serviceBrand: undefined;
    readonly mcpGalleryManifestStatus: McpGalleryManifestStatus;
    readonly onDidChangeMcpGalleryManifestStatus: Event<McpGalleryManifestStatus>;
    readonly onDidChangeMcpGalleryManifest: Event<IMcpGalleryManifest | null>;
    getMcpGalleryManifest(): Promise<IMcpGalleryManifest | null>;
}
