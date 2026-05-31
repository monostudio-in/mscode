
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { MainContext } from './extHost.protocol.js';
import { URI } from '../../../base/common/uri.js';
import { toDisposable } from '../../../base/common/lifecycle.js';
import { onUnexpectedError } from '../../../base/common/errors.js';
import { ExtensionIdentifierSet } from '../../../platform/extensions/common/extensions.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';

var ExtHostUrls_1;
let ExtHostUrls = class ExtHostUrls {
    static {
        ExtHostUrls_1 = this;
    }
    static {
        this.HandlePool = 0;
    }
    constructor(extHostRpc) {
        this.handles = ( new ExtensionIdentifierSet());
        this.handlers = ( new Map());
        this._proxy = ( extHostRpc.getProxy(MainContext.MainThreadUrls));
    }
    registerUriHandler(extension, handler) {
        const extensionId = extension.identifier;
        if (( this.handles.has(extensionId))) {
            throw ( new Error(`Protocol handler already registered for extension ${extensionId}`));
        }
        const handle = ExtHostUrls_1.HandlePool++;
        this.handles.add(extensionId);
        this.handlers.set(handle, handler);
        this._proxy.$registerUriHandler(handle, extensionId, extension.displayName || extension.name);
        return toDisposable(() => {
            this.handles.delete(extensionId);
            this.handlers.delete(handle);
            this._proxy.$unregisterUriHandler(handle);
        });
    }
    $handleExternalUri(handle, uri) {
        const handler = this.handlers.get(handle);
        if (!handler) {
            return Promise.resolve(undefined);
        }
        try {
            handler.handleUri(URI.revive(uri));
        } catch (err) {
            onUnexpectedError(err);
        }
        return Promise.resolve(undefined);
    }
    async createAppUri(uri) {
        return URI.revive(await this._proxy.$createAppUri(uri));
    }
};
ExtHostUrls = ExtHostUrls_1 = ( __decorate([( __param(0, IExtHostRpcService))], ExtHostUrls));
const IExtHostUrlsService = ( createDecorator("IExtHostUrlsService"));

export { ExtHostUrls, IExtHostUrlsService };
