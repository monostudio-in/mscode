
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';

const ILocaleService = ( createDecorator("localizationService"));
const IActiveLanguagePackService = ( createDecorator("activeLanguageService"));

export { IActiveLanguagePackService, ILocaleService };
