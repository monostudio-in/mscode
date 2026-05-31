
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { IProductService } from '../../../../platform/product/common/productService.service.js';
import { ExtensionRecommendationReason } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';

let LanguageRecommendations = class LanguageRecommendations extends ExtensionRecommendations {
    get recommendations() {
        return this._recommendations;
    }
    constructor(productService) {
        super();
        this.productService = productService;
        this._recommendations = [];
    }
    async doActivate() {
        if (this.productService.languageExtensionTips) {
            this._recommendations = ( this.productService.languageExtensionTips.map(extensionId => ({
                extension: extensionId.toLowerCase(),
                reason: {
                    reasonId: ExtensionRecommendationReason.Application,
                    reasonText: ""
                }
            })));
        }
    }
};
LanguageRecommendations = ( __decorate([( __param(0, IProductService))], LanguageRecommendations));

export { LanguageRecommendations };
