
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Barrier } from '@codingame/monaco-vscode-api/vscode/vs/base/common/async';
import { Emitter } from '@codingame/monaco-vscode-api/vscode/vs/base/common/event';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IInstantiationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/instantiation/common/instantiation';
import { ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { RemoteAuthorityResolverErrorCode } from '@codingame/monaco-vscode-api/vscode/vs/platform/remote/common/remoteAuthorityResolver';
import { friendlyExtHostName, ExtensionHostManager } from './extensionHostManager.js';
import { ActivationKind } from '@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions';

let LazyCreateExtensionHostManager = class LazyCreateExtensionHostManager extends Disposable {
    get pid() {
        if (this._actual) {
            return this._actual.pid;
        }
        return null;
    }
    get kind() {
        return this._extensionHost.runningLocation.kind;
    }
    get startup() {
        return this._extensionHost.startup;
    }
    get friendyName() {
        return friendlyExtHostName(this.kind, this.pid);
    }
    constructor(
        extensionHost,
        _initialActivationEvents,
        _internalExtensionService,
        _instantiationService,
        _logService
    ) {
        super();
        this._initialActivationEvents = _initialActivationEvents;
        this._internalExtensionService = _internalExtensionService;
        this._instantiationService = _instantiationService;
        this._logService = _logService;
        this._onDidChangeResponsiveState = this._register(( new Emitter()));
        this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
        this._extensionHost = extensionHost;
        this.onDidExit = extensionHost.onExit;
        this._startCalled = ( new Barrier());
        this._actual = null;
    }
    dispose() {
        if (!this._actual) {
            this._extensionHost.dispose();
        }
        super.dispose();
    }
    _createActual(reason) {
        this._logService.info(`Creating lazy extension host (${this.friendyName}). Reason: ${reason}`);
        this._actual = this._register(this._instantiationService.createInstance(
            ExtensionHostManager,
            this._extensionHost,
            this._initialActivationEvents,
            this._internalExtensionService
        ));
        this._register(
            this._actual.onDidChangeResponsiveState(e => this._onDidChangeResponsiveState.fire(e))
        );
        return this._actual;
    }
    async _getOrCreateActualAndStart(reason) {
        if (this._actual) {
            return this._actual;
        }
        const actual = this._createActual(reason);
        await actual.ready();
        return actual;
    }
    get isReady() {
        return this._startCalled.isOpen() && (this._actual?.isReady ?? false);
    }
    async ready() {
        await this._startCalled.wait();
        if (this._actual) {
            await this._actual.ready();
        }
    }
    async disconnect() {
        await this._actual?.disconnect();
    }
    representsRunningLocation(runningLocation) {
        return this._extensionHost.runningLocation.equals(runningLocation);
    }
    async deltaExtensions(extensionsDelta) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.deltaExtensions(extensionsDelta);
        }
        if (extensionsDelta.myToAdd.length > 0) {
            const actual = this._createActual(
                `contains ${extensionsDelta.myToAdd.length} new extension(s) (installed or enabled): ${( extensionsDelta.myToAdd.map(extId => extId.value))}`
            );
            await actual.ready();
            return;
        }
    }
    containsExtension(extensionId) {
        return this._extensionHost.extensions?.containsExtension(extensionId) ?? false;
    }
    async activate(extension, reason) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.activate(extension, reason);
        }
        return false;
    }
    async activateByEvent(activationEvent, activationKind) {
        if (activationKind === ActivationKind.Immediate) {
            if (this._actual) {
                return this._actual.activateByEvent(activationEvent, activationKind);
            }
            return;
        }
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.activateByEvent(activationEvent, activationKind);
        }
    }
    activationEventIsDone(activationEvent) {
        if (!this._startCalled.isOpen()) {
            return false;
        }
        if (this._actual) {
            return this._actual.activationEventIsDone(activationEvent);
        }
        return true;
    }
    async getInspectPort(tryEnableInspector) {
        await this._startCalled.wait();
        return this._actual?.getInspectPort(tryEnableInspector);
    }
    async resolveAuthority(remoteAuthority, resolveAttempt) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.resolveAuthority(remoteAuthority, resolveAttempt);
        }
        return {
            type: "error",
            error: {
                message: `Cannot resolve authority`,
                code: RemoteAuthorityResolverErrorCode.Unknown,
                detail: undefined
            }
        };
    }
    async getCanonicalURI(remoteAuthority, uri) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.getCanonicalURI(remoteAuthority, uri);
        }
        throw ( new Error(`Cannot resolve canonical URI`));
    }
    async start(extensionRegistryVersionId, allExtensions, myExtensions) {
        if (myExtensions.length > 0) {
            const actual = this._createActual(`contains ${myExtensions.length} extension(s): ${( myExtensions.map(extId => extId.value))}.`);
            const result = actual.ready();
            this._startCalled.open();
            return result;
        }
        this._startCalled.open();
    }
    async extensionTestsExecute() {
        await this._startCalled.wait();
        const actual = await this._getOrCreateActualAndStart(`execute tests.`);
        return actual.extensionTestsExecute();
    }
    async setRemoteEnvironment(env) {
        await this._startCalled.wait();
        if (this._actual) {
            return this._actual.setRemoteEnvironment(env);
        }
    }
};
LazyCreateExtensionHostManager = ( __decorate([( __param(3, IInstantiationService)), ( __param(4, ILogService))], LazyCreateExtensionHostManager));

export { LazyCreateExtensionHostManager };
