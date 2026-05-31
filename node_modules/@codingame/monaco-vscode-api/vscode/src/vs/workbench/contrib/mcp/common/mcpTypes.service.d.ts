import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IObservable } from "../../../../base/common/observable.js";
import { IIterativePager } from "../../../../base/common/paging.js";
import { URI } from "../../../../base/common/uri.js";
import { IQueryOptions } from "../../../../platform/mcp/common/mcpManagement.js";
import { IWorkbenchLocalMcpServer, IWorkbencMcpServerInstallOptions } from "../../../services/mcp/common/mcpWorkbenchManagementService.js";
import { IEnablementModel } from "../../chat/common/enablement.js";
import { IMcpServerSamplingConfiguration } from "./mcpConfiguration.js";
import { IMcpServer, LazyCollectionState, McpCollectionDefinition, IAutostartResult, type IMcpConfigPath, type IMcpServerEditorOptions, type IWorkbenchMcpServer, type ISamplingOptions, type ISamplingResult, type ElicitResult, type IMcpToolCallContext } from "./mcpTypes.js";
import { MCP } from "./modelContextProtocol.js";
export declare const IMcpService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpService>;
export interface IMcpService {
    _serviceBrand: undefined;
    readonly servers: IObservable<readonly IMcpServer[]>;
    /** The enablement model for MCP servers. */
    readonly enablementModel: IEnablementModel;
    /** Resets the cached tools. */
    resetCaches(): void;
    /** Resets trusted MCP servers. */
    resetTrust(): void;
    /** Set if there are extensions that register MCP servers that have never been activated. */
    readonly lazyCollectionState: IObservable<{
        state: LazyCollectionState;
        collections: McpCollectionDefinition[];
    }>;
    /** Auto-starts pending servers based on user settings. */
    autostart(token?: CancellationToken): IObservable<IAutostartResult>;
    /** Cancels any current autostart @internal */
    cancelAutostart(): void;
    /** Activates extension-providing MCP servers that have not yet been discovered. */
    activateCollections(): Promise<void>;
}
export declare const IMcpWorkbenchService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpWorkbenchService>;
export interface IMcpWorkbenchService {
    readonly _serviceBrand: undefined;
    readonly onChange: Event<IWorkbenchMcpServer | undefined>;
    readonly onReset: Event<void>;
    readonly local: readonly IWorkbenchMcpServer[];
    getEnabledLocalMcpServers(): IWorkbenchLocalMcpServer[];
    queryLocal(): Promise<IWorkbenchMcpServer[]>;
    queryGallery(options?: IQueryOptions, token?: CancellationToken): Promise<IIterativePager<IWorkbenchMcpServer>>;
    canInstall(mcpServer: IWorkbenchMcpServer): true | IMarkdownString;
    install(server: IWorkbenchMcpServer, installOptions?: IWorkbencMcpServerInstallOptions): Promise<IWorkbenchMcpServer>;
    uninstall(mcpServer: IWorkbenchMcpServer): Promise<void>;
    getMcpConfigPath(arg: IWorkbenchLocalMcpServer): IMcpConfigPath | undefined;
    getMcpConfigPath(arg: URI): Promise<IMcpConfigPath | undefined>;
    openSearch(searchValue: string, preserveFocus?: boolean): Promise<void>;
    open(extension: IWorkbenchMcpServer | string, options?: IMcpServerEditorOptions): Promise<void>;
}
export interface IMcpSamplingService {
    _serviceBrand: undefined;
    sample(opts: ISamplingOptions, token?: CancellationToken): Promise<ISamplingResult>;
    /** Whether MCP sampling logs are available for this server */
    hasLogs(server: IMcpServer): boolean;
    /** Gets a text report of the MCP server's sampling usage */
    getLogText(server: IMcpServer): string;
    getConfig(server: IMcpServer): IMcpServerSamplingConfiguration;
    updateConfig(server: IMcpServer, mutate: (r: IMcpServerSamplingConfiguration) => unknown): Promise<IMcpServerSamplingConfiguration>;
}
export declare const IMcpSamplingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpSamplingService>;
export declare const IMcpElicitationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IMcpElicitationService>;
export interface IMcpElicitationService {
    _serviceBrand: undefined;
    /**
    * Elicits a response from the user. The `context` is optional and can be used
    * to provide additional information about the request.
    *
    * @param context Context for the elicitation, e.g. chat session ID.
    * @param elicitation Request to elicit a response.
    * @returns A promise that resolves to an {@link ElicitationResult}.
    */
    elicit(server: IMcpServer, context: IMcpToolCallContext | undefined, elicitation: MCP.ElicitRequest["params"], token: CancellationToken): Promise<ElicitResult>;
}
