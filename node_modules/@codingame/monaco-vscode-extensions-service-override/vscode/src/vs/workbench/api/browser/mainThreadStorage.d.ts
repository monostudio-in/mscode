import { IStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service";
import { MainThreadStorageShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IExtensionIdWithVersion } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionStorage";
import { IExtensionStorageService } from "@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionStorage.service";
import { IInstantiationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
export declare class MainThreadStorage implements MainThreadStorageShape {
    private readonly _extensionStorageService;
    private readonly _storageService;
    private readonly _instantiationService;
    private readonly _logService;
    private readonly _proxy;
    private readonly _storageListener;
    private readonly _sharedStorageKeysToWatch;
    constructor(extHostContext: IExtHostContext, _extensionStorageService: IExtensionStorageService, _storageService: IStorageService, _instantiationService: IInstantiationService, _logService: ILogService);
    dispose(): void;
    $initializeExtensionStorage(shared: boolean, extensionId: string): Promise<string | undefined>;
    $setValue(shared: boolean, key: string, value: object): Promise<void>;
    $registerExtensionStorageKeysToSync(extension: IExtensionIdWithVersion, keys: string[]): void;
    private checkAndMigrateExtensionStorage;
}
