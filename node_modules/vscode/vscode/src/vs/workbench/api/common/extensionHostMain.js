
import { setUnexpectedErrorHandler, transformErrorForSerialization, PendingMigrationError, errorHandler } from '../../../base/common/errors.js';
import { mark } from '../../../base/common/performance.js';
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';
import { RPCProtocol } from '../../services/extensions/common/rpcProtocol.js';
import { ExtensionError } from '../../../platform/extensions/common/extensions.js';
import { ILogService, ILoggerService } from '../../../platform/log/common/log.service.js';
import { getSingletonServiceDescriptors } from '../../../platform/instantiation/common/extensions.js';
import { ServiceCollection } from '../../../platform/instantiation/common/serviceCollection.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { InstantiationService } from '../../../platform/instantiation/common/instantiationService.js';
import { IExtHostRpcService, ExtHostRpcService } from './extHostRpcService.js';
import { IURITransformerService, URITransformerService } from './extHostUriTransformerService.js';
import { IExtHostExtensionService, IHostUtils } from './extHostExtensionService.js';
import { IExtHostTelemetry } from './extHostTelemetry.js';
import { IExtHostApiDeprecationService } from './extHostApiDeprecationService.js';
import { isWebWorker } from '../../../base/common/platform.js';
import { SyncDescriptor } from '../../../platform/instantiation/common/descriptors.js';
import { ExtHostLoggerService } from './extHostLoggerService.js';
import { ExtHostLogService } from './extHostLogService.js';

