
import { MainContext } from './extHost.protocol.js';

class ExtHostClipboard {
    constructor(mainContext) {
        const proxy = ( mainContext.getProxy(MainContext.MainThreadClipboard));
        this.value = ( Object.freeze({
            readText() {
                return proxy.$readText();
            },
            writeText(value) {
                return proxy.$writeText(value);
            }
        }));
    }
}

export { ExtHostClipboard };
