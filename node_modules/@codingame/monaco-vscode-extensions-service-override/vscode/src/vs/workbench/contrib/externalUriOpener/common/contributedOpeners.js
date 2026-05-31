
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { StorageScope, StorageTarget } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage';
import { IStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service';
import { Memento } from '@codingame/monaco-vscode-api/vscode/vs/workbench/common/memento';
import { updateContributedOpeners } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/externalUriOpener/common/configuration';
import { IExtensionService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service';

var ContributedExternalUriOpenersStore_1;
let ContributedExternalUriOpenersStore = class ContributedExternalUriOpenersStore extends Disposable {
    static {
        ContributedExternalUriOpenersStore_1 = this;
    }
    static {
        this.STORAGE_ID = "externalUriOpeners";
    }
    constructor(storageService, _extensionService) {
        super();
        this._extensionService = _extensionService;
        this._openers = ( new Map());
        this._memento = ( new Memento(ContributedExternalUriOpenersStore_1.STORAGE_ID, storageService));
        this._mementoObject = this._memento.getMemento(StorageScope.PROFILE, StorageTarget.MACHINE);
        for (const [id, value] of Object.entries(this._mementoObject || {})) {
            if (value) {
                this.add(id, value.extensionId, {
                    isCurrentlyRegistered: false
                });
            }
        }
        this.invalidateOpenersOnExtensionsChanged();
        this._register(
            this._extensionService.onDidChangeExtensions(() => this.invalidateOpenersOnExtensionsChanged())
        );
        this._register(
            this._extensionService.onDidChangeExtensionsStatus(() => this.invalidateOpenersOnExtensionsChanged())
        );
    }
    didRegisterOpener(id, extensionId) {
        this.add(id, extensionId, {
            isCurrentlyRegistered: true
        });
    }
    add(id, extensionId, options) {
        const existing = this._openers.get(id);
        if (existing) {
            existing.isCurrentlyRegistered = existing.isCurrentlyRegistered || options.isCurrentlyRegistered;
            return;
        }
        const entry = {
            extensionId,
            isCurrentlyRegistered: options.isCurrentlyRegistered
        };
        this._openers.set(id, entry);
        this._mementoObject[id] = entry;
        this._memento.saveMemento();
        this.updateSchema();
    }
    delete(id) {
        this._openers.delete(id);
        delete this._mementoObject[id];
        this._memento.saveMemento();
        this.updateSchema();
    }
    async invalidateOpenersOnExtensionsChanged() {
        await this._extensionService.whenInstalledExtensionsRegistered();
        const registeredExtensions = this._extensionService.extensions;
        for (const [id, entry] of this._openers) {
            const extension = registeredExtensions.find(r => r.identifier.value === entry.extensionId);
            if (extension) {
                if (!this._extensionService.canRemoveExtension(extension)) {
                    if (!entry.isCurrentlyRegistered) {
                        this.delete(id);
                    }
                }
            } else {
                this.delete(id);
            }
        }
    }
    updateSchema() {
        const ids = [];
        const descriptions = [];
        for (const [id, entry] of this._openers) {
            ids.push(id);
            descriptions.push(entry.extensionId);
        }
        updateContributedOpeners(ids, descriptions);
    }
};
ContributedExternalUriOpenersStore = ContributedExternalUriOpenersStore_1 = ( __decorate([( __param(0, IStorageService)), ( __param(1, IExtensionService))], ContributedExternalUriOpenersStore));

export { ContributedExternalUriOpenersStore };
