
import { createDecorator } from '../../instantiation/common/instantiation.js';

const IWebContentExtractorService = ( createDecorator("IWebContentExtractorService"));
const ISharedWebContentExtractorService = ( createDecorator("ISharedWebContentExtractorService"));

export { ISharedWebContentExtractorService, IWebContentExtractorService };
