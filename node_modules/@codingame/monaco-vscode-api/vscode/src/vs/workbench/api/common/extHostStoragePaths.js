
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { IExtHostConsumerFileSystem } from './extHostFileSystemConsumer.js';
import { URI } from '../../../base/common/uri.js';

const IExtensionStoragePaths = ( createDecorator("IExtensionStoragePaths"));
let ExtensionStoragePaths = class ExtensionStoragePaths {
    constructor(initData, _logService, _extHostFileSystem) {
        this._logService = _logService;
        this._extHostFileSystem = _extHostFileSystem;
        this._workspace = initData.workspace ?? undefined;
        this._environment = initData.environment;
        this.whenReady = this._getOrCreateWorkspaceStoragePath().then(value => this._value = value);
    }
    async _getWorkspaceStorageURI(storageName) {
        return URI.joinPath(this._environment.workspaceStorageHome, storageName);
    }
    async _getOrCreateWorkspaceStoragePath() {
        if (!this._workspace) {
            return Promise.resolve(undefined);
        }
        const storageName = this._workspace.id;
        const storageUri = await this._getWorkspaceStorageURI(storageName);
        try {
            await this._extHostFileSystem.value.stat(storageUri);
            this._logService.trace("[ExtHostStorage] storage dir already exists", storageUri);
            return storageUri;
        } catch {}
        try {
            this._logService.trace("[ExtHostStorage] creating dir and metadata-file", storageUri);
            await this._extHostFileSystem.value.createDirectory(storageUri);
            await this._extHostFileSystem.value.writeFile(URI.joinPath(storageUri, "meta.json"), ( new TextEncoder()).encode(JSON.stringify({
                id: this._workspace.id,
                configuration: URI.revive(this._workspace.configuration)?.toString(),
                name: this._workspace.name
            }, undefined, 2)));
            return storageUri;
        } catch (e) {
            this._logService.error("[ExtHostStorage]", e);
            return undefined;
        }
    }
    workspaceValue(extension) {
        if (this._value) {
            return URI.joinPath(this._value, extension.identifier.value);
        }
        return undefined;
    }
    globalValue(extension) {
        return URI.joinPath(
            this._environment.globalStorageHome,
            extension.identifier.value.toLowerCase()
        );
    }
    onWillDeactivateAll() {}
};
ExtensionStoragePaths = ( __decorate([( __param(0, IExtHostInitDataService)), ( __param(1, ILogService)), ( __param(2, IExtHostConsumerFileSystem))], ExtensionStoragePaths));

export { ExtensionStoragePaths, IExtensionStoragePaths };
