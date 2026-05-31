
import { MainContext } from './extHost.protocol.js';
import { Emitter } from '../../../base/common/event.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';

class ExtHostSecretState {
    constructor(mainContext) {
        this._onDidChangePassword = ( new Emitter());
        this.onDidChangePassword = this._onDidChangePassword.event;
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadSecretState));
    }
    async $onDidChangePassword(e) {
        this._onDidChangePassword.fire(e);
    }
    get(extensionId, key) {
        return this._proxy.$getPassword(extensionId, key);
    }
    store(extensionId, key, value) {
        return this._proxy.$setPassword(extensionId, key, value);
    }
    delete(extensionId, key) {
        return this._proxy.$deletePassword(extensionId, key);
    }
    keys(extensionId) {
        return this._proxy.$getKeys(extensionId);
    }
}
const IExtHostSecretState = ( createDecorator("IExtHostSecretState"));

export { ExtHostSecretState, IExtHostSecretState };
