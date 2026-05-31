
import { FileAccess } from './vscode/src/vs/base/common/network.js';

function registerAssets(assets) {
    for (const [moduleId, url] of Object.entries(assets)) {
        FileAccess.registerAppResourcePathUrl(moduleId, url);
    }
}

export { registerAssets };
