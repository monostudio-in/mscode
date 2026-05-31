
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../base/common/event.js';
import '../../../base/common/errors.js';
import { URI } from '../../../base/common/uri.js';
import { DefaultURITransformer, transformAndReviveIncomingURIs } from '../../../base/common/uriIpc.js';
import { ILogService } from '../../log/common/log.service.js';
import { IAllowedMcpServersService } from './mcpManagement.service.js';
import { AbstractMcpManagementService } from './mcpManagementService.js';

function transformIncomingURI(uri, transformer) {
    return uri ? URI.revive(uri) : undefined;
}
function transformIncomingServer(mcpServer, transformer) {
    transformer = transformer ? transformer : DefaultURITransformer;
    const manifest = mcpServer.manifest;
    const transformed = transformAndReviveIncomingURIs({
        ...mcpServer,
        ...{
            manifest: undefined
        }
    }, transformer);
    return {
        ...transformed,
        ...{
            manifest
        }
    };
}
let McpManagementChannelClient = class McpManagementChannelClient extends AbstractMcpManagementService {
    get onInstallMcpServer() {
        return this._onInstallMcpServer.event;
    }
    get onDidInstallMcpServers() {
        return this._onDidInstallMcpServers.event;
    }
    get onUninstallMcpServer() {
        return this._onUninstallMcpServer.event;
    }
    get onDidUninstallMcpServer() {
        return this._onDidUninstallMcpServer.event;
    }
    get onDidUpdateMcpServers() {
        return this._onDidUpdateMcpServers.event;
    }
    constructor(channel, allowedMcpServersService, logService) {
        super(allowedMcpServersService, logService);
        this.channel = channel;
        this._onInstallMcpServer = this._register(( new Emitter()));
        this._onDidInstallMcpServers = this._register(( new Emitter()));
        this._onUninstallMcpServer = this._register(( new Emitter()));
        this._onDidUninstallMcpServer = this._register(( new Emitter()));
        this._onDidUpdateMcpServers = this._register(( new Emitter()));
        this._register(
            this.channel.listen("onInstallMcpServer")(e => this._onInstallMcpServer.fire(({
                ...e,
                mcpResource: transformIncomingURI(e.mcpResource)
            })))
        );
        this._register(
            this.channel.listen("onDidInstallMcpServers")(results => this._onDidInstallMcpServers.fire(( results.map(e => ({
                ...e,
                local: e.local ? transformIncomingServer(e.local, null) : e.local,
                mcpResource: transformIncomingURI(e.mcpResource)
            })))))
        );
        this._register(
            this.channel.listen("onDidUpdateMcpServers")(results => this._onDidUpdateMcpServers.fire(( results.map(e => ({
                ...e,
                local: e.local ? transformIncomingServer(e.local, null) : e.local,
                mcpResource: transformIncomingURI(e.mcpResource)
            })))))
        );
        this._register(
            this.channel.listen("onUninstallMcpServer")(e => this._onUninstallMcpServer.fire(({
                ...e,
                mcpResource: transformIncomingURI(e.mcpResource)
            })))
        );
        this._register(
            this.channel.listen("onDidUninstallMcpServer")(e => this._onDidUninstallMcpServer.fire(({
                ...e,
                mcpResource: transformIncomingURI(e.mcpResource)
            })))
        );
    }
    install(server, options) {
        return Promise.resolve(this.channel.call("install", [server, options])).then(local => transformIncomingServer(local, null));
    }
    installFromGallery(extension, installOptions) {
        return Promise.resolve(this.channel.call("installFromGallery", [extension, installOptions])).then(local => transformIncomingServer(local, null));
    }
    uninstall(extension, options) {
        return Promise.resolve(this.channel.call("uninstall", [extension, options]));
    }
    getInstalled(mcpResource) {
        return Promise.resolve(this.channel.call("getInstalled", [mcpResource])).then(servers => ( servers.map(server => transformIncomingServer(server, null))));
    }
    updateMetadata(local, gallery, mcpResource) {
        return Promise.resolve(this.channel.call("updateMetadata", [local, gallery, mcpResource])).then(local => transformIncomingServer(local, null));
    }
};
McpManagementChannelClient = ( __decorate([( __param(1, IAllowedMcpServersService)), ( __param(2, ILogService))], McpManagementChannelClient));

export { McpManagementChannelClient };
