import { IStringDictionary } from "../../../base/common/collections.js";
import { Event } from "../../../base/common/event.js";
import { IExtension } from "../../extensions/common/extensions.js";
import { IGalleryExtension } from "./extensionManagement.js";
import { IExtensionIdWithVersion } from "./extensionStorage.js";
export declare const IExtensionStorageService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionStorageService>;
export interface IExtensionStorageService {
    readonly _serviceBrand: undefined;
    getExtensionState(extension: IExtension | IGalleryExtension | string, global: boolean): IStringDictionary<unknown> | undefined;
    getExtensionStateRaw(extension: IExtension | IGalleryExtension | string, global: boolean): string | undefined;
    setExtensionState(extension: IExtension | IGalleryExtension | string, state: object | undefined, global: boolean): void;
    readonly onDidChangeExtensionStorageToSync: Event<void>;
    setKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion, keys: string[]): void;
    getKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion): string[] | undefined;
    addToMigrationList(from: string, to: string): void;
    getSourceExtensionToMigrate(target: string): string | undefined;
}
