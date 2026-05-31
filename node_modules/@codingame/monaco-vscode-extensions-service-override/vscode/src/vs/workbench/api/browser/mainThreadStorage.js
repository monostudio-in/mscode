
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { StorageScope } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage';
import { IStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { isWeb } from '@codingame/monaco-vscode-api/vscode/vs/base/common/platform';
import { IExtensionStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/extensionManagement/common/extensionStorage.service';
import { migrateExtensionStorage } from '../../services/extensions/common/extensionStorageMigration.js';
import { IInstantiationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';

let MainThreadStorage = class MainThreadStorage {
    constructor(
        extHostContext,
        _extensionStorageService,
        _storageService,
        _instantiationService,
        _logService
    ) {
        this._extensionStorageService = _extensionStorageService;
        this._storageService = _storageService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._storageListener = ( new DisposableStore());
        this._sharedStorageKeysToWatch = ( new Map());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostStorage));
        this._storageListener.add(
            this._storageService.onDidChangeValue(StorageScope.PROFILE, undefined, this._storageListener)(e => {
                if (( this._sharedStorageKeysToWatch.has(e.key))) {
                    const rawState = this._extensionStorageService.getExtensionStateRaw(e.key, true);
                    if (typeof rawState === "string") {
                        this._proxy.$acceptValue(true, e.key, rawState);
                    }
                }
            })
        );
    }
    dispose() {
        this._storageListener.dispose();
    }
    async $initializeExtensionStorage(shared, extensionId) {
        await this.checkAndMigrateExtensionStorage(extensionId, shared);
        if (shared) {
            this._sharedStorageKeysToWatch.set(extensionId, true);
        }
        return this._extensionStorageService.getExtensionStateRaw(extensionId, shared);
    }
    async $setValue(shared, key, value) {
        this._extensionStorageService.setExtensionState(key, value, shared);
    }
    $registerExtensionStorageKeysToSync(extension, keys) {
        this._extensionStorageService.setKeysForSync(extension, keys);
    }
    async checkAndMigrateExtensionStorage(extensionId, shared) {
        try {
            let sourceExtensionId = this._extensionStorageService.getSourceExtensionToMigrate(extensionId);
            if (!sourceExtensionId && isWeb && extensionId !== extensionId.toLowerCase()) {
                sourceExtensionId = extensionId.toLowerCase();
            }
            if (sourceExtensionId) {
                if (isWeb && sourceExtensionId !== sourceExtensionId.toLowerCase() && this._extensionStorageService.getExtensionState(sourceExtensionId.toLowerCase(), shared) && !this._extensionStorageService.getExtensionState(sourceExtensionId, shared)) {
                    sourceExtensionId = sourceExtensionId.toLowerCase();
                }
                await migrateExtensionStorage(sourceExtensionId, extensionId, shared, this._instantiationService);
            }
        } catch (error) {
            this._logService.error(error);
        }
    }
};
MainThreadStorage = __decorate([extHostNamedCustomer(MainContext.MainThreadStorage), ( __param(1, IExtensionStorageService)), ( __param(2, IStorageService)), ( __param(3, IInstantiationService)), ( __param(4, ILogService))], MainThreadStorage);

export { MainThreadStorage };
