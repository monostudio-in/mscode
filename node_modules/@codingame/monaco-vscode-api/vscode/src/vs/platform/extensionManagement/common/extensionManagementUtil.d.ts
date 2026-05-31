import { IExtensionIdentifier, IGalleryExtension, ILocalExtension, MaliciousExtensionInfo } from "./extensionManagement.js";
import { ExtensionIdentifier, IExtension, TargetPlatform } from "../../extensions/common/extensions.js";
import { IFileService } from "../../files/common/files.service.js";
import { ILogService } from "../../log/common/log.service.js";
import { TelemetryTrustedValue } from "../../telemetry/common/telemetryUtils.js";
export declare function areSameExtensions(a: IExtensionIdentifier, b: IExtensionIdentifier): boolean;
export declare class ExtensionKey {
    readonly identifier: IExtensionIdentifier;
    readonly version: string;
    readonly targetPlatform: TargetPlatform;
    static create(extension: IExtension | IGalleryExtension): ExtensionKey;
    static parse(key: string): ExtensionKey | null;
    readonly id: string;
    constructor(identifier: IExtensionIdentifier, version: string, targetPlatform?: TargetPlatform);
    toString(): string;
    equals(o: unknown): boolean;
}
export declare function getIdAndVersion(id: string): [
    string,
    string | undefined
];
export declare function getExtensionId(publisher: string, name: string): string;
export declare function adoptToGalleryExtensionId(id: string): string;
export declare function getGalleryExtensionId(publisher: string | undefined, name: string): string;
export declare function groupByExtension<T>(extensions: T[], getExtensionIdentifier: (t: T) => IExtensionIdentifier): T[][];
export declare function getLocalExtensionTelemetryData(extension: ILocalExtension): {
    id: string;
    name: string;
    galleryId: null;
    publisherId: string | null;
    publisherName: string;
    publisherDisplayName: string | undefined;
    dependencies: boolean | undefined;
};
export declare function getGalleryExtensionTelemetryData(extension: IGalleryExtension): {
    id: TelemetryTrustedValue<string>;
    name: TelemetryTrustedValue<string>;
    extensionVersion: string;
    galleryId: string;
    publisherId: string;
    publisherName: string;
    publisherDisplayName: string;
    isPreReleaseVersion: boolean;
    dependencies: boolean;
    isSigned: boolean;
};
export declare const BetterMergeId: ExtensionIdentifier;
export declare function getExtensionDependencies(installedExtensions: ReadonlyArray<IExtension>, extension: IExtension): IExtension[];
export declare function computeTargetPlatform(fileService: IFileService, logService: ILogService): Promise<TargetPlatform>;
export declare function isMalicious(identifier: IExtensionIdentifier, malicious: ReadonlyArray<MaliciousExtensionInfo>): boolean;
export declare function findMatchingMaliciousEntry(identifier: IExtensionIdentifier, malicious: ReadonlyArray<MaliciousExtensionInfo>): MaliciousExtensionInfo | undefined;
