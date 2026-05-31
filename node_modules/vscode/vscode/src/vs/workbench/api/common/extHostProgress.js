
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { MainContext } from './extHost.protocol.js';
import { ProgressLocation } from './extHostTypeConverters.js';
import { Progress } from '../../../platform/progress/common/progress.js';
import { CancellationTokenSource, CancellationToken } from '../../../base/common/cancellation.js';
import { throttle } from '../../../base/common/decorators.js';
import { onUnexpectedExternalError } from '../../../base/common/errors.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';

const IExtHostProgress = ( createDecorator("IExtHostProgress"));
let ExtHostProgress = class ExtHostProgress {
    constructor(extHostRpc) {
        this._handles = 0;
        this._mapHandleToCancellationSource = ( new Map());
        this._proxy = ( extHostRpc.getProxy(MainContext.MainThreadProgress));
    }
    async withProgress(extension, options, task) {
        const handle = this._handles++;
        const {
            title,
            location,
            cancellable
        } = options;
        const source = {
            label: extension.displayName || extension.name,
            id: extension.identifier.value
        };
        this._proxy.$startProgress(handle, {
            location: ProgressLocation.from(location),
            title,
            source,
            cancellable
        }, !extension.isUnderDevelopment ? extension.identifier.value : undefined).catch(onUnexpectedExternalError);
        return this._withProgress(handle, task, !!cancellable);
    }
    async withProgressFromSource(source, options, task) {
        const handle = this._handles++;
        const {
            title,
            location,
            cancellable
        } = options;
        this._proxy.$startProgress(handle, {
            location: ProgressLocation.from(location),
            title,
            source,
            cancellable
        }, undefined).catch(onUnexpectedExternalError);
        return this._withProgress(handle, task, !!cancellable);
    }
    _withProgress(handle, task, cancellable) {
        let source;
        if (cancellable) {
            source = ( new CancellationTokenSource());
            this._mapHandleToCancellationSource.set(handle, source);
        }
        const progressEnd = handle => {
            this._proxy.$progressEnd(handle);
            this._mapHandleToCancellationSource.delete(handle);
            source?.dispose();
        };
        let p;
        try {
            p = task(( new ProgressCallback(this._proxy, handle)), cancellable && source ? source.token : CancellationToken.None);
        } catch (err) {
            progressEnd(handle);
            throw err;
        }
        p.then(result => progressEnd(handle), err => progressEnd(handle));
        return p;
    }
    $acceptProgressCanceled(handle) {
        const source = this._mapHandleToCancellationSource.get(handle);
        if (source) {
            source.cancel();
            this._mapHandleToCancellationSource.delete(handle);
        }
    }
};
ExtHostProgress = ( __decorate([( __param(0, IExtHostRpcService))], ExtHostProgress));
function mergeProgress(result, currentValue) {
    result.message = currentValue.message;
    if (typeof currentValue.increment === "number") {
        if (typeof result.increment === "number") {
            result.increment += currentValue.increment;
        } else {
            result.increment = currentValue.increment;
        }
    }
    return result;
}
class ProgressCallback extends Progress {
    constructor(_proxy, _handle) {
        super(p => this.throttledReport(p));
        this._proxy = _proxy;
        this._handle = _handle;
    }
    throttledReport(p) {
        this._proxy.$progressReport(this._handle, p);
    }
}
ProgressCallback.__decorator = ( __decorate([throttle(
    100,
    (result, currentValue) => mergeProgress(result, currentValue),
    () => Object.create(null)
)], ProgressCallback.prototype, "throttledReport", null));

export { ExtHostProgress, IExtHostProgress };
