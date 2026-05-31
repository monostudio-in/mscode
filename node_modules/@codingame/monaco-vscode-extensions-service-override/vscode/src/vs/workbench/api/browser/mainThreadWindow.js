
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { IOpenerService } from '@codingame/monaco-vscode-api/vscode/vs/platform/opener/common/opener.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { IHostService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/host/browser/host.service';
import { IUserActivityService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/userActivity/common/userActivityService.service';
import { encodeBase64 } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';

let MainThreadWindow = class MainThreadWindow {
    constructor(extHostContext, hostService, openerService, userActivityService) {
        this.hostService = hostService;
        this.openerService = openerService;
        this.userActivityService = userActivityService;
        this.disposables = ( new DisposableStore());
        this.proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostWindow));
        Event.latch(hostService.onDidChangeFocus)(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
        userActivityService.onDidChangeIsActive(this.proxy.$onDidChangeWindowActive, this.proxy, this.disposables);
        this.registerNativeHandle();
    }
    dispose() {
        this.disposables.dispose();
    }
    registerNativeHandle() {
        Event.latch(this.hostService.onDidChangeActiveWindow)(async windowId => {
            const handle = await this.hostService.getNativeWindowHandle(windowId);
            this.proxy.$onDidChangeActiveNativeWindowHandle(handle ? encodeBase64(handle) : undefined);
        }, this, this.disposables);
    }
    $getInitialState() {
        return Promise.resolve({
            isFocused: this.hostService.hasFocus,
            isActive: this.userActivityService.isActive
        });
    }
    async $openUri(uriComponents, uriString, options) {
        const uri = ( URI.from(uriComponents));
        let target;
        if (uriString && ( ( URI.parse(uriString)).toString()) === ( uri.toString())) {
            target = uriString;
        } else {
            target = uri;
        }
        return this.openerService.open(target, {
            openExternal: true,
            allowTunneling: options.allowTunneling,
            allowContributedOpeners: options.allowContributedOpeners
        });
    }
    async $asExternalUri(uriComponents, options) {
        const result = await this.openerService.resolveExternalUri(URI.revive(uriComponents), options);
        return result.resolved;
    }
};
MainThreadWindow = __decorate([extHostNamedCustomer(MainContext.MainThreadWindow), ( __param(1, IHostService)), ( __param(2, IOpenerService)), ( __param(3, IUserActivityService))], MainThreadWindow);

export { MainThreadWindow };
