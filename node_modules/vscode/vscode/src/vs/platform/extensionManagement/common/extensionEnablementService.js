
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { isUndefinedOrNull } from '../../../base/common/types.js';
import { InstallOperation, DISABLED_EXTENSIONS_STORAGE_PATH } from './extensionManagement.js';
import { IExtensionManagementService } from './extensionManagement.service.js';
import { areSameExtensions } from './extensionManagementUtil.js';
import { StorageScope, StorageTarget } from '../../storage/common/storage.js';
import { IStorageService } from '../../storage/common/storage.service.js';

let GlobalExtensionEnablementService = class GlobalExtensionEnablementService extends Disposable {
    constructor(storageService, extensionManagementService) {
        super();
        this._onDidChangeEnablement = this._register(( new Emitter()));
        this.onDidChangeEnablement = this._onDidChangeEnablement.event;
        this.storageManager = this._register(( new StorageManager(storageService)));
        this._register(
            this.storageManager.onDidChange(extensions => this._onDidChangeEnablement.fire({
                extensions,
                source: "storage"
            }))
        );
        this._register(extensionManagementService.onDidInstallExtensions(e => e.forEach((
            {
                local,
                operation
            }
        ) => {
            if (local && operation === InstallOperation.Migrate) {
                this._removeFromDisabledExtensions(local.identifier);
            }
        })));
    }
    async enableExtension(extension, source) {
        if (this._removeFromDisabledExtensions(extension)) {
            this._onDidChangeEnablement.fire({
                extensions: [extension],
                source
            });
            return true;
        }
        return false;
    }
    async disableExtension(extension, source) {
        if (this._addToDisabledExtensions(extension)) {
            this._onDidChangeEnablement.fire({
                extensions: [extension],
                source
            });
            return true;
        }
        return false;
    }
    getDisabledExtensions() {
        return this._getExtensions(DISABLED_EXTENSIONS_STORAGE_PATH);
    }
    async getDisabledExtensionsAsync() {
        return this.getDisabledExtensions();
    }
    _addToDisabledExtensions(identifier) {
        const disabledExtensions = this.getDisabledExtensions();
        if (disabledExtensions.every(e => !areSameExtensions(e, identifier))) {
            disabledExtensions.push(identifier);
            this._setDisabledExtensions(disabledExtensions);
            return true;
        }
        return false;
    }
    _removeFromDisabledExtensions(identifier) {
        const disabledExtensions = this.getDisabledExtensions();
        for (let index = 0; index < disabledExtensions.length; index++) {
            const disabledExtension = disabledExtensions[index];
            if (areSameExtensions(disabledExtension, identifier)) {
                disabledExtensions.splice(index, 1);
                this._setDisabledExtensions(disabledExtensions);
                return true;
            }
        }
        return false;
    }
    _setDisabledExtensions(disabledExtensions) {
        this._setExtensions(DISABLED_EXTENSIONS_STORAGE_PATH, disabledExtensions);
    }
    _getExtensions(storageId) {
        return this.storageManager.get(storageId, StorageScope.PROFILE);
    }
    _setExtensions(storageId, extensions) {
        this.storageManager.set(storageId, extensions, StorageScope.PROFILE);
    }
};
GlobalExtensionEnablementService = ( __decorate([( __param(0, IStorageService)), ( __param(1, IExtensionManagementService))], GlobalExtensionEnablementService));
class StorageManager extends Disposable {
    constructor(storageService) {
        super();
        this.storageService = storageService;
        this.storage = Object.create(null);
        this._onDidChange = this._register(( new Emitter()));
        this.onDidChange = this._onDidChange.event;
        this._register(
            storageService.onDidChangeValue(StorageScope.PROFILE, undefined, this._store)(e => this.onDidStorageChange(e))
        );
    }
    get(key, scope) {
        let value;
        if (scope === StorageScope.PROFILE) {
            if (isUndefinedOrNull(this.storage[key])) {
                this.storage[key] = this._get(key, scope);
            }
            value = this.storage[key];
        } else {
            value = this._get(key, scope);
        }
        return JSON.parse(value);
    }
    set(key, value, scope) {
        const newValue = JSON.stringify(( value.map((
            {
                id,
                uuid
            }
        ) => ({
            id,
            uuid
        }))));
        const oldValue = this._get(key, scope);
        if (oldValue !== newValue) {
            if (scope === StorageScope.PROFILE) {
                if (value.length) {
                    this.storage[key] = newValue;
                } else {
                    delete this.storage[key];
                }
            }
            this._set(key, value.length ? newValue : undefined, scope);
        }
    }
    onDidStorageChange(storageChangeEvent) {
        if (!isUndefinedOrNull(this.storage[storageChangeEvent.key])) {
            const newValue = this._get(storageChangeEvent.key, storageChangeEvent.scope);
            if (newValue !== this.storage[storageChangeEvent.key]) {
                const oldValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
                delete this.storage[storageChangeEvent.key];
                const newValues = this.get(storageChangeEvent.key, storageChangeEvent.scope);
                const added = oldValues.filter(oldValue => !( newValues.some(newValue => areSameExtensions(oldValue, newValue))));
                const removed = newValues.filter(newValue => !( oldValues.some(oldValue => areSameExtensions(oldValue, newValue))));
                if (added.length || removed.length) {
                    this._onDidChange.fire([...added, ...removed]);
                }
            }
        }
    }
    _get(key, scope) {
        return this.storageService.get(key, scope, "[]");
    }
    _set(key, value, scope) {
        if (value) {
            this.storageService.store(key, value, scope, StorageTarget.MACHINE);
        } else {
            this.storageService.remove(key, scope);
        }
    }
}

export { GlobalExtensionEnablementService, StorageManager };
