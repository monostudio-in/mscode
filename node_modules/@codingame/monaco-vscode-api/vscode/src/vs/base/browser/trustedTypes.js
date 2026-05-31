
import { onUnexpectedError } from '../common/errors.js';
import { getMonacoEnvironment } from './browser.js';

function createTrustedTypesPolicy(policyName, policyOptions) {
    const monacoEnvironment = getMonacoEnvironment();
    if (monacoEnvironment?.createTrustedTypesPolicy) {
        try {
            return monacoEnvironment.createTrustedTypesPolicy(policyName, policyOptions);
        }
        catch (err) {
            onUnexpectedError(err);
            return undefined;
        }
    }
    try {
        return globalThis.trustedTypes?.createPolicy(policyName, policyOptions);
    }
    catch (err) {
        onUnexpectedError(err);
        return undefined;
    }
}

export { createTrustedTypesPolicy };
