import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
/**
 * A single server entry exposed by the gateway at the workbench layer.
 */
export interface IMcpGatewayResultServer {
    readonly label: string;
    readonly address: URI;
}
/**
 * Result of creating an MCP gateway, which is itself disposable.
 */
export interface IMcpGatewayResult extends IDisposable {
    /**
     * The servers currently exposed by this gateway.
     */
    readonly servers: readonly IMcpGatewayResultServer[];
    /**
     * Event that fires when the set of servers changes.
     */
    readonly onDidChangeServers: Event<readonly IMcpGatewayResultServer[]>;
}
