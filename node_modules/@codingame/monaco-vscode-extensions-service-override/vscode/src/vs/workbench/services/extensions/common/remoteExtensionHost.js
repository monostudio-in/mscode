
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { VSBuffer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { Schemas } from '@codingame/monaco-vscode-api/vscode/vs/base/common/network';
import { language, isWeb } from '@codingame/monaco-vscode-api/vscode/vs/base/common/platform';
import { IExtensionHostDebugService } from '@codingame/monaco-vscode-api/vscode/vs/platform/debug/common/extensionHostDebug.service';
import { ILabelService } from '@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service';
import { ILogService, ILoggerService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { IProductService } from '@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service';
import { connectRemoteAgentExtensionHost } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAgentConnection';
import { IRemoteAuthorityResolverService } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver.service';
import { IRemoteSocketFactoryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteSocketFactoryService.service';
import { ISignService } from '@codingame/monaco-vscode-api/vscode/vs/platform/sign/common/sign.service';
import { ITelemetryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service';
import { isLoggingOnly } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetryUtils';
import { WorkbenchState } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace';
import { IWorkspaceContextService } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service';
import { IWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/common/environmentService.service';
import { IDefaultLogLevelsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/log/common/defaultLogLevels.service';
import { parseExtensionDevOptions } from './extensionDevOptions.js';
import { isMessageOfType, MessageType, UIKind, createMessageOfType } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtensionHostStartup } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions';

let RemoteExtensionHost = class RemoteExtensionHost extends Disposable {
    constructor(
        runningLocation,
        _initDataProvider,
        remoteSocketFactoryService,
        _contextService,
        _environmentService,
        _telemetryService,
        _logService,
        _loggerService,
        _labelService,
        remoteAuthorityResolverService,
        _extensionHostDebugService,
        _productService,
        _signService,
        _defaultLogLevelsService
    ) {
        super();
        this.runningLocation = runningLocation;
        this._initDataProvider = _initDataProvider;
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this._contextService = _contextService;
        this._environmentService = _environmentService;
        this._telemetryService = _telemetryService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._labelService = _labelService;
        this.remoteAuthorityResolverService = remoteAuthorityResolverService;
        this._extensionHostDebugService = _extensionHostDebugService;
        this._productService = _productService;
        this._signService = _signService;
        this._defaultLogLevelsService = _defaultLogLevelsService;
        this.pid = null;
        this.startup = ExtensionHostStartup.EagerAutoStart;
        this.extensions = null;
        this._onExit = this._register(( new Emitter()));
        this.onExit = this._onExit.event;
        this._hasDisconnected = false;
        this.remoteAuthority = this._initDataProvider.remoteAuthority;
        this._protocol = null;
        this._hasLostConnection = false;
        this._terminating = false;
        const devOpts = parseExtensionDevOptions(this._environmentService);
        this._isExtensionDevHost = devOpts.isExtensionDevHost;
    }
    start() {
        const options = {
            commit: this._productService.commit,
            quality: this._productService.quality,
            addressProvider: {
                getAddress: async () => {
                    const {
                        authority
                    } = await this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority);
                    return {
                        connectTo: authority.connectTo,
                        connectionToken: authority.connectionToken
                    };
                }
            },
            remoteSocketFactoryService: this.remoteSocketFactoryService,
            signService: this._signService,
            logService: this._logService,
            ipcLogger: null
        };
        return this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority).then(resolverResult => {
            const startParams = {
                language: language,
                debugId: this._environmentService.debugExtensionHost.debugId,
                break: this._environmentService.debugExtensionHost.break,
                port: this._environmentService.debugExtensionHost.port,
                env: {
                    ...this._environmentService.debugExtensionHost.env,
                    ...resolverResult.options?.extensionHostEnv
                }
            };
            const extDevLocs = this._environmentService.extensionDevelopmentLocationURI;
            let debugOk = true;
            if (extDevLocs && extDevLocs.length > 0) {
                if (extDevLocs[0].scheme === Schemas.file) {
                    debugOk = false;
                }
            }
            if (!debugOk) {
                startParams.break = false;
            }
            return connectRemoteAgentExtensionHost(options, startParams).then(result => {
                this._register(result);
                const {
                    protocol,
                    debugPort,
                    reconnectionToken
                } = result;
                const isExtensionDevelopmentDebug = typeof debugPort === "number";
                if (debugOk && this._environmentService.isExtensionDevelopment && this._environmentService.debugExtensionHost.debugId && debugPort) {
                    this._extensionHostDebugService.attachSession(
                        this._environmentService.debugExtensionHost.debugId,
                        debugPort,
                        this._initDataProvider.remoteAuthority
                    );
                }
                protocol.onDidDispose(() => {
                    this._onExtHostConnectionLost(reconnectionToken);
                });
                protocol.onSocketClose(() => {
                    if (this._isExtensionDevHost) {
                        this._onExtHostConnectionLost(reconnectionToken);
                    }
                });
                return ( new Promise((resolve, reject) => {
                    const handle = setTimeout(() => {
                        reject(
                            "The remote extension host took longer than 60s to send its ready message."
                        );
                    }, 60 * 1000);
                    const disposable = protocol.onMessage(msg => {
                        if (isMessageOfType(msg, MessageType.Ready)) {
                            this._createExtHostInitData(isExtensionDevelopmentDebug).then(data => {
                                protocol.send(VSBuffer.fromString(JSON.stringify(data)));
                            });
                            return;
                        }
                        if (isMessageOfType(msg, MessageType.Initialized)) {
                            clearTimeout(handle);
                            disposable.dispose();
                            this._protocol = protocol;
                            resolve(protocol);
                            return;
                        }
                        console.error(
                            `received unexpected message during handshake phase from the extension host: `,
                            msg
                        );
                    });
                }));
            });
        });
    }
    _onExtHostConnectionLost(reconnectionToken) {
        if (this._hasLostConnection) {
            return;
        }
        this._hasLostConnection = true;
        if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId) {
            this._extensionHostDebugService.close(this._environmentService.debugExtensionHost.debugId);
        }
        if (this._terminating) {
            return;
        }
        this._onExit.fire([0, reconnectionToken]);
    }
    async _createExtHostInitData(isExtensionDevelopmentDebug) {
        const remoteInitData = await this._initDataProvider.getInitData();
        this.extensions = remoteInitData.extensions;
        const workspace = this._contextService.getWorkspace();
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            quality: this._productService.quality,
            date: this._productService.date,
            parentPid: remoteInitData.pid,
            environment: {
                isExtensionDevelopmentDebug,
                appRoot: remoteInitData.appRoot,
                appName: this._productService.nameLong,
                appHost: this._productService.embedderIdentifier || "desktop",
                appUriScheme: this._productService.urlProtocol,
                isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
                appLanguage: language,
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: remoteInitData.globalStorageHome,
                workspaceStorageHome: remoteInitData.workspaceStorageHome,
                extensionLogLevel: this._defaultLogLevelsService.defaultLogLevels.extensions,
                isSessionsWindow: this._environmentService.isSessionsWindow
            },
            workspace: this._contextService.getWorkbenchState() === WorkbenchState.EMPTY ? null : {
                configuration: workspace.configuration,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            },
            remote: {
                isRemote: true,
                authority: this._initDataProvider.remoteAuthority,
                connectionData: remoteInitData.connectionData
            },
            consoleForward: {
                includeStack: false,
                logNative: Boolean(this._environmentService.debugExtensionHost.debugId)
            },
            extensions: this.extensions.toSnapshot(),
            telemetryInfo: {
                sessionId: this._telemetryService.sessionId,
                machineId: this._telemetryService.machineId,
                sqmId: this._telemetryService.sqmId,
                devDeviceId: this._telemetryService.devDeviceId ?? this._telemetryService.machineId,
                firstSessionDate: this._telemetryService.firstSessionDate,
                msftInternal: this._telemetryService.msftInternal
            },
            remoteExtensionTips: this._productService.remoteExtensionTips,
            virtualWorkspaceExtensionTips: this._productService.virtualWorkspaceExtensionTips,
            logLevel: this._logService.getLevel(),
            loggers: [...this._loggerService.getRegisteredLoggers()],
            logsLocation: remoteInitData.extensionHostLogsPath,
            autoStart: (this.startup === ExtensionHostStartup.EagerAutoStart),
            uiKind: isWeb ? UIKind.Web : UIKind.Desktop
        };
    }
    getInspectPort() {
        return undefined;
    }
    enableInspectPort() {
        return Promise.resolve(false);
    }
    async disconnect() {
        if (this._protocol && !this._hasDisconnected) {
            this._protocol.send(createMessageOfType(MessageType.Terminate));
            this._protocol.sendDisconnect();
            this._hasDisconnected = true;
            await this._protocol.drain();
        }
    }
    dispose() {
        super.dispose();
        this._terminating = true;
        this.disconnect();
        if (this._protocol) {
            this._protocol.getSocket().end();
            this._protocol = null;
        }
    }
};
RemoteExtensionHost = ( __decorate([( __param(2, IRemoteSocketFactoryService)), ( __param(3, IWorkspaceContextService)), ( __param(4, IWorkbenchEnvironmentService)), ( __param(5, ITelemetryService)), ( __param(6, ILogService)), ( __param(7, ILoggerService)), ( __param(8, ILabelService)), ( __param(9, IRemoteAuthorityResolverService)), ( __param(10, IExtensionHostDebugService)), ( __param(11, IProductService)), ( __param(12, ISignService)), ( __param(13, IDefaultLogLevelsService))], RemoteExtensionHost));

export { RemoteExtensionHost };
