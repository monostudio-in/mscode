
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import '../../../../base/common/observableInternal/index.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IDataChannelService } from '../../../../platform/dataChannel/common/dataChannel.service.js';
import { observableFromEvent } from '../../../../base/common/observableInternal/observables/observableFromEvent.js';

function formatRecordableLogEntry(entry) {
    return entry.sourceId + " @@ " + JSON.stringify({
        ...entry,
        modelUri: entry.modelUri?.toString(),
        sourceId: undefined
    });
}
let StructuredLogger = class StructuredLogger extends Disposable {
    static cast() {
        return this;
    }
    constructor(_key, _contextKeyService, _dataChannelService) {
        super();
        this._key = _key;
        this._contextKeyService = _contextKeyService;
        this._dataChannelService = _dataChannelService;
        this._isEnabledContextKeyValue = observableContextKey("structuredLogger.enabled:" + this._key, this._contextKeyService).recomputeInitiallyAndOnChange(this._store);
        this.isEnabled = ( this._isEnabledContextKeyValue.map(v => v !== undefined));
    }
    log(data) {
        const enabled = this._isEnabledContextKeyValue.get();
        if (!enabled) {
            return false;
        }
        this._dataChannelService.getDataChannel("structuredLogger:" + this._key).sendData(data);
        return true;
    }
};
StructuredLogger = ( __decorate([( __param(1, IContextKeyService)), ( __param(2, IDataChannelService))], StructuredLogger));
function observableContextKey(key, contextKeyService) {
    return observableFromEvent(
        contextKeyService.onDidChangeContext,
        () => contextKeyService.getContextKeyValue(key)
    );
}

export { StructuredLogger, formatRecordableLogEntry };
