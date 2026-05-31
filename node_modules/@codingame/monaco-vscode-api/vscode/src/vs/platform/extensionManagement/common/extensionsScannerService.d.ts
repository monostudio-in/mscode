import { Disposable } from "../../../base/common/lifecycle.js";
import Severity from "../../../base/common/severity.js";
import { URI } from "../../../base/common/uri.js";
import { IEnvironmentService } from "../../environment/common/environment.service.js";
import { IProductVersion, Metadata } from "./extensionManagement.js";
import { ExtensionType, IExtensionManifest, TargetPlatform, IExtensionIdentifier, IRelaxedExtensionManifest, IExtensionDescription } from "../../extensions/common/extensions.js";
import { IFileService } from "../../files/common/files.service.js";
import { IInstantiationService } from "../../instantiation/common/instantiation.js";
import { ILogService } from "../../log/common/log.service.js";
import { IProductService } from "../../product/common/productService.service.js";
import { IProfileExtensionsScanOptions } from "./extensionsProfileScannerService.js";
import { IExtensionsProfileScannerService } from "./extensionsProfileScannerService.service.js";
import { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
import { IUserDataProfilesService } from "../../userDataProfile/common/userDataProfile.service.js";
import { IUriIdentityService } from "../../uriIdentity/common/uriIdentity.service.js";
import { IExtensionResourceLoaderService } from "../../extensionResourceLoader/common/extensionResourceLoader.service.js";
import { IExtensionsScannerService } from "./extensionsScannerService.service.js";
export type ManifestMetadata = Partial<{
    targetPlatform: TargetPlatform;
    installedTimestamp: number;
    size: number;
}>;
export type IScannedExtensionManifest = IRelaxedExtensionManifest & {
    __metadata?: ManifestMetadata;
};
interface IRelaxedScannedExtension {
    type: ExtensionType;
    isBuiltin: boolean;
    identifier: IExtensionIdentifier;
    manifest: IRelaxedExtensionManifest;
    location: URI;
    targetPlatform: TargetPlatform;
    publisherDisplayName?: string;
    metadata: Metadata | undefined;
    isValid: boolean;
    validations: readonly [
        Severity,
        string
    ][];
    preRelease: boolean;
    forceAutoUpdate: boolean;
}
export type IScannedExtension = Readonly<IRelaxedScannedExtension> & {
    manifest: IExtensionManifest;
};
export interface Translations {
    [id: string]: string;
}
export declare namespace Translations {
    function equals(a: Translations, b: Translations): boolean;
}
export type SystemExtensionsScanOptions = {
    readonly checkControlFile?: boolean;
    readonly language?: string;
};
export type UserExtensionsScanOptions = {
    readonly profileLocation: URI;
    readonly includeInvalid?: boolean;
    readonly language?: string;
    readonly useCache?: boolean;
    readonly productVersion?: IProductVersion;
};
export type ScanOptions = {
    readonly includeInvalid?: boolean;
    readonly language?: string;
};
export declare abstract class AbstractExtensionsScannerService extends Disposable implements IExtensionsScannerService {
    readonly systemExtensionsLocation: URI;
    readonly userExtensionsLocation: URI;
    private readonly extensionsControlLocation;
    private readonly userDataProfilesService;
    protected readonly extensionsProfileScannerService: IExtensionsProfileScannerService;
    protected readonly extensionResourceLoaderService: IExtensionResourceLoaderService;
    protected readonly fileService: IFileService;
    protected readonly logService: ILogService;
    private readonly environmentService;
    private readonly productService;
    private readonly uriIdentityService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    protected abstract getTranslations(language: string): Promise<Translations>;
    private readonly _onDidChangeCache;
    readonly onDidChangeCache: import("../../../base/common/event.js").Event<ExtensionType>;
    private readonly systemExtensionsCachedScanner;
    private readonly userExtensionsCachedScanner;
    private readonly extensionsScanner;
    constructor(systemExtensionsLocation: URI, userExtensionsLocation: URI, extensionsControlLocation: URI, currentProfile: IUserDataProfile, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, extensionResourceLoaderService: IExtensionResourceLoaderService, fileService: IFileService, logService: ILogService, environmentService: IEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    private _targetPlatformPromise;
    private getTargetPlatform;
    scanAllExtensions(systemScanOptions: SystemExtensionsScanOptions, userScanOptions: UserExtensionsScanOptions): Promise<IScannedExtension[]>;
    scanSystemExtensions(scanOptions: SystemExtensionsScanOptions): Promise<IScannedExtension[]>;
    scanUserExtensions(scanOptions: UserExtensionsScanOptions): Promise<IScannedExtension[]>;
    scanAllUserExtensions(scanOptions?: {
        includeAllVersions?: boolean;
        includeInvalid: boolean;
    }): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(existingExtensions: IScannedExtension[], scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension | null>;
    scanOneOrMultipleExtensions(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMultipleExtensions(extensionLocations: URI[], extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    updateManifestMetadata(extensionLocation: URI, metaData: ManifestMetadata): Promise<void>;
    initializeDefaultProfileExtensions(): Promise<void>;
    private initializeDefaultProfileExtensionsPromise;
    private doInitializeDefaultProfileExtensions;
    private applyScanOptions;
    private dedupExtensions;
    private scanDefaultSystemExtensions;
    private scanDevSystemExtensions;
    private getBuiltInExtensionControl;
    private createExtensionScannerInput;
    private getMtime;
    private getProductVersion;
}
export declare class ExtensionScannerInput {
    readonly location: URI;
    readonly mtime: number | undefined;
    readonly applicationExtensionslocation: URI | undefined;
    readonly applicationExtensionslocationMtime: number | undefined;
    readonly profile: boolean;
    readonly profileScanOptions: IProfileExtensionsScanOptions | undefined;
    readonly type: ExtensionType;
    readonly validate: boolean;
    readonly productVersion: string;
    readonly productDate: string | undefined;
    readonly productCommit: string | undefined;
    readonly devMode: boolean;
    readonly language: string | undefined;
    readonly translations: Translations;
    constructor(location: URI, mtime: number | undefined, applicationExtensionslocation: URI | undefined, applicationExtensionslocationMtime: number | undefined, profile: boolean, profileScanOptions: IProfileExtensionsScanOptions | undefined, type: ExtensionType, validate: boolean, productVersion: string, productDate: string | undefined, productCommit: string | undefined, devMode: boolean, language: string | undefined, translations: Translations);
    static createNlsConfiguration(input: ExtensionScannerInput): NlsConfiguration;
    static equals(a: ExtensionScannerInput, b: ExtensionScannerInput): boolean;
}
export type NlsConfiguration = {
    language: string | undefined;
    pseudo: boolean;
    devMode: boolean;
    translations: Translations;
};
export declare class ExtensionManifestTranslator extends Disposable {
    protected readonly extensionResourceLoaderService: IExtensionResourceLoaderService;
    protected readonly fileService: IFileService;
    protected readonly logService: ILogService;
    constructor(extensionResourceLoaderService: IExtensionResourceLoaderService, fileService: IFileService, logService: ILogService);
    private getLocalizedMessages;
    translateManifest(extensionLocation: URI, extensionManifest: IExtensionManifest, nlsConfiguration: NlsConfiguration): Promise<IExtensionManifest>;
    /**
     * Parses original message bundle, returns null if the original message bundle is null.
     */
    private resolveOriginalMessageBundle;
    /**
     * Finds localized message bundle and the original (unlocalized) one.
     * If the localized file is not present, returns null for the original and marks original as localized.
     */
    private findMessageBundles;
    protected formatMessage(extensionLocation: URI, message: string): string;
}
export declare function toExtensionDescription(extension: IScannedExtension, isUnderDevelopment: boolean): IExtensionDescription;
export declare class NativeExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    private readonly translationsPromise;
    constructor(systemExtensionsLocation: URI, userExtensionsLocation: URI, userHome: URI, currentProfile: IUserDataProfile, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, extensionResourceLoaderService: IExtensionResourceLoaderService, fileService: IFileService, logService: ILogService, environmentService: IEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(language: string): Promise<Translations>;
}
export {};
