
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IThemeService } from '@codingame/monaco-vscode-api/vscode/vs/platform/theme/common/themeService.service';

let MainThreadTheming = class MainThreadTheming {
    constructor(extHostContext, themeService) {
        this._themeService = themeService;
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostTheming));
        this._themeChangeListener = this._themeService.onDidColorThemeChange(e => {
            this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
        });
        this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
    }
    dispose() {
        this._themeChangeListener.dispose();
    }
};
MainThreadTheming = __decorate([extHostNamedCustomer(MainContext.MainThreadTheming), ( __param(1, IThemeService))], MainThreadTheming);

export { MainThreadTheming };
