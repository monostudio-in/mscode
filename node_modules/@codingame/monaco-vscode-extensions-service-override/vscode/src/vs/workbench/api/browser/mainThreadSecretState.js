
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { SequencerByKey } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { ISecretStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/secrets/common/secrets.service';
import { IBrowserWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service';

let MainThreadSecretState = class MainThreadSecretState extends Disposable {
    constructor(extHostContext, secretStorageService, logService, environmentService) {
        super();
        this.secretStorageService = secretStorageService;
        this.logService = logService;
        this._sequencer = ( new SequencerByKey());
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostSecretState));
        this._register(this.secretStorageService.onDidChangeSecret(e => {
            const parsedKey = this.parseKey(e);
            if (parsedKey) {
                this._proxy.$onDidChangePassword(parsedKey);
            }
        }));
    }
    $getPassword(extensionId, key) {
        this.logService.trace(
            `[mainThreadSecretState] Getting password for ${extensionId} extension: `,
            key
        );
        return this._sequencer.queue(extensionId, () => this.doGetPassword(extensionId, key));
    }
    async doGetPassword(extensionId, key) {
        const fullKey = this.getKey(extensionId, key);
        const password = await this.secretStorageService.get(fullKey);
        this.logService.trace(
            `[mainThreadSecretState] ${password ? "P" : "No p"}assword found for: `,
            extensionId,
            key
        );
        return password;
    }
    $setPassword(extensionId, key, value) {
        this.logService.trace(
            `[mainThreadSecretState] Setting password for ${extensionId} extension: `,
            key
        );
        return this._sequencer.queue(extensionId, () => this.doSetPassword(extensionId, key, value));
    }
    async doSetPassword(extensionId, key, value) {
        const fullKey = this.getKey(extensionId, key);
        await this.secretStorageService.set(fullKey, value);
        this.logService.trace("[mainThreadSecretState] Password set for: ", extensionId, key);
    }
    $deletePassword(extensionId, key) {
        this.logService.trace(
            `[mainThreadSecretState] Deleting password for ${extensionId} extension: `,
            key
        );
        return this._sequencer.queue(extensionId, () => this.doDeletePassword(extensionId, key));
    }
    async doDeletePassword(extensionId, key) {
        const fullKey = this.getKey(extensionId, key);
        await this.secretStorageService.delete(fullKey);
        this.logService.trace("[mainThreadSecretState] Password deleted for: ", extensionId, key);
    }
    $getKeys(extensionId) {
        this.logService.trace(`[mainThreadSecretState] Getting keys for ${extensionId} extension: `);
        return this._sequencer.queue(extensionId, () => this.doGetKeys(extensionId));
    }
    async doGetKeys(extensionId) {
        if (!this.secretStorageService.keys) {
            throw ( new Error("Secret storage service does not support keys() method"));
        }
        const allKeys = await ( this.secretStorageService.keys());
        const keys = ( ( allKeys.map(key => this.parseKey(key))).filter(
            parsedKey => parsedKey !== undefined && parsedKey.extensionId === extensionId
        ).map((
            {
                key
            }
        ) => key));
        this.logService.trace(`[mainThreadSecretState] Got ${keys.length}key(s) for: `, extensionId);
        return keys;
    }
    getKey(extensionId, key) {
        return JSON.stringify({
            extensionId,
            key
        });
    }
    parseKey(key) {
        try {
            return JSON.parse(key);
        } catch {
            return undefined;
        }
    }
};
MainThreadSecretState = __decorate([extHostNamedCustomer(MainContext.MainThreadSecretState), ( __param(1, ISecretStorageService)), ( __param(2, ILogService)), ( __param(3, IBrowserWorkbenchEnvironmentService))], MainThreadSecretState);

export { MainThreadSecretState };
