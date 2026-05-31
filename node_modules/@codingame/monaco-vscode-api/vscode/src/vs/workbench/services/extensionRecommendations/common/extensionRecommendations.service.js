
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const IExtensionRecommendationsService = ( createDecorator("extensionRecommendationsService"));
const IExtensionIgnoredRecommendationsService = ( createDecorator("IExtensionIgnoredRecommendationsService"));

export { IExtensionIgnoredRecommendationsService, IExtensionRecommendationsService };
