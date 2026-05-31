import { OutputChannelUpdateMode } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/output/common/output";
import { IOutputService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/output/common/output.service";
import { MainThreadOutputServiceShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IViewsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/views/common/viewsService.service";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { IStatusbarService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/statusbar/browser/statusbar.service";
export declare class MainThreadOutputService extends Disposable implements MainThreadOutputServiceShape {
    private static _extensionIdPool;
    private readonly _proxy;
    private readonly _outputService;
    private readonly _viewsService;
    private readonly _configurationService;
    private readonly _statusbarService;
    private readonly _outputStatusItem;
    constructor(extHostContext: IExtHostContext, outputService: IOutputService, viewsService: IViewsService, configurationService: IConfigurationService, statusbarService: IStatusbarService);
    $register(label: string, file: UriComponents, languageId: string | undefined, extensionId: string): Promise<string>;
    $update(channelId: string, mode: OutputChannelUpdateMode, till?: number): Promise<void>;
    $reveal(channelId: string, preserveFocus: boolean): Promise<void>;
    private _showChannelQuietly;
    $close(channelId: string): Promise<void>;
    $dispose(channelId: string): Promise<void>;
    private _getChannel;
}
