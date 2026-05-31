import { UriComponents } from "@codingame/monaco-vscode-api/vscode/vs/base/common/uri";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { ITelemetryData } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { IRawFileMatch2 } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/search";
import { ISearchService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/search.service";
import { MainThreadSearchShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IContextKeyService } from "@codingame/monaco-vscode-api/vscode/vs/platform/contextkey/common/contextkey.service";
import { AISearchKeyword } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/search/common/searchExtTypes";
export declare class MainThreadSearch implements MainThreadSearchShape {
    private readonly _searchService;
    private readonly _telemetryService;
    protected contextKeyService: IContextKeyService;
    private readonly _proxy;
    private readonly _searchProvider;
    private readonly _aiSearchProviderHandles;
    constructor(extHostContext: IExtHostContext, _searchService: ISearchService, _telemetryService: ITelemetryService, _configurationService: IConfigurationService, contextKeyService: IContextKeyService);
    dispose(): void;
    $registerTextSearchProvider(handle: number, scheme: string): void;
    $registerAITextSearchProvider(handle: number, scheme: string): void;
    $registerFileSearchProvider(handle: number, scheme: string): void;
    $unregisterProvider(handle: number): void;
    $handleFileMatch(handle: number, session: number, data: UriComponents[]): void;
    $handleTextMatch(handle: number, session: number, data: IRawFileMatch2[]): void;
    $handleKeywordResult(handle: number, session: number, data: AISearchKeyword): void;
    $handleTelemetry(eventName: string, data: ITelemetryData | undefined): void;
}
