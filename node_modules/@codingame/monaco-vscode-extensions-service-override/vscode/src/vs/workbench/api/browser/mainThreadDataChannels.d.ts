import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IDataChannelService } from "@codingame/monaco-vscode-api/vscode/vs/platform/dataChannel/common/dataChannel.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadDataChannelsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadDataChannels extends Disposable implements MainThreadDataChannelsShape {
    private readonly _dataChannelService;
    private readonly _proxy;
    constructor(extHostContext: IExtHostContext, _dataChannelService: IDataChannelService);
}
