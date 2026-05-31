
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ILanguageService } from '../languages/language.service.js';
import { IThemeService } from '../../../platform/theme/common/themeService.service.js';
import { ILogService } from '../../../platform/log/common/log.service.js';
import { SemanticTokensProviderStyling } from './semanticTokensProviderStyling.js';
import '../../../platform/instantiation/common/instantiation.js';
import '../../../platform/instantiation/common/extensions.js';

let SemanticTokensStylingService = class SemanticTokensStylingService extends Disposable {
    constructor(_themeService, _logService, _languageService) {
        super();
        this._themeService = _themeService;
        this._logService = _logService;
        this._languageService = _languageService;
        this._caches = ( new WeakMap());
        this._register(this._themeService.onDidColorThemeChange(() => {
            this._caches = ( new WeakMap());
        }));
    }
    getStyling(provider) {
        if (!( this._caches.has(provider))) {
            this._caches.set(provider, ( new SemanticTokensProviderStyling(
                provider.getLegend(),
                this._themeService,
                this._languageService,
                this._logService
            )));
        }
        return this._caches.get(provider);
    }
};
SemanticTokensStylingService = ( __decorate([( __param(0, IThemeService)), ( __param(1, ILogService)), ( __param(2, ILanguageService))], SemanticTokensStylingService));

export { SemanticTokensStylingService };
