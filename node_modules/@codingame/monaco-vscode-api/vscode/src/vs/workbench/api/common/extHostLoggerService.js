
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { AbstractLoggerService, AbstractMessageLogger } from '../../../platform/log/common/log.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { URI } from '../../../base/common/uri.js';
import { revive } from '../../../base/common/marshalling.js';

let ExtHostLoggerService = class ExtHostLoggerService extends AbstractLoggerService {
    constructor(rpc, initData) {
        super(initData.logLevel, initData.logsLocation, ( initData.loggers.map(logger => revive(logger))));
        this._proxy = ( rpc.getProxy(MainContext.MainThreadLogger));
    }
    $setLogLevel(logLevel, resource) {
        if (resource) {
            this.setLogLevel(URI.revive(resource), logLevel);
        } else {
            this.setLogLevel(logLevel);
        }
    }
    setVisibility(resource, visibility) {
        super.setVisibility(resource, visibility);
        this._proxy.$setVisibility(resource, visibility);
    }
    doCreateLogger(resource, logLevel, options) {
        return ( new Logger(this._proxy, resource, logLevel, options));
    }
};
ExtHostLoggerService = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, IExtHostInitDataService))], ExtHostLoggerService));
class Logger extends AbstractMessageLogger {
    constructor(proxy, file, logLevel, loggerOptions) {
        super(loggerOptions?.logLevel === "always");
        this.proxy = proxy;
        this.file = file;
        this.isLoggerCreated = false;
        this.buffer = [];
        this.setLevel(logLevel);
        this.proxy.$createLogger(file, loggerOptions).then(() => {
            this.doLog(this.buffer);
            this.isLoggerCreated = true;
        });
    }
    log(level, message) {
        const messages = [[level, message]];
        if (this.isLoggerCreated) {
            this.doLog(messages);
        } else {
            this.buffer.push(...messages);
        }
    }
    doLog(messages) {
        this.proxy.$log(this.file, messages);
    }
    flush() {
        this.proxy.$flush(this.file);
    }
}

export { ExtHostLoggerService };
