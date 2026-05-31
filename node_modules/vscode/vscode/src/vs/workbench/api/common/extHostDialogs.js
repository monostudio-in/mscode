
import { URI } from '../../../base/common/uri.js';
import { MainContext } from './extHost.protocol.js';

class ExtHostDialogs {
    constructor(mainContext) {
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadDialogs));
    }
    showOpenDialog(options) {
        return this._proxy.$showOpenDialog(options).then(filepaths => {
            return filepaths ? ( filepaths.map(p => URI.revive(p))) : undefined;
        });
    }
    showSaveDialog(options) {
        return this._proxy.$showSaveDialog(options).then(filepath => {
            return filepath ? URI.revive(filepath) : undefined;
        });
    }
}

export { ExtHostDialogs };
