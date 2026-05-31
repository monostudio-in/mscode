
import { Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';

var BrowserViewUri;
(function(BrowserViewUri) {
    BrowserViewUri.scheme = Schemas.vscodeBrowser;
    function forId(id) {
        return ( URI.from({
            scheme: BrowserViewUri.scheme,
            path: `/${id}`
        }));
    }
    BrowserViewUri.forId = forId;
    function parse(resource) {
        if (resource.scheme !== BrowserViewUri.scheme) {
            return undefined;
        }
        const id = resource.path.startsWith("/") ? resource.path.substring(1) : resource.path;
        if (!id) {
            return undefined;
        }
        return {
            id
        };
    }
    BrowserViewUri.parse = parse;
    function getId(resource) {
        return parse(resource)?.id;
    }
    BrowserViewUri.getId = getId;
})(BrowserViewUri || (BrowserViewUri = {}));

export { BrowserViewUri };
