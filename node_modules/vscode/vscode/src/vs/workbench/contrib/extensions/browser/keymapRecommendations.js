
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { IProductService } from '../../../../platform/product/common/productService.service.js';
import { ExtensionRecommendationReason } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';

let KeymapRecommendations = class KeymapRecommendations extends ExtensionRecommendations {
    get recommendations() {
        return this._recommendations;
    }
    constructor(productService) {
        super();
        this.productService = productService;
        this._recommendations = [];
    }
    async doActivate() {
        if (this.productService.keymapExtensionTips) {
            this._recommendations = ( this.productService.keymapExtensionTips.map(extensionId => ({
                extension: extensionId.toLowerCase(),
                reason: {
                    reasonId: ExtensionRecommendationReason.Application,
                    reasonText: ""
                }
            })));
        }
    }
};
KeymapRecommendations = ( __decorate([( __param(0, IProductService))], KeymapRecommendations));

export { KeymapRecommendations };
