
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.service.js';
import { IDataChannelService } from '../common/dataChannel.service.js';

class InterceptingTelemetryService {
    constructor(_baseService, _intercept) {
        this._baseService = _baseService;
        this._intercept = _intercept;
    }
    get telemetryLevel() {
        return this._baseService.telemetryLevel;
    }
    get sessionId() {
        return this._baseService.sessionId;
    }
    get machineId() {
        return this._baseService.machineId;
    }
    get sqmId() {
        return this._baseService.sqmId;
    }
    get devDeviceId() {
        return this._baseService.devDeviceId;
    }
    get firstSessionDate() {
        return this._baseService.firstSessionDate;
    }
    get msftInternal() {
        return this._baseService.msftInternal;
    }
    get sendErrorTelemetry() {
        return this._baseService.sendErrorTelemetry;
    }
    publicLog(eventName, data) {
        this._intercept(eventName, data);
        this._baseService.publicLog(eventName, data);
    }
    publicLog2(eventName, data) {
        this._intercept(eventName, data);
        this._baseService.publicLog2(eventName, data);
    }
    publicLogError(errorEventName, data) {
        this._intercept(errorEventName, data);
        this._baseService.publicLogError(errorEventName, data);
    }
    publicLogError2(eventName, data) {
        this._intercept(eventName, data);
        this._baseService.publicLogError2(eventName, data);
    }
    setExperimentProperty(name, value) {
        this._baseService.setExperimentProperty(name, value);
    }
    setCommonProperty(name, value) {
        this._baseService.setCommonProperty(name, value);
    }
}
let DataChannelForwardingTelemetryService = class DataChannelForwardingTelemetryService extends InterceptingTelemetryService {
    constructor(telemetryService, dataChannelService) {
        super(telemetryService, (eventName, data) => {
            let forward = true;
            if (data && shouldForwardToChannel in data) {
                forward = Boolean(data[shouldForwardToChannel]);
            }
            if (forward) {
                dataChannelService.getDataChannel("editTelemetry").sendData({
                    eventName,
                    data: data ?? {}
                });
            }
        });
    }
};
DataChannelForwardingTelemetryService = ( __decorate([( __param(0, ITelemetryService)), ( __param(1, IDataChannelService))], DataChannelForwardingTelemetryService));
const shouldForwardToChannel = Symbol("shouldForwardToChannel");
function forwardToChannelIf(value) {
    return {
        [shouldForwardToChannel]: value
    };
}
function isCopilotLikeExtension(extensionId) {
    if (!extensionId) {
        return false;
    }
    const extIdLowerCase = extensionId.toLowerCase();
    return extIdLowerCase === "github.copilot" || extIdLowerCase === "github.copilot-chat";
}

export { DataChannelForwardingTelemetryService, InterceptingTelemetryService, forwardToChannelIf, isCopilotLikeExtension };
