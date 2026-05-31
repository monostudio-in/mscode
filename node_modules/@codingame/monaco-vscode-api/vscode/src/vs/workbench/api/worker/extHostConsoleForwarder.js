
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { AbstractExtHostConsoleForwarder } from '../common/extHostConsoleForwarder.js';
import { IExtHostInitDataService } from '../common/extHostInitDataService.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';

let ExtHostConsoleForwarder = class ExtHostConsoleForwarder extends AbstractExtHostConsoleForwarder {
    constructor(extHostRpc, initData) {
        super(extHostRpc, initData);
    }
    _nativeConsoleLogMessage(_method, original, args) {
        original.apply(console, args);
    }
};
ExtHostConsoleForwarder = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, IExtHostInitDataService))], ExtHostConsoleForwarder));

export { ExtHostConsoleForwarder };
