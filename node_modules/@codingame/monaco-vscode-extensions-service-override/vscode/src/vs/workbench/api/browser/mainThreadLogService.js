
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { isLogLevel, log, parseLogLevel, LogLevelToString } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log';
import { ILoggerService, ILogService } from '@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service';
import { DisposableStore } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { CommandsRegistry } from '@codingame/monaco-vscode-api/vscode/vs/platform/commands/common/commands';
import { IEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service';

let MainThreadLoggerService = class MainThreadLoggerService {
    constructor(extHostContext, loggerService) {
        this.loggerService = loggerService;
        this.disposables = ( new DisposableStore());
        const proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostLogLevelServiceShape));
        this.disposables.add(loggerService.onDidChangeLogLevel(arg => {
            if (isLogLevel(arg)) {
                proxy.$setLogLevel(arg);
            } else {
                proxy.$setLogLevel(arg[1], arg[0]);
            }
        }));
    }
    $log(file, messages) {
        const logger = this.loggerService.getLogger(URI.revive(file));
        if (!logger) {
            throw ( new Error("Create the logger before logging"));
        }
        for (const [level, message] of messages) {
            log(logger, level, message);
        }
    }
    async $createLogger(file, options) {
        this.loggerService.createLogger(URI.revive(file), options);
    }
    async $registerLogger(logResource) {
        this.loggerService.registerLogger({
            ...logResource,
            resource: URI.revive(logResource.resource)
        });
    }
    async $deregisterLogger(resource) {
        this.loggerService.deregisterLogger(URI.revive(resource));
    }
    async $setVisibility(resource, visible) {
        this.loggerService.setVisibility(URI.revive(resource), visible);
    }
    $flush(file) {
        const logger = this.loggerService.getLogger(URI.revive(file));
        if (!logger) {
            throw ( new Error("Create the logger before flushing"));
        }
        logger.flush();
    }
    dispose() {
        this.disposables.dispose();
    }
};
MainThreadLoggerService = __decorate([extHostNamedCustomer(MainContext.MainThreadLogger), ( __param(1, ILoggerService))], MainThreadLoggerService);
CommandsRegistry.registerCommand("_extensionTests.setLogLevel", function(accessor, level) {
    const loggerService = accessor.get(ILoggerService);
    const environmentService = accessor.get(IEnvironmentService);
    if (environmentService.isExtensionDevelopment && !!environmentService.extensionTestsLocationURI) {
        const logLevel = parseLogLevel(level);
        if (logLevel !== undefined) {
            loggerService.setLogLevel(logLevel);
        }
    }
});
CommandsRegistry.registerCommand("_extensionTests.getLogLevel", function(accessor) {
    const logService = accessor.get(ILogService);
    return LogLevelToString(logService.getLevel());
});

export { MainThreadLoggerService };
