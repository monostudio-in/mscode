import { Disposable } from "../../../base/common/lifecycle.js";
import { IStorageService } from "../../storage/common/storage.service.js";
import { IProductService } from "../../product/common/productService.service.js";
import { ILogService } from "../../log/common/log.service.js";
import { IExtension } from "../../extensions/common/extensions.js";
import { IStringDictionary } from "../../../base/common/collections.js";
import { IGalleryExtension } from "./extensionManagement.js";
import { IExtensionManagementService } from "./extensionManagement.service.js";
import { IExtensionStorageService } from "./extensionStorage.service.js";
export interface IExtensionIdWithVersion {
    id: string;
    version: string;
}
export declare class ExtensionStorageService extends Disposable implements IExtensionStorageService {
    private readonly storageService;
    private readonly productService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private static LARGE_STATE_WARNING_THRESHOLD;
    private static toKey;
    private static fromKey;
    static removeOutdatedExtensionVersions(extensionManagementService: IExtensionManagementService, storageService: IStorageService): Promise<void>;
    private static readAllExtensionsWithKeysForSync;
    private readonly _onDidChangeExtensionStorageToSync;
    readonly onDidChangeExtensionStorageToSync: import("../../../base/common/event.js").Event<void>;
    private readonly extensionsWithKeysForSync;
    constructor(storageService: IStorageService, productService: IProductService, logService: ILogService);
    private onDidChangeStorageValue;
    private getExtensionId;
    getExtensionState(extension: IExtension | IGalleryExtension | string, global: boolean): IStringDictionary<unknown> | undefined;
    getExtensionStateRaw(extension: IExtension | IGalleryExtension | string, global: boolean): string | undefined;
    setExtensionState(extension: IExtension | IGalleryExtension | string, state: IStringDictionary<unknown> | undefined, global: boolean): void;
    setKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion, keys: string[]): void;
    getKeysForSync(extensionIdWithVersion: IExtensionIdWithVersion): string[] | undefined;
    addToMigrationList(from: string, to: string): void;
    getSourceExtensionToMigrate(toExtensionId: string): string | undefined;
    private get migrationList();
    private set migrationList(value);
}
