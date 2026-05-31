import { IExtension, IExtensionManifest, IExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import { ILocalExtension, InstallExtensionEvent, DidUninstallExtensionEvent, Metadata, UninstallExtensionEvent } from "../../../../platform/extensionManagement/common/extensionManagement.js";
import { URI } from "../../../../base/common/uri.js";
import { IProfileAwareExtensionManagementService } from "./extensionManagement.service.js";
export type DidChangeProfileEvent = {
    readonly added: ILocalExtension[];
    readonly removed: ILocalExtension[];
};
export interface IExtensionManagementServer {
    readonly id: string;
    readonly label: string;
    readonly extensionManagementService: IProfileAwareExtensionManagementService;
}
export declare enum ExtensionInstallLocation {
    Local = 1,
    Remote = 2,
    Web = 3
}
export interface IResourceExtension {
    readonly type: "resource";
    readonly identifier: IExtensionIdentifier;
    readonly location: URI;
    readonly manifest: IExtensionManifest;
    readonly readmeUri?: URI;
    readonly changelogUri?: URI;
}
export type InstallExtensionOnServerEvent = InstallExtensionEvent & {
    server: IExtensionManagementServer;
};
export type UninstallExtensionOnServerEvent = UninstallExtensionEvent & {
    server: IExtensionManagementServer;
};
export type DidUninstallExtensionOnServerEvent = DidUninstallExtensionEvent & {
    server: IExtensionManagementServer;
};
export type DidChangeProfileForServerEvent = DidChangeProfileEvent & {
    server: IExtensionManagementServer;
};
export interface IPublisherInfo {
    readonly publisher: string;
    readonly publisherDisplayName: string;
}
export declare enum EnablementState {
    DisabledByTrustRequirement = 0,
    DisabledByExtensionKind = 1,
    DisabledByEnvironment = 2,
    EnabledByEnvironment = 3,
    DisabledByMalicious = 4,
    DisabledByVirtualWorkspace = 5,
    DisabledByInvalidExtension = 6,
    DisabledByAllowlist = 7,
    DisabledByExtensionDependency = 8,
    DisabledByUnification = 9,// Temporary TODO@benibenj remove when unification transition is complete
    DisabledGlobally = 10,
    DisabledWorkspace = 11,
    EnabledGlobally = 12,
    EnabledWorkspace = 13
}
export interface IScannedExtension extends IExtension {
    readonly metadata?: Metadata;
}
export type ScanOptions = {
    readonly skipInvalidExtensions?: boolean;
};
