
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { createElement, addDisposableListener } from '@codingame/monaco-vscode-api/vscode/vs/base/browser/dom';
import { parentOriginHash } from '@codingame/monaco-vscode-api/vscode/vs/base/browser/iframe';
import { mainWindow } from '@codingame/monaco-vscode-api/vscode/vs/base/browser/window';
import { Barrier } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { VSBuffer } from '@codingame/monaco-vscode-api/vscode/vs/base/common/buffer';
import { onUnexpectedError, canceled } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { Emitter, Event } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable, toDisposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { COI, FileAccess } from '@codingame/monaco-vscode-api/vscode/vs/base/common/network';
import { isWeb, Language, language } from '@codingame/monaco-vscode-api/vscode/vs/base/common/platform';
import { joinPath } from '@codingame/monaco-vscode-api/vscode/vs/base/common/resources';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { generateUuid } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uuid';
import { getNLSLanguage, getNLSMessages } from '@codingame/monaco-vscode-api/vscode/vs/nls';
import { ILabelService } from '@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service';
import { ILayoutService } from '@codingame/monaco-vscode-api/vscode/vs/platform/layout/browser/layoutService.service';
import { ILogService, ILoggerService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { IProductService } from '@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service';
import { StorageScope, StorageTarget } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage';
import { IStorageService } from '@codingame/monaco-vscode-api/vscode/vs/platform/storage/common/storage.service';
import { ITelemetryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service';
import { isLoggingOnly } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetryUtils';
import { IUserDataProfilesService } from '@codingame/monaco-vscode-api/vscode/vs/platform/userDataProfile/common/userDataProfile.service';
import { WebWorkerDescriptor } from '@codingame/monaco-vscode-api/vscode/vs/platform/webWorker/browser/webWorkerDescriptor';
import { IWebWorkerService } from '@codingame/monaco-vscode-api/vscode/vs/platform/webWorker/browser/webWorkerService.service';
import { WorkbenchState } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace';
import { IWorkspaceContextService } from '@codingame/monaco-vscode-api/vscode/vs/platform/workspace/common/workspace.service';
import { IBrowserWorkbenchEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/environment/browser/environmentService.service';
import { IDefaultLogLevelsService } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/log/common/defaultLogLevels.service';
import { ExtensionHostExitCode, isMessageOfType, MessageType, createMessageOfType, UIKind } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensionHostProtocol';
import { ExtensionHostStartup } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions';

let WebWorkerExtensionHost = class WebWorkerExtensionHost extends Disposable {
    constructor(
        runningLocation,
        startup,
        _initDataProvider,
        _telemetryService,
        _contextService,
        _labelService,
        _logService,
        _loggerService,
        _environmentService,
        _userDataProfilesService,
        _productService,
        _layoutService,
        _storageService,
        _webWorkerService,
        _defaultLogLevelsService
    ) {
        super();
        this.runningLocation = runningLocation;
        this.startup = startup;
        this._initDataProvider = _initDataProvider;
        this._telemetryService = _telemetryService;
        this._contextService = _contextService;
        this._labelService = _labelService;
        this._logService = _logService;
        this._loggerService = _loggerService;
        this._environmentService = _environmentService;
        this._userDataProfilesService = _userDataProfilesService;
        this._productService = _productService;
        this._layoutService = _layoutService;
        this._storageService = _storageService;
        this._webWorkerService = _webWorkerService;
        this._defaultLogLevelsService = _defaultLogLevelsService;
        this.pid = null;
        this.remoteAuthority = null;
        this.extensions = null;
        this._onDidExit = this._register(( new Emitter()));
        this.onExit = this._onDidExit.event;
        this._isTerminating = false;
        this._protocolPromise = null;
        this._protocol = null;
        this._extensionHostLogsLocation = joinPath(this._environmentService.extHostLogsPath, "webWorker");
    }
    async _getWebWorkerExtensionHostIframeSrc() {
        const suffixSearchParams = ( new URLSearchParams());
        if (this._environmentService.debugExtensionHost && this._environmentService.debugRenderer) {
            suffixSearchParams.set("debugged", "1");
        }
        COI.addSearchParam(suffixSearchParams, true, true);
        suffixSearchParams.set("parentOrigin", mainWindow.origin);
        const suffix = `?${( suffixSearchParams.toString())}`;
        const iframeModulePath = `vs/workbench/services/extensions/worker/webWorkerExtensionHostIframe.html`;
        if (isWeb) {
            const webEndpointUrlTemplate = this._productService.webEndpointUrlTemplate;
            const commit = this._productService.commit;
            const quality = this._productService.quality;
            if (webEndpointUrlTemplate && commit && quality) {
                const key = "webWorkerExtensionHostIframeStableOriginUUID";
                let stableOriginUUID = this._storageService.get(key, StorageScope.WORKSPACE);
                if (typeof stableOriginUUID === "undefined") {
                    stableOriginUUID = generateUuid();
                    this._storageService.store(key, stableOriginUUID, StorageScope.WORKSPACE, StorageTarget.MACHINE);
                }
                const hash = await parentOriginHash(mainWindow.origin, stableOriginUUID);
                const baseUrl = (
                webEndpointUrlTemplate.replace("{{uuid}}", `v--${hash}`).replace("{{commit}}", commit).replace("{{quality}}", quality));
                const res = ( new URL(`${baseUrl}/out/${iframeModulePath}${suffix}`));
                res.searchParams.set("salt", stableOriginUUID);
                return ( res.toString());
            }
        }
        const relativeExtensionHostIframeSrc = this._webWorkerService.getWorkerUrl(( new WebWorkerDescriptor({
            esmModuleLocation: ( FileAccess.asBrowserUri(iframeModulePath)),
            esmModuleLocationBundler: ( new URL(`../worker/webWorkerExtensionHostIframe.html`, import.meta.url)),
            label: "webWorkerExtensionHostIframe"
        })));
        return `${relativeExtensionHostIframeSrc}${suffix}`;
    }
    async start() {
        if (!this._protocolPromise) {
            this._protocolPromise = this._startInsideIframe();
            this._protocolPromise.then(protocol => this._protocol = protocol);
        }
        return this._protocolPromise;
    }
    async _startInsideIframe() {
        const webWorkerExtensionHostIframeSrc = await this._getWebWorkerExtensionHostIframeSrc();
        const emitter = this._register(( new Emitter()));
        const iframe = createElement("iframe");
        iframe.setAttribute("class", "web-worker-ext-host-iframe");
        iframe.setAttribute("sandbox", "allow-scripts allow-same-origin");
        iframe.setAttribute("allow", "usb; serial; hid; cross-origin-isolated; local-network-access;");
        iframe.setAttribute("aria-hidden", "true");
        iframe.style.display = "none";
        const vscodeWebWorkerExtHostId = generateUuid();
        iframe.setAttribute(
            "src",
            `${webWorkerExtensionHostIframeSrc}&vscodeWebWorkerExtHostId=${vscodeWebWorkerExtHostId}`
        );
        const barrier = ( new Barrier());
        let port;
        let barrierError = null;
        let barrierHasError = false;
        let startTimeout = undefined;
        const rejectBarrier = (exitCode, error) => {
            barrierError = error;
            barrierHasError = true;
            onUnexpectedError(barrierError);
            clearTimeout(startTimeout);
            this._onDidExit.fire([ExtensionHostExitCode.UnexpectedError, barrierError.message]);
            barrier.open();
        };
        const resolveBarrier = messagePort => {
            port = messagePort;
            clearTimeout(startTimeout);
            barrier.open();
        };
        startTimeout = setTimeout(() => {
            console.warn(
                `The Web Worker Extension Host did not start in 60s, that might be a problem.`
            );
        }, 60000);
        this._register(addDisposableListener(mainWindow, "message", event => {
            if (event.source !== iframe.contentWindow) {
                return;
            }
            if (event.data.vscodeWebWorkerExtHostId !== vscodeWebWorkerExtHostId) {
                return;
            }
            if (event.data.error) {
                const {
                    name,
                    message,
                    stack
                } = event.data.error;
                const err = ( new Error());
                err.message = message;
                err.name = name;
                err.stack = stack;
                return rejectBarrier(ExtensionHostExitCode.UnexpectedError, err);
            }
            if (event.data.type === "vscode.bootstrap.nls") {
                iframe.contentWindow.postMessage({
                    type: event.data.type,
                    data: {
                        workerUrl: this._webWorkerService.getWorkerUrl(extensionHostWorkerMainDescriptor),
                        workerOptions: this._webWorkerService.getWorkerOptions(extensionHostWorkerMainDescriptor),
                        fileRoot: globalThis._VSCODE_FILE_ROOT,
                        nls: {
                            messages: getNLSMessages(),
                            language: getNLSLanguage()
                        }
                    }
                }, "*");
                return;
            }
            const {
                data
            } = event.data;
            if (barrier.isOpen() || !(data instanceof mainWindow.MessagePort)) {
                console.warn("UNEXPECTED message", event);
                const err = ( new Error("UNEXPECTED message"));
                return rejectBarrier(ExtensionHostExitCode.UnexpectedError, err);
            }
            resolveBarrier(data);
        }));
        this._layoutService.mainContainer.appendChild(iframe);
        this._register(toDisposable(() => iframe.remove()));
        await barrier.wait();
        if (barrierHasError) {
            throw barrierError;
        }
        const messagePorts = this._environmentService.options?.messagePorts ?? ( new Map());
        iframe.contentWindow.postMessage({
            type: "vscode.init",
            data: messagePorts
        }, "*", [...( messagePorts.values())]);
        port.onmessage = event => {
            const {
                data
            } = event;
            if (!(data instanceof mainWindow.ArrayBuffer)) {
                console.warn("UNKNOWN data received", data);
                this._onDidExit.fire([77, "UNKNOWN data received"]);
                return;
            }
            emitter.fire(VSBuffer.wrap(new mainWindow.Uint8Array(data, 0, data.byteLength)));
        };
        const protocol = {
            onMessage: emitter.event,
            send: vsbuf => {
                const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                port.postMessage(data, [data]);
            }
        };
        return this._performHandshake(protocol);
    }
    async _performHandshake(protocol) {
        await Event.toPromise(
            Event.filter(protocol.onMessage, msg => isMessageOfType(msg, MessageType.Ready))
        );
        if (this._isTerminating) {
            throw canceled();
        }
        protocol.send(VSBuffer.fromString(JSON.stringify(await this._createExtHostInitData())));
        if (this._isTerminating) {
            throw canceled();
        }
        await Event.toPromise(
            Event.filter(protocol.onMessage, msg => isMessageOfType(msg, MessageType.Initialized))
        );
        if (this._isTerminating) {
            throw canceled();
        }
        return protocol;
    }
    dispose() {
        if (this._isTerminating) {
            return;
        }
        this._isTerminating = true;
        this._protocol?.send(createMessageOfType(MessageType.Terminate));
        super.dispose();
    }
    getInspectPort() {
        return undefined;
    }
    enableInspectPort() {
        return Promise.resolve(false);
    }
    async _createExtHostInitData() {
        const initData = await this._initDataProvider.getInitData();
        this.extensions = initData.extensions;
        const workspace = this._contextService.getWorkspace();
        const nlsBaseUrl = this._productService.extensionsGallery?.nlsBaseUrl;
        let nlsUrlWithDetails = undefined;
        if (nlsBaseUrl && this._productService.commit && !Language.isDefaultVariant()) {
            nlsUrlWithDetails = URI.joinPath(( URI.parse(nlsBaseUrl)), this._productService.commit, this._productService.version, Language.value());
        }
        return {
            commit: this._productService.commit,
            version: this._productService.version,
            quality: this._productService.quality,
            date: this._productService.date,
            parentPid: 0,
            environment: {
                isExtensionDevelopmentDebug: this._environmentService.debugRenderer,
                appName: this._productService.nameLong,
                appHost: this._productService.embedderIdentifier ?? (isWeb ? "web" : "desktop"),
                appUriScheme: this._productService.urlProtocol,
                appLanguage: language,
                isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
                isPortable: false,
                extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
                extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
                globalStorageHome: this._userDataProfilesService.defaultProfile.globalStorageHome,
                workspaceStorageHome: this._environmentService.workspaceStorageHome,
                extensionLogLevel: this._defaultLogLevelsService.defaultLogLevels.extensions,
                isSessionsWindow: this._environmentService.isSessionsWindow
            },
            workspace: this._contextService.getWorkbenchState() === WorkbenchState.EMPTY ? undefined : {
                configuration: workspace.configuration || undefined,
                id: workspace.id,
                name: this._labelService.getWorkspaceLabel(workspace),
                transient: workspace.transient
            },
            consoleForward: {
                includeStack: false,
                logNative: this._environmentService.debugRenderer
            },
            extensions: this.extensions.toSnapshot(),
            nlsBaseUrl: nlsUrlWithDetails,
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
            logsLocation: this._extensionHostLogsLocation,
            autoStart: (this.startup === ExtensionHostStartup.EagerAutoStart || this.startup === ExtensionHostStartup.LazyAutoStart),
            remote: {
                authority: this._environmentService.remoteAuthority,
                connectionData: null,
                isRemote: false
            },
            uiKind: isWeb ? UIKind.Web : UIKind.Desktop
        };
    }
};
WebWorkerExtensionHost = ( __decorate([( __param(3, ITelemetryService)), ( __param(4, IWorkspaceContextService)), ( __param(5, ILabelService)), ( __param(6, ILogService)), ( __param(7, ILoggerService)), ( __param(8, IBrowserWorkbenchEnvironmentService)), ( __param(9, IUserDataProfilesService)), ( __param(10, IProductService)), ( __param(11, ILayoutService)), ( __param(12, IStorageService)), ( __param(13, IWebWorkerService)), ( __param(14, IDefaultLogLevelsService))], WebWorkerExtensionHost));
const extensionHostWorkerMainDescriptor = ( new WebWorkerDescriptor({
    label: "extensionHostWorkerMain"
}));

export { WebWorkerExtensionHost };
