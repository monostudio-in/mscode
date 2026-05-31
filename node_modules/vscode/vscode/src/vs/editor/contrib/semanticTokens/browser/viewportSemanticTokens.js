
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { RunOnceScheduler, createCancelablePromise } from '../../../../base/common/async.js';
import { Disposable, dispose } from '../../../../base/common/lifecycle.js';
import { registerEditorContribution, EditorContributionInstantiation } from '../../../browser/editorExtensions.js';
import { hasDocumentRangeSemanticTokensProvider, getDocumentRangeSemanticTokens } from '../common/getSemanticTokens.js';
import { SEMANTIC_HIGHLIGHTING_SETTING_ID, isSemanticColoringEnabled } from '../common/semanticTokensConfig.js';
import { toMultilineTokens2 } from '../../../common/services/semanticTokensProviderStyling.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.service.js';
import { ILanguageFeatureDebounceService } from '../../../common/services/languageFeatureDebounce.service.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.service.js';
import { ISemanticTokensStylingService } from '../../../common/services/semanticTokensStyling.service.js';

var ViewportSemanticTokensContribution_1;
let ViewportSemanticTokensContribution = class ViewportSemanticTokensContribution extends Disposable {
    static {
        ViewportSemanticTokensContribution_1 = this;
    }
    static {
        this.ID = "editor.contrib.viewportSemanticTokens";
    }
    static get(editor) {
        return editor.getContribution(ViewportSemanticTokensContribution_1.ID);
    }
    constructor(
        editor,
        _semanticTokensStylingService,
        _themeService,
        _configurationService,
        languageFeatureDebounceService,
        languageFeaturesService
    ) {
        super();
        this._semanticTokensStylingService = _semanticTokensStylingService;
        this._themeService = _themeService;
        this._configurationService = _configurationService;
        this._editor = editor;
        this._provider = languageFeaturesService.documentRangeSemanticTokensProvider;
        this._debounceInformation = languageFeatureDebounceService.for(this._provider, "DocumentRangeSemanticTokens", {
            min: 100,
            max: 500
        });
        this._tokenizeViewport = this._register(( new RunOnceScheduler(() => this._tokenizeViewportNow(), 100)));
        this._outstandingRequests = [];
        this._rangeProvidersChangeListeners = [];
        const scheduleTokenizeViewport = () => {
            if (this._editor.hasModel()) {
                this._tokenizeViewport.schedule(this._debounceInformation.get(this._editor.getModel()));
            }
        };
        const bindRangeProvidersChangeListeners = () => {
            this._cleanupProviderListeners();
            if (this._editor.hasModel()) {
                const model = this._editor.getModel();
                for (const provider of this._provider.all(model)) {
                    const disposable = provider.onDidChange?.(() => {
                        this._cancelAll();
                        scheduleTokenizeViewport();
                    });
                    if (disposable) {
                        this._rangeProvidersChangeListeners.push(disposable);
                    }
                }
            }
        };
        this._register(this._editor.onDidScrollChange(() => {
            scheduleTokenizeViewport();
        }));
        this._register(this._editor.onDidChangeModel(() => {
            bindRangeProvidersChangeListeners();
            this._cancelAll();
            scheduleTokenizeViewport();
        }));
        this._register(this._editor.onDidChangeModelLanguage(() => {
            bindRangeProvidersChangeListeners();
            this._cancelAll();
            scheduleTokenizeViewport();
        }));
        this._register(this._editor.onDidChangeModelContent(e => {
            this._cancelAll();
            scheduleTokenizeViewport();
        }));
        bindRangeProvidersChangeListeners();
        this._register(this._provider.onDidChange(() => {
            bindRangeProvidersChangeListeners();
            this._cancelAll();
            scheduleTokenizeViewport();
        }));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(SEMANTIC_HIGHLIGHTING_SETTING_ID)) {
                this._cancelAll();
                scheduleTokenizeViewport();
            }
        }));
        this._register(this._themeService.onDidColorThemeChange(() => {
            this._cancelAll();
            scheduleTokenizeViewport();
        }));
        scheduleTokenizeViewport();
    }
    dispose() {
        this._cleanupProviderListeners();
        super.dispose();
    }
    _cleanupProviderListeners() {
        dispose(this._rangeProvidersChangeListeners);
        this._rangeProvidersChangeListeners = [];
    }
    _cancelAll() {
        for (const request of this._outstandingRequests) {
            request.cancel();
        }
        this._outstandingRequests = [];
    }
    _removeOutstandingRequest(req) {
        for (let i = 0, len = this._outstandingRequests.length; i < len; i++) {
            if (this._outstandingRequests[i] === req) {
                this._outstandingRequests.splice(i, 1);
                return;
            }
        }
    }
    _tokenizeViewportNow() {
        if (!this._editor.hasModel()) {
            return;
        }
        const model = this._editor.getModel();
        if (model.tokenization.hasCompleteSemanticTokens()) {
            return;
        }
        if (!isSemanticColoringEnabled(model, this._themeService, this._configurationService)) {
            if (model.tokenization.hasSomeSemanticTokens()) {
                model.tokenization.setSemanticTokens(null, false);
            }
            return;
        }
        if (!hasDocumentRangeSemanticTokensProvider(this._provider, model)) {
            if (model.tokenization.hasSomeSemanticTokens()) {
                model.tokenization.setSemanticTokens(null, false);
            }
            return;
        }
        const visibleRanges = this._editor.getVisibleRangesPlusViewportAboveBelow();
        this._outstandingRequests = this._outstandingRequests.concat(( visibleRanges.map(range => this._requestRange(model, range))));
    }
    _requestRange(model, range) {
        const requestVersionId = model.getVersionId();
        const request = createCancelablePromise(
            token => Promise.resolve(getDocumentRangeSemanticTokens(this._provider, model, range, token))
        );
        const sw = ( new StopWatch(false));
        request.then(r => {
            this._debounceInformation.update(model, sw.elapsed());
            if (!r || !r.tokens || model.isDisposed() || model.getVersionId() !== requestVersionId) {
                return;
            }
            const {
                provider,
                tokens: result
            } = r;
            const styling = this._semanticTokensStylingService.getStyling(provider);
            model.tokenization.setPartialSemanticTokens(range, toMultilineTokens2(result, styling, model.getLanguageId()));
        }).then(
            () => this._removeOutstandingRequest(request),
            () => this._removeOutstandingRequest(request)
        );
        return request;
    }
};
ViewportSemanticTokensContribution = ViewportSemanticTokensContribution_1 = ( __decorate([( __param(1, ISemanticTokensStylingService)), ( __param(2, IThemeService)), ( __param(3, IConfigurationService)), ( __param(4, ILanguageFeatureDebounceService)), ( __param(5, ILanguageFeaturesService))], ViewportSemanticTokensContribution));
registerEditorContribution(
    ViewportSemanticTokensContribution.ID,
    ViewportSemanticTokensContribution,
    EditorContributionInstantiation.AfterFirstRender
);

export { ViewportSemanticTokensContribution };
