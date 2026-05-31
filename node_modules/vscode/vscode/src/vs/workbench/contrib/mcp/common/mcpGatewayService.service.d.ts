import { URI } from "../../../../base/common/uri.js";
import { IMcpGatewayResult } from "./mcpGatewayService.js";
export declare const IWorkbenchMcpGatewayService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchMcpGatewayService>;
/**
* Service that manages MCP gateway HTTP endpoints in the workbench.
*
* The gateway provides an HTTP server that external processes can connect
* to in order to interact with MCP servers known to the editor. The server
* is shared among all gateways and is automatically torn down when the
* last gateway is disposed.
*/
export interface IWorkbenchMcpGatewayService {
    readonly _serviceBrand: undefined;
    /**
    * Creates a new MCP gateway endpoint.
    *
    * The gateway is assigned a secure random route ID to make the endpoint
    * URL unguessable without authentication.
    *
    * @param inRemote Whether to create the gateway in the remote environment.
    * If true, the gateway is created on the remote server (requires a remote connection).
    * If false, the gateway is created locally (requires a local Node process, e.g., desktop).
    * @param chatSessionResource Optional chat session resource URI to associate with this
    * gateway. When provided, MCP tool calls made through this gateway will be associated
    * with the chat session, enabling inline elicitation UI instead of notification fallback.
    * @returns A promise that resolves to the gateway result if successful,
    * or `undefined` if the requested environment is not available.
    */
    createGateway(inRemote: boolean, chatSessionResource?: URI): Promise<IMcpGatewayResult | undefined>;
}
