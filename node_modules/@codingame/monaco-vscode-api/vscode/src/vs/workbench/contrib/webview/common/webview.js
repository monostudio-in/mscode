
import { CharCode } from '../../../../base/common/charCode.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';

const webviewResourceBaseHost = "vscode-cdn.net";
const webviewRootResourceAuthority = `vscode-resource.${webviewResourceBaseHost}`;
const webviewGenericCspSource = `'self' https://*.${webviewResourceBaseHost}`;
function asWebviewUri(resource, remoteInfo) {
    if (resource.scheme === Schemas.http || resource.scheme === Schemas.https) {
        return resource;
    }
    if (remoteInfo && remoteInfo.authority && remoteInfo.isRemote && resource.scheme === Schemas.file) {
        resource = ( URI.from({
            scheme: Schemas.vscodeRemote,
            authority: remoteInfo.authority,
            path: resource.path
        }));
    }
    return ( URI.from({
        scheme: Schemas.https,
        authority: `${resource.scheme}+${encodeAuthority(resource.authority)}.${webviewRootResourceAuthority}`,
        path: resource.path,
        fragment: resource.fragment,
        query: resource.query
    }));
}
function encodeAuthority(authority) {
    return authority.replace(/./g, char => {
        const code = char.charCodeAt(0);
        if ((code >= CharCode.a && code <= CharCode.z) || (code >= CharCode.A && code <= CharCode.Z) || (code >= CharCode.Digit0 && code <= CharCode.Digit9)) {
            return char;
        }
        return "-" + ( code.toString(16)).padStart(4, "0");
    });
}
function decodeAuthority(authority) {
    return authority.replace(/-([0-9a-f]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

export { asWebviewUri, decodeAuthority, webviewGenericCspSource, webviewResourceBaseHost, webviewRootResourceAuthority };
