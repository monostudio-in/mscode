
import { disposableTimeout, timeout } from '../../../../base/common/async.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import '../../../../base/common/observableInternal/index.js';
import { McpConnectionState, McpServerCacheState, McpServerTransportType } from './mcpTypes.js';
import { autorun, autorunSelfDisposable } from '../../../../base/common/observableInternal/reactions/autorun.js';

function startServerByFilter(mcpService, filter, timeout = 5000) {
    return ( new Promise((resolve, reject) => {
        const store = ( new DisposableStore());
        store.add(autorun(reader => {
            const servers = mcpService.servers.read(reader);
            const server = servers.find(filter);
            if (server) {
                server.start({
                    promptType: "all-untrusted"
                }).then(state => {
                    if (state.state === McpConnectionState.Kind.Error) {
                        server.showOutput();
                    }
                });
                resolve();
                store.dispose();
            }
        }));
        store.add(disposableTimeout(() => {
            store.dispose();
            reject(( new CancellationError()));
        }, timeout));
    }));
}
async function startServerAndWaitForLiveTools(server, opts, token) {
    const r = await server.start(opts);
    const store = ( new DisposableStore());
    const ok = await ( new Promise(resolve => {
        if (token?.isCancellationRequested || r.state === McpConnectionState.Kind.Error || r.state === McpConnectionState.Kind.Stopped) {
            return resolve(false);
        }
        if (token) {
            store.add(token.onCancellationRequested(() => {
                resolve(false);
            }));
        }
        store.add(autorun(reader => {
            const connState = server.connectionState.read(reader).state;
            if (connState === McpConnectionState.Kind.Error || connState === McpConnectionState.Kind.Stopped) {
                resolve(false);
            }
            const toolState = server.cacheState.read(reader);
            if (toolState === McpServerCacheState.Live) {
                resolve(true);
            }
        }));
    }));
    store.dispose();
    if (ok) {
        await timeout(0);
    }
    return ok;
}
function mcpServerToSourceData(server, reader) {
    const metadata = server.serverMetadata.read(reader);
    return {
        type: "mcp",
        serverLabel: metadata?.serverName,
        instructions: metadata?.serverInstructions,
        label: server.definition.label,
        collectionId: server.collection.id,
        definitionId: server.definition.id
    };
}
function canLoadMcpNetworkResourceDirectly(resource, server) {
    let isResourceRequestValid = false;
    if (resource.protocol === "http:") {
        const launch = server?.connection.get()?.launchDefinition;
        if (launch && launch.type === McpServerTransportType.HTTP && launch.uri.authority.toLowerCase() === resource.host.toLowerCase()) {
            isResourceRequestValid = true;
        }
    } else if (resource.protocol === "https:") {
        isResourceRequestValid = true;
    }
    return isResourceRequestValid;
}
function isTaskResult(obj) {
    return obj.task !== undefined;
}
function findMcpServer(mcpService, filter, token) {
    return ( new Promise(resolve => {
        autorunSelfDisposable(reader => {
            if (token) {
                if (token.isCancellationRequested) {
                    reader.dispose();
                    resolve(undefined);
                    return;
                }
                reader.store.add(token.onCancellationRequested(() => {
                    reader.dispose();
                    resolve(undefined);
                }));
            }
            const servers = mcpService.servers.read(reader);
            const server = servers.find(filter);
            if (server) {
                resolve(server);
                reader.dispose();
            }
        });
    }));
}
function translateMcpLogMessage(logger, params, prefix = "") {
    let contents = typeof params.data === "string" ? params.data : JSON.stringify(params.data);
    if (params.logger) {
        contents = `${params.logger}: ${contents}`;
    }
    if (prefix) {
        contents = `${prefix} ${contents}`;
    }
    switch (params?.level) {
    case "debug":
        logger.debug(contents);
        break;
    case "info":
    case "notice":
        logger.info(contents);
        break;
    case "warning":
        logger.warn(contents);
        break;
    case "error":
    case "critical":
    case "alert":
    case "emergency":
        logger.error(contents);
        break;
    default:
        logger.info(contents);
        break;
    }
}

export { canLoadMcpNetworkResourceDirectly, findMcpServer, isTaskResult, mcpServerToSourceData, startServerAndWaitForLiveTools, startServerByFilter, translateMcpLogMessage };
