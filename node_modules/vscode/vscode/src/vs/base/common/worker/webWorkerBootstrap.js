
import { WebWorkerServer } from './webWorker.js';

let initialized = false;
function initialize(factory) {
    if (initialized) {
        throw ( new Error("WebWorker already initialized!"));
    }
    initialized = true;
    const webWorkerServer = ( new WebWorkerServer(msg => globalThis.postMessage(msg), workerServer => factory(workerServer)));
    globalThis.onmessage = e => {
        webWorkerServer.onmessage(e.data);
    };
    return webWorkerServer;
}
function bootstrapWebWorker(factory) {
    globalThis.onmessage = _e => {
        if (!initialized) {
            initialize(factory);
        }
    };
}

export { bootstrapWebWorker, initialize };
