
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { ColorTheme, ColorThemeKind } from './extHostTypes.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { Emitter } from '../../../base/common/event.js';

let ExtHostTheming = class ExtHostTheming {
    constructor(_extHostRpc) {
        this._actual = ( new ColorTheme(ColorThemeKind.Dark));
        this._onDidChangeActiveColorTheme = ( new Emitter());
    }
    get activeColorTheme() {
        return this._actual;
    }
    $onColorThemeChange(type) {
        let kind;
        switch (type) {
        case "light":
            kind = ColorThemeKind.Light;
            break;
        case "hcDark":
            kind = ColorThemeKind.HighContrast;
            break;
        case "hcLight":
            kind = ColorThemeKind.HighContrastLight;
            break;
        default:
            kind = ColorThemeKind.Dark;
        }
        this._actual = ( new ColorTheme(kind));
        this._onDidChangeActiveColorTheme.fire(this._actual);
    }
    get onDidChangeActiveColorTheme() {
        return this._onDidChangeActiveColorTheme.event;
    }
};
ExtHostTheming = ( __decorate([( __param(0, IExtHostRpcService))], ExtHostTheming));

export { ExtHostTheming };
