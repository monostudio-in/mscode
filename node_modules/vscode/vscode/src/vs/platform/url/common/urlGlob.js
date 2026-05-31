
import { URI } from '../../../base/common/uri.js';

function normalizeURL(url) {
    const uri = typeof url === "string" ? ( URI.parse(url)) : url;
    return uri.with({
        path: uri.path.replace(/\/+$/, ""),
        query: null,
        fragment: null
    });
}
function testUrlMatchesGlob(uri, globUrl) {
    const normalizedUrl = normalizeURL(uri);
    let normalizedGlobUrl;
    const globHasScheme = /^[^./:]*:\/\//.test(globUrl);
    if (!globHasScheme) {
        if (normalizedUrl.scheme !== "http" && normalizedUrl.scheme !== "https") {
            return false;
        }
        normalizedGlobUrl = normalizeURL(`${normalizedUrl.scheme}://${globUrl}`);
    } else {
        normalizedGlobUrl = normalizeURL(globUrl);
    }
    return (doMemoUrlMatch(normalizedUrl.scheme, normalizedGlobUrl.scheme) &&
    doMemoUrlMatch(normalizedUrl.authority, normalizedGlobUrl.authority, true) &&
    (normalizedGlobUrl.path === "/" || doMemoUrlMatch(normalizedUrl.path, normalizedGlobUrl.path)));
}
function doMemoUrlMatch(normalizedUrlPart, normalizedGlobUrlPart, includePortLogic = false) {
    const memo = ( Array.from({
        length: normalizedUrlPart.length + 1
    }).map(() => ( Array.from({
        length: normalizedGlobUrlPart.length + 1
    }).map(() => undefined))));
    return doUrlPartMatch(memo, includePortLogic, normalizedUrlPart, normalizedGlobUrlPart, 0, 0);
}
function doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset) {
    if (memo[urlOffset]?.[globUrlOffset] !== undefined) {
        return memo[urlOffset][globUrlOffset];
    }
    const options = [];
    if (urlOffset === urlPart.length) {
        if (globUrlOffset === globUrlPart.length) {
            return true;
        }
        if (includePortLogic && globUrlPart[globUrlOffset] + globUrlPart[globUrlOffset + 1] === ":*") {
            return globUrlOffset + 2 === globUrlPart.length;
        }
        return false;
    }
    if (globUrlOffset === globUrlPart.length) {
        const remaining = urlPart.slice(urlOffset);
        return remaining[0] === "/";
    }
    if (urlPart[urlOffset] === globUrlPart[globUrlOffset]) {
        options.push(doUrlPartMatch(
            memo,
            includePortLogic,
            urlPart,
            globUrlPart,
            urlOffset + 1,
            globUrlOffset + 1
        ));
    }
    if (globUrlPart[globUrlOffset] + globUrlPart[globUrlOffset + 1] === "*.") {
        if (!["/", ":"].includes(urlPart[urlOffset])) {
            options.push(
                doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset + 1, globUrlOffset)
            );
        }
        if (urlOffset === 0 || urlPart[urlOffset - 1] === ".") {
            options.push(
                doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset + 2)
            );
        }
    }
    if (globUrlPart[globUrlOffset] === "*") {
        if (urlOffset + 1 === urlPart.length) {
            options.push(doUrlPartMatch(
                memo,
                includePortLogic,
                urlPart,
                globUrlPart,
                urlOffset + 1,
                globUrlOffset + 1
            ));
        } else {
            options.push(
                doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset + 1, globUrlOffset)
            );
        }
        options.push(
            doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset + 1)
        );
    }
    if (includePortLogic && globUrlPart[globUrlOffset] + globUrlPart[globUrlOffset + 1] === ":*") {
        if (urlPart[urlOffset] === ":") {
            let endPortIndex = urlOffset + 1;
            do {
                endPortIndex++;
            } while (/[0-9]/.test(urlPart[endPortIndex]));
            options.push(doUrlPartMatch(
                memo,
                includePortLogic,
                urlPart,
                globUrlPart,
                endPortIndex,
                globUrlOffset + 2
            ));
        } else {
            options.push(
                doUrlPartMatch(memo, includePortLogic, urlPart, globUrlPart, urlOffset, globUrlOffset + 2)
            );
        }
    }
    return (memo[urlOffset][globUrlOffset] = ( options.some(a => a === true)));
}

export { testUrlMatchesGlob };
