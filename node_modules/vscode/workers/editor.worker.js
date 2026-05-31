
import '../vscode/src/vs/editor/common/services/editorWebWorkerMain.js';
import { start } from '../vscode/src/vs/editor/editor.worker.start.js';

let initialized = false;
function isWorkerInitialized() {
    return initialized;
}
function initialize(createFn) {
    initialized = true;
    self.onmessage = (m) => {
        start((ctx) => {
            return createFn(ctx, m.data);
        });
    };
}
self.onmessage = () => {
    if (!isWorkerInitialized()) {
        start(() => {
            return {};
        });
    }
};

export { initialize };
