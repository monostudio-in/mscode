import { Disposable } from "../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IThemeService } from "../../../../platform/theme/common/themeService.service.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.service.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.service.js";
import { IModelService } from "../../../common/services/model.service.js";
import { ISemanticTokensStylingService } from "../../../common/services/semanticTokensStyling.service.js";
export declare class DocumentSemanticTokensFeature extends Disposable {
    private readonly _watchers;
    private readonly _providerChangeListeners;
    constructor(semanticTokensStylingService: ISemanticTokensStylingService, modelService: IModelService, themeService: IThemeService, configurationService: IConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
}
