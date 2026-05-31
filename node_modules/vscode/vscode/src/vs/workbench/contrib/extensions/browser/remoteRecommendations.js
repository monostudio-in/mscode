
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { ExtensionRecommendations } from './extensionRecommendations.js';
import { IProductService } from '../../../../platform/product/common/productService.service.js';
import { ExtensionRecommendationReason } from '../../../services/extensionRecommendations/common/extensionRecommendations.js';
import { PlatformToString, platform } from '../../../../base/common/platform.js';

let RemoteRecommendations = class RemoteRecommendations extends ExtensionRecommendations {
    get recommendations() {
        return this._recommendations;
    }
    constructor(productService) {
        super();
        this.productService = productService;
        this._recommendations = [];
    }
    async doActivate() {
        const extensionTips = {
            ...this.productService.remoteExtensionTips,
            ...this.productService.virtualWorkspaceExtensionTips
        };
        const currentPlatform = PlatformToString(platform);
        this._recommendations = ( ( Object.values(extensionTips)).filter((
            {
                supportedPlatforms
            }
        ) => !supportedPlatforms || supportedPlatforms.includes(currentPlatform)).map(extension => ({
            extension: extension.extensionId.toLowerCase(),
            reason: {
                reasonId: ExtensionRecommendationReason.Application,
                reasonText: ""
            }
        })));
    }
};
RemoteRecommendations = ( __decorate([( __param(0, IProductService))], RemoteRecommendations));

export { RemoteRecommendations };