class ErrorHandler {
    static async installEarlyHandler(accessor) {
        Error.stackTraceLimit = 100;
        const logService = accessor.get(ILogService);
        const rpcService = accessor.get(IExtHostRpcService);
        const mainThreadErrors = ( rpcService.getProxy(MainContext.MainThreadErrors));
        setUnexpectedErrorHandler(err => {
            logService.error(err);
            const data = transformErrorForSerialization(err);
            mainThreadErrors.$onUnexpectedError(data);
        });
    }
    static async installFullHandler(accessor) {
        const logService = accessor.get(ILogService);
        const rpcService = accessor.get(IExtHostRpcService);
        const extensionService = accessor.get(IExtHostExtensionService);
        const extensionTelemetry = accessor.get(IExtHostTelemetry);
        const apiDeprecationService = accessor.get(IExtHostApiDeprecationService);
        const mainThreadExtensions = ( rpcService.getProxy(MainContext.MainThreadExtensionService));
        const mainThreadErrors = ( rpcService.getProxy(MainContext.MainThreadErrors));
        const extensionsRegistry = await extensionService.getExtensionRegistry();
        const extensionsMap = await extensionService.getExtensionPathIndex();
        const extensionErrors = ( new WeakMap());
        function prepareStackTraceAndFindExtension(error, stackTrace) {
            if (( extensionErrors.has(error))) {
                return extensionErrors.get(error).stack;
            }
            let stackTraceMessage = "";
            let extension;
            let fileName;
            for (const call of stackTrace) {
                stackTraceMessage += `\n\tat ${( call.toString())}`;
                fileName = call.getFileName();
                if (!extension && fileName) {
                    extension = extensionsMap.findSubstr(URI.file(fileName));
                }
            }
            const result = `${error.name || "Error"}: ${error.message || ""}${stackTraceMessage}`;
            extensionErrors.set(error, {
                extensionIdentifier: extension?.identifier,
                stack: result
            });
            return result;
        }
        const _wasWrapped = Symbol("prepareStackTrace wrapped");
        let _prepareStackTrace = prepareStackTraceAndFindExtension;
        Object.defineProperty(Error, "prepareStackTrace", {
            configurable: false,
            get() {
                return _prepareStackTrace;
            },
            set(v) {
                if (v === prepareStackTraceAndFindExtension || !v || v[_wasWrapped]) {
                    _prepareStackTrace = v || prepareStackTraceAndFindExtension;
                    return;
                }
                _prepareStackTrace = function(error, stackTrace) {
                    prepareStackTraceAndFindExtension(error, stackTrace);
                    return v.call(Error, error, stackTrace);
                };
                Object.assign(_prepareStackTrace, {
                    [_wasWrapped]: true
                });
            }
        });
        setUnexpectedErrorHandler(err => {
            if (!PendingMigrationError.is(err)) {
                logService.error(err);
            }
            const errorData = transformErrorForSerialization(err);
            let extension;
            if (err instanceof ExtensionError) {
                extension = err.extension;
            } else {
                const stackData = extensionErrors.get(err);
                extension = stackData?.extensionIdentifier;
            }
            if (!extension) {
                return;
            }
            if (PendingMigrationError.is(err)) {
                const extensionDesc = extensionsRegistry.getExtensionDescription(extension);
                if (extensionDesc) {
                    apiDeprecationService.report(err.name, extensionDesc, `${err.message}\n FROM: ${err.stack}`);
                }
            } else {
                mainThreadExtensions.$onExtensionRuntimeError(extension, errorData);
                const reported = extensionTelemetry.onExtensionError(extension, err);
                logService.trace("forwarded error to extension?", reported, extension);
            }
        });
        errorHandler.addListener(err => {
            mainThreadErrors.$onUnexpectedError(err);
        });
    }
}
class ExtensionHostMain {
    constructor(protocol, initData, hostUtils, uriTransformer, messagePorts) {
        this._hostUtils = hostUtils;
        this._rpcProtocol = ( new RPCProtocol(protocol, null, uriTransformer));
        initData = ExtensionHostMain._transform(initData, this._rpcProtocol);
        const services = ( new ServiceCollection(...getSingletonServiceDescriptors()));
        services.set(IExtHostInitDataService, {
            _serviceBrand: undefined,
            ...initData,
            messagePorts
        });
        services.set(IExtHostRpcService, ( new ExtHostRpcService(this._rpcProtocol)));
        services.set(IURITransformerService, ( new URITransformerService(uriTransformer)));
        services.set(IHostUtils, hostUtils);
        services.set(ILogService, ( new SyncDescriptor(ExtHostLogService, [true], true)));
        services.set(ILoggerService, ( new SyncDescriptor(ExtHostLoggerService, [], true)));
        const instaService = ( new InstantiationService(services, true));
        if (isWebWorker) {
            instaService.invokeFunction(ErrorHandler.installEarlyHandler);
        }
        this._logService = instaService.invokeFunction(accessor => accessor.get(ILogService));
        mark(`code/extHost/didCreateServices`);
        if (this._hostUtils.pid) {
            this._logService.info(`Extension host with pid ${this._hostUtils.pid} started`);
        } else {
            this._logService.info(`Extension host started`);
        }
        this._logService.trace("initData", initData);
        this._extensionService = instaService.invokeFunction(accessor => accessor.get(IExtHostExtensionService));
        this._extensionService.initialize();
        if (isWebWorker) {
            instaService.invokeFunction(ErrorHandler.installFullHandler);
        }
    }
    async asBrowserUri(uri) {
        const mainThreadExtensionsProxy = ( this._rpcProtocol.getProxy(MainContext.MainThreadExtensionService));
        return URI.revive(await mainThreadExtensionsProxy.$asBrowserUri(uri));
    }
    async getAllStaticBrowserUris() {
        const mainThreadExtensionsProxy = ( this._rpcProtocol.getProxy(MainContext.MainThreadExtensionService));
        return ( (await mainThreadExtensionsProxy.$getAllStaticBrowserUris()).map(([from, to]) => [URI.revive(from), URI.revive(to)]));
    }
    terminate(reason) {
        this._extensionService.terminate(reason);
    }
    getExtHostExtensionService() {
        return this._extensionService;
    }
    static _transform(initData, rpcProtocol) {
        initData.extensions.allExtensions.forEach(ext => {
            ext.extensionLocation = URI.revive(rpcProtocol.transformIncomingURIs(ext.extensionLocation));
        });
        initData.environment.appRoot = URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.appRoot));
        const extDevLocs = initData.environment.extensionDevelopmentLocationURI;
        if (extDevLocs) {
            initData.environment.extensionDevelopmentLocationURI = ( extDevLocs.map(url => URI.revive(rpcProtocol.transformIncomingURIs(url))));
        }
        initData.environment.extensionTestsLocationURI = URI.revive(
            rpcProtocol.transformIncomingURIs(initData.environment.extensionTestsLocationURI)
        );
        initData.environment.globalStorageHome = URI.revive(rpcProtocol.transformIncomingURIs(initData.environment.globalStorageHome));
        initData.environment.workspaceStorageHome = URI.revive(
            rpcProtocol.transformIncomingURIs(initData.environment.workspaceStorageHome)
        );
        initData.nlsBaseUrl = URI.revive(rpcProtocol.transformIncomingURIs(initData.nlsBaseUrl));
        initData.logsLocation = URI.revive(rpcProtocol.transformIncomingURIs(initData.logsLocation));
        initData.workspace = rpcProtocol.transformIncomingURIs(initData.workspace);
        return initData;
    }
}

export { ErrorHandler, ExtensionHostMain };
