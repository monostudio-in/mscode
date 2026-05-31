import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { AiSettingsSearchResult } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiSettingsSearch/common/aiSettingsSearch";
import { IAiSettingsSearchService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/aiSettingsSearch/common/aiSettingsSearch.service";
import { MainThreadAiSettingsSearchShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadAiSettingsSearch extends Disposable implements MainThreadAiSettingsSearchShape {
    private readonly _settingsSearchService;
    private readonly _proxy;
    private readonly _registrations;
    constructor(context: IExtHostContext, _settingsSearchService: IAiSettingsSearchService);
    $registerAiSettingsSearchProvider(handle: number): void;
    $unregisterAiSettingsSearchProvider(handle: number): void;
    $handleSearchResult(handle: number, result: AiSettingsSearchResult): void;
}
