
import { initialize } from '../base/common/worker/webWorkerBootstrap.js';
import { EditorWorker } from './common/services/editorWebWorker.js';
import { EditorWorkerHost } from './common/services/editorWorkerHost.js';

function start(createClient) {
    let client;
    const webWorkerServer = initialize(workerServer => {
        const editorWorkerHost = EditorWorkerHost.getChannel(workerServer);
        const host = ( new Proxy({}, {
            get(target, prop, receiver) {
                if (prop === "then") {
                    return undefined;
                }
                if (typeof prop !== "string") {
                    throw ( new Error(`Not supported`));
                }
                return (...args) => {
                    return editorWorkerHost.$fhr(prop, args);
                };
            }
        }));
        const ctx = {
            host: host,
            getMirrorModels: () => {
                return webWorkerServer.requestHandler.getModels();
            }
        };
        client = createClient(ctx);
        return ( new EditorWorker(client));
    });
    return client;
}

export { start };
