import { Disposable } from "../../../../base/common/lifecycle.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.service.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { ISemanticTokensStylingService } from "../../../common/services/semanticTokensStyling.service.js";
export declare class ViewportSemanticTokensContribution extends Disposable implements IEditorContribution {
    private readonly _semanticTokensStylingService;
    private readonly _themeService;
    private readonly _configurationService;
    static readonly ID = "editor.contrib.viewportSemanticTokens";
    static get(editor: ICodeEditor): ViewportSemanticTokensContribution | null;
    private readonly _editor;
    private readonly _provider;
    private readonly _debounceInformation;
    private readonly _tokenizeViewport;
    private _outstandingRequests;
    private _rangeProvidersChangeListeners;
    constructor(editor: ICodeEditor, _semanticTokensStylingService: ISemanticTokensStylingService, _themeService: IThemeService, _configurationService: IConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    private _cleanupProviderListeners;
    private _cancelAll;
    private _removeOutstandingRequest;
    private _tokenizeViewportNow;
    private _requestRange;
}
