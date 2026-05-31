
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IDataChannelService } from '@codingame/monaco-vscode-api/vscode/vs/platform/dataChannel/common/dataChannel.service';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

let MainThreadDataChannels = class MainThreadDataChannels extends Disposable {
    constructor(extHostContext, _dataChannelService) {
        super();
        this._dataChannelService = _dataChannelService;
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostDataChannels));
        this._register(this._dataChannelService.onDidSendData(e => {
            this._proxy.$onDidReceiveData(e.channelId, e.data);
        }));
    }
};
MainThreadDataChannels = __decorate([extHostNamedCustomer(MainContext.MainThreadDataChannels), ( __param(1, IDataChannelService))], MainThreadDataChannels);

export { MainThreadDataChannels };
