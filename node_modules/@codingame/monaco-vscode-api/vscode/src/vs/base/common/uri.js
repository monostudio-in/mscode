
import { CharCode } from './charCode.js';
import { MarshalledId } from './marshallingIds.js';
import { win32, posix } from './path.js';
import { isWindows } from './platform.js';

const _schemePattern = /^\w[\w\d+.-]*$/;
const _singleSlashStart = /^\//;
const _doubleSlashStart = /^\/\//;
function _validateUri(ret, _strict) {
    if (!ret.scheme && _strict) {
        throw ( new Error(
            `[UriError]: Scheme is missing: {scheme: "", authority: "${ret.authority}", path: "${ret.path}", query: "${ret.query}", fragment: "${ret.fragment}"}`
        ));
    }
    if (ret.scheme && !_schemePattern.test(ret.scheme)) {
        const matches = [...ret.scheme.matchAll(/[^\w\d+.-]/gu)];
        const detail = matches.length > 0 ? ` Found '${matches[0][0]}' at index ${matches[0].index} (${matches.length} total)` : "";
        throw ( new Error(
            `[UriError]: Scheme contains illegal characters.${detail} (len:${ret.scheme.length})`
        ));
    }
    if (ret.path) {
        if (ret.authority) {
            if (!_singleSlashStart.test(ret.path)) {
                throw ( new Error(
                    "[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash (\"/\") character"
                ));
            }
        } else {
            if (_doubleSlashStart.test(ret.path)) {
                throw ( new Error(
                    "[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters (\"//\")"
                ));
            }
        }
    }
}
function _schemeFix(scheme, _strict) {
    if (!scheme && !_strict) {
        return "file";
    }
    return scheme;
}
function _referenceResolution(scheme, path) {
    switch (scheme) {
    case "https":
    case "http":
    case "file":
        if (!path) {
            path = _slash;
        } else if (path[0] !== _slash) {
            path = _slash + path;
        }
        break;
    }
    return path;
}
const _empty = "";
const _slash = "/";
const _regexp = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
class URI {
    static isUri(thing) {
        if (thing instanceof URI) {
            return true;
        }
        if (!thing || typeof thing !== "object") {
            return false;
        }
        return typeof thing.authority === "string" && typeof thing.fragment === "string" && typeof thing.path === "string" && typeof thing.query === "string" && typeof thing.scheme === "string" && typeof thing.fsPath === "string" && typeof thing.with === "function" && typeof thing.toString === "function";
    }
    constructor(schemeOrData, authority, path, query, fragment, _strict = false) {
        if (typeof schemeOrData === "object") {
            this.scheme = schemeOrData.scheme || _empty;
            this.authority = schemeOrData.authority || _empty;
            this.path = schemeOrData.path || _empty;
            this.query = schemeOrData.query || _empty;
            this.fragment = schemeOrData.fragment || _empty;
        } else {
            this.scheme = _schemeFix(schemeOrData, _strict);
            this.authority = authority || _empty;
            this.path = _referenceResolution(this.scheme, path || _empty);
            this.query = query || _empty;
            this.fragment = fragment || _empty;
            _validateUri(this, _strict);
        }
    }
    get fsPath() {
        return uriToFsPath(this, false);
    }
    with(change) {
        if (!change) {
            return this;
        }
        let {
            scheme,
            authority,
            path,
            query,
            fragment
        } = change;
        if (scheme === undefined) {
            scheme = this.scheme;
        } else if (scheme === null) {
            scheme = _empty;
        }
        if (authority === undefined) {
            authority = this.authority;
        } else if (authority === null) {
            authority = _empty;
        }
        if (path === undefined) {
            path = this.path;
        } else if (path === null) {
            path = _empty;
        }
        if (query === undefined) {
            query = this.query;
        } else if (query === null) {
            query = _empty;
        }
        if (fragment === undefined) {
            fragment = this.fragment;
        } else if (fragment === null) {
            fragment = _empty;
        }
        if (scheme === this.scheme && authority === this.authority && path === this.path && query === this.query && fragment === this.fragment) {
            return this;
        }
        return ( new Uri(scheme, authority, path, query, fragment));
    }
    static parse(value, _strict = false) {
        const match = _regexp.exec(value);
        if (!match) {
            return ( new Uri(_empty, _empty, _empty, _empty, _empty));
        }
        return ( new Uri(
            match[2] || _empty,
            percentDecode(match[4] || _empty),
            percentDecode(match[5] || _empty),
            percentDecode(match[7] || _empty),
            percentDecode(match[9] || _empty),
            _strict
        ));
    }
    static file(path) {
        let authority = _empty;
        if (isWindows) {
            path = path.replace(/\\/g, _slash);
        }
        if (path[0] === _slash && path[1] === _slash) {
            const idx = path.indexOf(_slash, 2);
            if (idx === -1) {
                authority = path.substring(2);
                path = _slash;
            } else {
                authority = path.substring(2, idx);
                path = path.substring(idx) || _slash;
            }
        }
        return ( new Uri("file", authority, path, _empty, _empty));
    }
    static from(components, strict) {
        const result = ( new Uri(
            components.scheme,
            components.authority,
            components.path,
            components.query,
            components.fragment,
            strict
        ));
        return result;
    }
    static joinPath(uri, ...pathFragment) {
        if (!uri.path) {
            throw ( new Error(`[UriError]: cannot call joinPath on URI without path: ${( uri.toString())}`));
        }
        let newPath;
        if (isWindows && uri.scheme === "file") {
            newPath = URI.file(win32.join(uriToFsPath(uri, true), ...pathFragment)).path;
        } else {
            newPath = posix.join(uri.path, ...pathFragment);
        }
        return uri.with({
            path: newPath
        });
    }
    toString(skipEncoding = false) {
        return _asFormatted(this, skipEncoding);
    }
    toJSON() {
        return this;
    }
    static revive(data) {
        if (!data) {
            return data;
        } else if (data instanceof URI) {
            return data;
        } else {
            const result = ( new Uri(data));
            result._formatted = data.external ?? null;
            result._fsPath = data._sep === _pathSepMarker ? data.fsPath ?? null : null;
            return result;
        }
    }
    [Symbol.for("debug.description")]() {
        return `URI(${( this.toString())})`;
    }
}
function isUriComponents(thing) {
    if (!thing || typeof thing !== "object") {
        return false;
    }
    return typeof thing.scheme === "string" && (typeof thing.authority === "string" || typeof thing.authority === "undefined") && (typeof thing.path === "string" || typeof thing.path === "undefined") && (typeof thing.query === "string" || typeof thing.query === "undefined") && (typeof thing.fragment === "string" || typeof thing.fragment === "undefined");
}
const _pathSepMarker = isWindows ? 1 : undefined;
class Uri extends URI {
    constructor() {
        super(...arguments);
        this._formatted = null;
        this._fsPath = null;
    }
    get fsPath() {
        if (!this._fsPath) {
            this._fsPath = uriToFsPath(this, false);
        }
        return this._fsPath;
    }
    toString(skipEncoding = false) {
        if (!skipEncoding) {
            if (!this._formatted) {
                this._formatted = _asFormatted(this, false);
            }
            return this._formatted;
        } else {
            return _asFormatted(this, true);
        }
    }
    toJSON() {
        const res = {
            $mid: MarshalledId.Uri
        };
        if (this._fsPath) {
            res.fsPath = this._fsPath;
            res._sep = _pathSepMarker;
        }
        if (this._formatted) {
            res.external = this._formatted;
        }
        if (this.path) {
            res.path = this.path;
        }
        if (this.scheme) {
            res.scheme = this.scheme;
        }
        if (this.authority) {
            res.authority = this.authority;
        }
        if (this.query) {
            res.query = this.query;
        }
        if (this.fragment) {
            res.fragment = this.fragment;
        }
        return res;
    }
}
const encodeTable = {
    [CharCode.Colon]: "%3A",
    [CharCode.Slash]: "%2F",
    [CharCode.QuestionMark]: "%3F",
    [CharCode.Hash]: "%23",
    [CharCode.OpenSquareBracket]: "%5B",
    [CharCode.CloseSquareBracket]: "%5D",
    [CharCode.AtSign]: "%40",
    [CharCode.ExclamationMark]: "%21",
    [CharCode.DollarSign]: "%24",
    [CharCode.Ampersand]: "%26",
    [CharCode.SingleQuote]: "%27",
    [CharCode.OpenParen]: "%28",
    [CharCode.CloseParen]: "%29",
    [CharCode.Asterisk]: "%2A",
    [CharCode.Plus]: "%2B",
    [CharCode.Comma]: "%2C",
    [CharCode.Semicolon]: "%3B",
    [CharCode.Equals]: "%3D",
    [CharCode.Space]: "%20"
};
function encodeURIComponentFast(uriComponent, isPath, isAuthority) {
    let res = undefined;
    let nativeEncodePos = -1;
    for (let pos = 0; pos < uriComponent.length; pos++) {
        const code = uriComponent.charCodeAt(pos);
        if ((code >= CharCode.a && code <= CharCode.z) || (code >= CharCode.A && code <= CharCode.Z) || (code >= CharCode.Digit0 && code <= CharCode.Digit9) || code === CharCode.Dash || code === CharCode.Period || code === CharCode.Underline || code === CharCode.Tilde || (isPath && code === CharCode.Slash) || (isAuthority && code === CharCode.OpenSquareBracket) || (isAuthority && code === CharCode.CloseSquareBracket) || (isAuthority && code === CharCode.Colon)) {
            if (nativeEncodePos !== -1) {
                res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                nativeEncodePos = -1;
            }
            if (res !== undefined) {
                res += uriComponent.charAt(pos);
            }
        } else {
            if (res === undefined) {
                res = uriComponent.substr(0, pos);
            }
            const escaped = encodeTable[code];
            if (escaped !== undefined) {
                if (nativeEncodePos !== -1) {
                    res += encodeURIComponent(uriComponent.substring(nativeEncodePos, pos));
                    nativeEncodePos = -1;
                }
                res += escaped;
            } else if (nativeEncodePos === -1) {
                nativeEncodePos = pos;
            }
        }
    }
    if (nativeEncodePos !== -1) {
        res += encodeURIComponent(uriComponent.substring(nativeEncodePos));
    }
    return res !== undefined ? res : uriComponent;
}
function encodeURIComponentMinimal(path) {
    let res = undefined;
    for (let pos = 0; pos < path.length; pos++) {
        const code = path.charCodeAt(pos);
        if (code === CharCode.Hash || code === CharCode.QuestionMark) {
            if (res === undefined) {
                res = path.substr(0, pos);
            }
            res += encodeTable[code];
        } else {
            if (res !== undefined) {
                res += path[pos];
            }
        }
    }
    return res !== undefined ? res : path;
}
function uriToFsPath(uri, keepDriveLetterCasing) {
    let value;
    if (uri.authority && uri.path.length > 1 && uri.scheme === "file") {
        value = `//${uri.authority}${uri.path}`;
    } else if (uri.path.charCodeAt(0) === CharCode.Slash && (uri.path.charCodeAt(1) >= CharCode.A && uri.path.charCodeAt(1) <= CharCode.Z || uri.path.charCodeAt(1) >= CharCode.a && uri.path.charCodeAt(1) <= CharCode.z) && uri.path.charCodeAt(2) === CharCode.Colon) {
        if (!keepDriveLetterCasing) {
            value = uri.path[1].toLowerCase() + uri.path.substr(2);
        } else {
            value = uri.path.substr(1);
        }
    } else {
        value = uri.path;
    }
    if (isWindows) {
        value = value.replace(/\//g, "\\");
    }
    return value;
}
function _asFormatted(uri, skipEncoding) {
    const encoder = !skipEncoding ? encodeURIComponentFast : encodeURIComponentMinimal;
    let res = "";
    let {
        scheme,
        authority,
        path,
        query,
        fragment
    } = uri;
    if (scheme) {
        res += scheme;
        res += ":";
    }
    if (authority || scheme === "file") {
        res += _slash;
        res += _slash;
    }
    if (authority) {
        let idx = authority.indexOf("@");
        if (idx !== -1) {
            const userinfo = authority.substr(0, idx);
            authority = authority.substr(idx + 1);
            idx = userinfo.lastIndexOf(":");
            if (idx === -1) {
                res += encoder(userinfo, false, false);
            } else {
                res += encoder(userinfo.substr(0, idx), false, false);
                res += ":";
                res += encoder(userinfo.substr(idx + 1), false, true);
            }
            res += "@";
        }
        authority = authority.toLowerCase();
        idx = authority.lastIndexOf(":");
        if (idx === -1) {
            res += encoder(authority, false, true);
        } else {
            res += encoder(authority.substr(0, idx), false, true);
            res += authority.substr(idx);
        }
    }
    if (path) {
        if (path.length >= 3 && path.charCodeAt(0) === CharCode.Slash && path.charCodeAt(2) === CharCode.Colon) {
            const code = path.charCodeAt(1);
            if (code >= CharCode.A && code <= CharCode.Z) {
                path = `/${String.fromCharCode(code + 32)}:${path.substr(3)}`;
            }
        } else if (path.length >= 2 && path.charCodeAt(1) === CharCode.Colon) {
            const code = path.charCodeAt(0);
            if (code >= CharCode.A && code <= CharCode.Z) {
                path = `${String.fromCharCode(code + 32)}:${path.substr(2)}`;
            }
        }
        res += encoder(path, true, false);
    }
    if (query) {
        res += "?";
        res += encoder(query, false, false);
    }
    if (fragment) {
        res += "#";
        res += !skipEncoding ? encodeURIComponentFast(fragment, false, false) : fragment;
    }
    return res;
}
function decodeURIComponentGraceful(str) {
    try {
        return decodeURIComponent(str);
    } catch {
        if (str.length > 3) {
            return str.substr(0, 3) + decodeURIComponentGraceful(str.substr(3));
        } else {
            return str;
        }
    }
}
const _rEncodedAsHex = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
function percentDecode(str) {
    if (!str.match(_rEncodedAsHex)) {
        return str;
    }
    return str.replace(_rEncodedAsHex, match => decodeURIComponentGraceful(match));
}

export { URI, isUriComponents, uriToFsPath };
