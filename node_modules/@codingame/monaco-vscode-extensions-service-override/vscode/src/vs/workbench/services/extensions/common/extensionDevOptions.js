
import { Schemas } from '@codingame/monaco-vscode-api/vscode/vs/base/common/network';

function parseExtensionDevOptions(environmentService) {
    const isExtensionDevHost = environmentService.isExtensionDevelopment;
    let debugOk = true;
    const extDevLocs = environmentService.extensionDevelopmentLocationURI;
    if (extDevLocs) {
        for (const x of extDevLocs) {
            if (x.scheme !== Schemas.file) {
                debugOk = false;
            }
        }
    }
    const isExtensionDevDebug = debugOk && typeof environmentService.debugExtensionHost.port === 'number';
    const isExtensionDevDebugBrk = debugOk && !!environmentService.debugExtensionHost.break;
    const isExtensionDevTestFromCli = isExtensionDevHost && !!environmentService.extensionTestsLocationURI && !environmentService.debugExtensionHost.debugId;
    return {
        isExtensionDevHost,
        isExtensionDevDebug,
        isExtensionDevDebugBrk,
        isExtensionDevTestFromCli
    };
}

export { parseExtensionDevOptions };
