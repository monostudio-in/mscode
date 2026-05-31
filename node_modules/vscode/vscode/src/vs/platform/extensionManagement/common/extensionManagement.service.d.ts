import { CancellationToken } from "../../../base/common/cancellation.js";
import { Event } from "../../../base/common/event.js";
import { IMarkdownString } from "../../../base/common/htmlContent.js";
import { IPager } from "../../../base/common/paging.js";
import { URI } from "../../../base/common/uri.js";
import { TargetPlatform, IExtensionManifest, type ExtensionType, type IExtension } from "../../extensions/common/extensions.js";
import { IQueryOptions, IGalleryExtension, IExtensionInfo, IExtensionQueryOptions, IProductVersion, IExtensionIdentifier, IGalleryExtensionVersion, InstallOperation, StatisticType, ITranslation, IExtensionsControlManifest, type DidUninstallExtensionEvent, type DidUpdateExtensionMetadata, type IExtensionManagementParticipant, type ILocalExtension, type InstallExtensionEvent, type InstallExtensionInfo, type InstallExtensionResult, type InstallOptions, type Metadata, type UninstallExtensionEvent, type UninstallExtensionInfo, type UninstallOptions, type IConfigBasedExtensionTip, type IExecutableBasedExtensionTip, type AllowedExtensionsConfigValueType } from "./extensionManagement.js";
export declare const IExtensionGalleryService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionGalleryService>;
/**
* Service to interact with the Visual Studio Code Marketplace to get extensions.
* @throws Error if the Marketplace is not enabled or not reachable.
*/
export interface IExtensionGalleryService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    query(options: IQueryOptions, token: CancellationToken): Promise<IPager<IGalleryExtension>>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, token: CancellationToken): Promise<IGalleryExtension[]>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, options: IExtensionQueryOptions, token: CancellationToken): Promise<IGalleryExtension[]>;
    isExtensionCompatible(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform, productVersion?: IProductVersion): Promise<boolean>;
    getCompatibleExtension(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform, productVersion?: IProductVersion): Promise<IGalleryExtension | null>;
    getAllCompatibleVersions(extensionIdentifier: IExtensionIdentifier, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtensionVersion[]>;
    getAllVersions(extensionIdentifier: IExtensionIdentifier): Promise<IGalleryExtensionVersion[]>;
    download(extension: IGalleryExtension, location: URI, operation: InstallOperation): Promise<void>;
    downloadSignatureArchive(extension: IGalleryExtension, location: URI): Promise<void>;
    reportStatistic(publisher: string, name: string, version: string, type: StatisticType): Promise<void>;
    getReadme(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getManifest(extension: IGalleryExtension, token: CancellationToken): Promise<IExtensionManifest | null>;
    getChangelog(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getCoreTranslation(extension: IGalleryExtension, languageId: string): Promise<ITranslation | null>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
}
export declare const IExtensionManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionManagementService>;
export interface IExtensionManagementService {
    readonly _serviceBrand: undefined;
    readonly preferPreReleases: boolean;
    onInstallExtension: Event<InstallExtensionEvent>;
    onDidInstallExtensions: Event<readonly InstallExtensionResult[]>;
    onUninstallExtension: Event<UninstallExtensionEvent>;
    onDidUninstallExtension: Event<DidUninstallExtensionEvent>;
    onDidUpdateExtensionMetadata: Event<DidUpdateExtensionMetadata>;
    zip(extension: ILocalExtension): Promise<URI>;
    getManifest(vsix: URI): Promise<IExtensionManifest>;
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    canInstall(extension: IGalleryExtension): Promise<true | IMarkdownString>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions): Promise<ILocalExtension>;
    installGalleryExtensions(extensions: InstallExtensionInfo[]): Promise<InstallExtensionResult[]>;
    installFromLocation(location: URI, profileLocation: URI): Promise<ILocalExtension>;
    installExtensionsFromProfile(extensions: IExtensionIdentifier[], fromProfileLocation: URI, toProfileLocation: URI): Promise<ILocalExtension[]>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    uninstallExtensions(extensions: UninstallExtensionInfo[]): Promise<void>;
    toggleApplicationScope(extension: ILocalExtension, fromProfileLocation: URI): Promise<ILocalExtension>;
    getInstalled(type?: ExtensionType, profileLocation?: URI, productVersion?: IProductVersion, language?: string): Promise<ILocalExtension[]>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    copyExtensions(fromProfileLocation: URI, toProfileLocation: URI): Promise<void>;
    updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>, profileLocation: URI): Promise<ILocalExtension>;
    resetPinnedStateForAllUserExtensions(pinned: boolean): Promise<void>;
    download(extension: IGalleryExtension, operation: InstallOperation, donotVerifySignature: boolean): Promise<URI>;
    registerParticipant(pariticipant: IExtensionManagementParticipant): void;
    getTargetPlatform(): Promise<TargetPlatform>;
    cleanUp(): Promise<void>;
}
export declare const IGlobalExtensionEnablementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IGlobalExtensionEnablementService>;
export interface IGlobalExtensionEnablementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeEnablement: Event<{
        readonly extensions: IExtensionIdentifier[];
        readonly source?: string;
    }>;
    getDisabledExtensions(): IExtensionIdentifier[];
    enableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
    disableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
}
export declare const IExtensionTipsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionTipsService>;
export interface IExtensionTipsService {
    readonly _serviceBrand: undefined;
    getConfigBasedTips(folder: URI): Promise<IConfigBasedExtensionTip[]>;
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
}
export declare const IAllowedExtensionsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IAllowedExtensionsService>;
export interface IAllowedExtensionsService {
    readonly _serviceBrand: undefined;
    readonly allowedExtensionsConfigValue: AllowedExtensionsConfigValueType | undefined;
    readonly onDidChangeAllowedExtensionsConfigValue: Event<void>;
    isAllowed(extension: IGalleryExtension | IExtension): true | IMarkdownString;
    isAllowed(extension: {
        id: string;
        publisherDisplayName: string | undefined;
        version?: string;
        prerelease?: boolean;
        targetPlatform?: TargetPlatform;
    }): true | IMarkdownString;
}
