
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostRpcService } from './extHostRpcService.js';

const IExtHostApiDeprecationService = ( createDecorator("IExtHostApiDeprecationService"));
let ExtHostApiDeprecationService = class ExtHostApiDeprecationService {
    constructor(rpc, _extHostLogService) {
        this._extHostLogService = _extHostLogService;
        this._reportedUsages = ( new Set());
        this._telemetryShape = ( rpc.getProxy(MainContext.MainThreadTelemetry));
    }
    report(apiId, extension, migrationSuggestion, options) {
        const key = this.getUsageKey(apiId, extension, options?.usageId);
        if (( this._reportedUsages.has(key))) {
            return;
        }
        this._reportedUsages.add(key);
        if (extension.isUnderDevelopment) {
            this._extHostLogService.warn(`[Deprecation Warning] '${apiId}' is deprecated. ${migrationSuggestion}`);
        }
        this._telemetryShape.$publicLog2("extHostDeprecatedApiUsage", {
            extensionId: extension.identifier.value,
            apiId: apiId,
            usageId: options?.usageId ?? ""
        });
    }
    getUsageKey(apiId, extension, usageId) {
        const rootKey = `${apiId}-${extension.identifier.value}`;
        return usageId ? `${rootKey}-${usageId}` : rootKey;
    }
};
ExtHostApiDeprecationService = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, ILogService))], ExtHostApiDeprecationService));

export { ExtHostApiDeprecationService, IExtHostApiDeprecationService };
