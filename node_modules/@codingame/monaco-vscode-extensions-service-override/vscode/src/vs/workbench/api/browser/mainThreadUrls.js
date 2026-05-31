
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IURLService } from '@codingame/monaco-vscode-api/vscode/vs/platform/url/common/url.service';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IExtensionUrlHandler } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/browser/extensionUrlHandler.service';
import { ExtensionIdentifier } from '@codingame/monaco-vscode-api/vscode/vs/platform/extensions/common/extensions';
import '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/url/browser/trustedDomainService';
import { ITrustedDomainService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/url/common/trustedDomainService.service';

class ExtensionUrlHandler {
    constructor(proxy, handle, extensionId, extensionDisplayName) {
        this.proxy = proxy;
        this.handle = handle;
        this.extensionId = extensionId;
        this.extensionDisplayName = extensionDisplayName;
    }
    async handleURL(uri, options) {
        if (!ExtensionIdentifier.equals(this.extensionId, uri.authority)) {
            return false;
        }
        await this.proxy.$handleExternalUri(this.handle, uri);
        return true;
    }
}
let MainThreadUrls = class MainThreadUrls extends Disposable {
    constructor(context, trustedDomainService, urlService, extensionUrlHandler) {
        super();
        this.urlService = urlService;
        this.extensionUrlHandler = extensionUrlHandler;
        this.handlers = ( new Map());
        this.proxy = ( context.getProxy(ExtHostContext.ExtHostUrls));
    }
    async $registerUriHandler(handle, extensionId, extensionDisplayName) {
        const handler = ( new ExtensionUrlHandler(this.proxy, handle, extensionId, extensionDisplayName));
        const disposable = this.urlService.registerHandler(handler);
        this.handlers.set(handle, {
            extensionId,
            disposable
        });
        this.extensionUrlHandler.registerExtensionHandler(extensionId, handler);
        return undefined;
    }
    async $unregisterUriHandler(handle) {
        const tuple = this.handlers.get(handle);
        if (!tuple) {
            return undefined;
        }
        const {
            extensionId,
            disposable
        } = tuple;
        this.extensionUrlHandler.unregisterExtensionHandler(extensionId);
        this.handlers.delete(handle);
        disposable.dispose();
        return undefined;
    }
    async $createAppUri(uri) {
        return this.urlService.create(uri);
    }
    dispose() {
        super.dispose();
        this.handlers.forEach((
            {
                disposable
            }
        ) => disposable.dispose());
        this.handlers.clear();
    }
};
MainThreadUrls = __decorate([extHostNamedCustomer(MainContext.MainThreadUrls), ( __param(1, ITrustedDomainService)), ( __param(2, IURLService)), ( __param(3, IExtensionUrlHandler))], MainThreadUrls);

export { MainThreadUrls };
