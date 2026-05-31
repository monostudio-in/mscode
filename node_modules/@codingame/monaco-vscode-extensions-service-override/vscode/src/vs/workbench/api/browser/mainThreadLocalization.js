
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { URI } from '@codingame/monaco-vscode-api/vscode/vs/base/common/uri';
import { IFileService } from '@codingame/monaco-vscode-api/vscode/vs/platform/files/common/files.service';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { ILanguagePackService } from '@codingame/monaco-vscode-api/vscode/vs/platform/languagePacks/common/languagePacks.service';

let MainThreadLocalization = class MainThreadLocalization extends Disposable {
    constructor(extHostContext, fileService, languagePackService) {
        super();
        this.fileService = fileService;
        this.languagePackService = languagePackService;
    }
    async $fetchBuiltInBundleUri(id, language) {
        try {
            const uri = await this.languagePackService.getBuiltInExtensionTranslationsUri(id, language);
            return uri;
        } catch (e) {
            return undefined;
        }
    }
    async $fetchBundleContents(uriComponents) {
        const contents = await this.fileService.readFile(URI.revive(uriComponents));
        return ( contents.value.toString());
    }
};
MainThreadLocalization = __decorate([extHostNamedCustomer(MainContext.MainThreadLocalization), ( __param(1, IFileService)), ( __param(2, ILanguagePackService))], MainThreadLocalization);

export { MainThreadLocalization };
