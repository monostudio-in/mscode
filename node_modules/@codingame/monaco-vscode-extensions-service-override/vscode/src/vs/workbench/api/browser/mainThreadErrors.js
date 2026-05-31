
import { __decorate } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { transformErrorFromSerialization, onUnexpectedError } from '@codingame/monaco-vscode-api/vscode/vs/base/common/errors';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

let MainThreadErrors = class MainThreadErrors {
    dispose() {
    }
    $onUnexpectedError(err) {
        if (err?.$isError) {
            err = transformErrorFromSerialization(err);
        }
        onUnexpectedError(err);
    }
};
MainThreadErrors = __decorate([
    extHostNamedCustomer(MainContext.MainThreadErrors)
], MainThreadErrors);

export { MainThreadErrors };
