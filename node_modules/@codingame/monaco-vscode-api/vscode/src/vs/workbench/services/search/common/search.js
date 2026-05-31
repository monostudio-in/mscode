
import { mapArrayOrNot } from '../../../../base/common/arrays.js';
import { match, parse } from '../../../../base/common/glob.js';
import { mixin, deepClone } from '../../../../base/common/objects.js';
import { isEqualOrParent } from '../../../../base/common/extpath.js';
import { getNLines } from '../../../../base/common/strings.js';
import { relative } from '../../../../base/common/path.js';
import { isCancellationError } from '../../../../base/common/errors.js';
export { TextSearchCompleteMessageType } from './searchExtTypes.js';
import { isThenable } from '../../../../base/common/async.js';

const VIEWLET_ID = "workbench.view.search";
const VIEW_ID = "workbench.view.search";
const SEARCH_RESULT_LANGUAGE_ID = "search-result";
const SEARCH_EXCLUDE_CONFIG = "search.exclude";
const DEFAULT_MAX_SEARCH_RESULTS = 20000;
const SEARCH_ELIDED_PREFIX = "⟪ ";
const SEARCH_ELIDED_SUFFIX = " characters skipped ⟫";
const SEARCH_ELIDED_MIN_LEN = (SEARCH_ELIDED_PREFIX.length + SEARCH_ELIDED_SUFFIX.length + 5) * 2;
var SearchProviderType;
(function(SearchProviderType) {
    SearchProviderType[SearchProviderType["file"] = 0] = "file";
    SearchProviderType[SearchProviderType["text"] = 1] = "text";
    SearchProviderType[SearchProviderType["aiText"] = 2] = "aiText";
})(SearchProviderType || (SearchProviderType = {}));
var QueryType;
(function(QueryType) {
    QueryType[QueryType["File"] = 1] = "File";
    QueryType[QueryType["Text"] = 2] = "Text";
    QueryType[QueryType["aiText"] = 3] = "aiText";
})(QueryType || (QueryType = {}));
function resultIsMatch(result) {
    return !!result.rangeLocations && !!result.previewText;
}
function isFileMatch(p) {
    return !!p.resource;
}
function isAIKeyword(p) {
    return !!p.keyword;
}
function isProgressMessage(p) {
    return !!p.message;
}
var SearchCompletionExitCode;
(function(SearchCompletionExitCode) {
    SearchCompletionExitCode[SearchCompletionExitCode["Normal"] = 0] = "Normal";
    SearchCompletionExitCode[SearchCompletionExitCode["NewSearchStarted"] = 1] = "NewSearchStarted";
})(SearchCompletionExitCode || (SearchCompletionExitCode = {}));
class FileMatch {
    constructor(resource) {
        this.resource = resource;
        this.results = [];
    }
}
class TextSearchMatch {
    constructor(text, ranges, previewOptions, webviewIndex) {
        this.rangeLocations = [];
        this.webviewIndex = webviewIndex;
        const rangesArr = Array.isArray(ranges) ? ranges : [ranges];
        if (previewOptions && previewOptions.matchLines === 1 && isSingleLineRangeList(rangesArr)) {
            text = getNLines(text, previewOptions.matchLines);
            let result = "";
            let shift = 0;
            let lastEnd = 0;
            const leadingChars = Math.floor(previewOptions.charsPerLine / 5);
            for (const range of rangesArr) {
                const previewStart = Math.max(range.startColumn - leadingChars, 0);
                const previewEnd = range.startColumn + previewOptions.charsPerLine;
                if (previewStart > lastEnd + leadingChars + SEARCH_ELIDED_MIN_LEN) {
                    const elision = SEARCH_ELIDED_PREFIX + (previewStart - lastEnd) + SEARCH_ELIDED_SUFFIX;
                    result += elision + text.slice(previewStart, previewEnd);
                    shift += previewStart - (lastEnd + elision.length);
                } else {
                    result += text.slice(lastEnd, previewEnd);
                }
                lastEnd = previewEnd;
                this.rangeLocations.push({
                    source: range,
                    preview: ( new OneLineRange(0, range.startColumn - shift, range.endColumn - shift))
                });
            }
            this.previewText = result;
        } else {
            const firstMatchLine = Array.isArray(ranges) ? ranges[0].startLineNumber : ranges.startLineNumber;
            const rangeLocs = mapArrayOrNot(ranges, r => ({
                preview: ( new SearchRange(
                    r.startLineNumber - firstMatchLine,
                    r.startColumn,
                    r.endLineNumber - firstMatchLine,
                    r.endColumn
                )),
                source: r
            }));
            this.rangeLocations = Array.isArray(rangeLocs) ? rangeLocs : [rangeLocs];
            this.previewText = text;
        }
    }
}
function isSingleLineRangeList(ranges) {
    const line = ranges[0].startLineNumber;
    for (const r of ranges) {
        if (r.startLineNumber !== line || r.endLineNumber !== line) {
            return false;
        }
    }
    return true;
}
class SearchRange {
    constructor(startLineNumber, startColumn, endLineNumber, endColumn) {
        this.startLineNumber = startLineNumber;
        this.startColumn = startColumn;
        this.endLineNumber = endLineNumber;
        this.endColumn = endColumn;
    }
}
class OneLineRange extends SearchRange {
    constructor(lineNumber, startColumn, endColumn) {
        super(lineNumber, startColumn, lineNumber, endColumn);
    }
}
var ViewMode;
(function(ViewMode) {
    ViewMode["List"] = "list";
    ViewMode["Tree"] = "tree";
})(ViewMode || (ViewMode = {}));
var SearchSortOrder;
(function(SearchSortOrder) {
    SearchSortOrder["Default"] = "default";
    SearchSortOrder["FileNames"] = "fileNames";
    SearchSortOrder["Type"] = "type";
    SearchSortOrder["Modified"] = "modified";
    SearchSortOrder["CountDescending"] = "countDescending";
    SearchSortOrder["CountAscending"] = "countAscending";
})(SearchSortOrder || (SearchSortOrder = {}));
var SemanticSearchBehavior;
(function(SemanticSearchBehavior) {
    SemanticSearchBehavior["Auto"] = "auto";
    SemanticSearchBehavior["Manual"] = "manual";
    SemanticSearchBehavior["RunOnEmpty"] = "runOnEmpty";
})(SemanticSearchBehavior || (SemanticSearchBehavior = {}));
function getExcludes(configuration, includeSearchExcludes = true) {
    const fileExcludes = configuration && configuration.files && configuration.files.exclude;
    const searchExcludes = includeSearchExcludes && configuration && configuration.search && configuration.search.exclude;
    if (!fileExcludes && !searchExcludes) {
        return undefined;
    }
    if (!fileExcludes || !searchExcludes) {
        return fileExcludes || searchExcludes || undefined;
    }
    let allExcludes = Object.create(null);
    allExcludes = mixin(allExcludes, deepClone(fileExcludes));
    allExcludes = mixin(allExcludes, deepClone(searchExcludes), true);
    return allExcludes;
}
function pathIncludedInQuery(queryProps, fsPath) {
    const globOptions = queryProps.ignoreGlobCase ? {
        ignoreCase: true
    } : undefined;
    if (queryProps.excludePattern && match(queryProps.excludePattern, fsPath, globOptions)) {
        return false;
    }
    if (queryProps.includePattern || queryProps.usingSearchPaths) {
        if (queryProps.includePattern && match(queryProps.includePattern, fsPath, globOptions)) {
            return true;
        }
        if (queryProps.usingSearchPaths) {
            return !!queryProps.folderQueries && ( queryProps.folderQueries.some(fq => {
                const searchPath = fq.folder.fsPath;
                if (isEqualOrParent(fsPath, searchPath, queryProps.ignoreGlobCase)) {
                    const relPath = relative(searchPath, fsPath);
                    return !fq.includePattern || !!match(fq.includePattern, relPath, globOptions);
                } else {
                    return false;
                }
            }));
        }
        return false;
    }
    return true;
}
var SearchErrorCode;
(function(SearchErrorCode) {
    SearchErrorCode[SearchErrorCode["unknownEncoding"] = 1] = "unknownEncoding";
    SearchErrorCode[SearchErrorCode["regexParseError"] = 2] = "regexParseError";
    SearchErrorCode[SearchErrorCode["globParseError"] = 3] = "globParseError";
    SearchErrorCode[SearchErrorCode["invalidLiteral"] = 4] = "invalidLiteral";
    SearchErrorCode[SearchErrorCode["rgProcessError"] = 5] = "rgProcessError";
    SearchErrorCode[SearchErrorCode["other"] = 6] = "other";
    SearchErrorCode[SearchErrorCode["canceled"] = 7] = "canceled";
})(SearchErrorCode || (SearchErrorCode = {}));
class SearchError extends Error {
    constructor(message, code) {
        super(message);
        this.code = code;
    }
}
function deserializeSearchError(error) {
    const errorMsg = error.message;
    if (isCancellationError(error)) {
        return ( new SearchError(errorMsg, SearchErrorCode.canceled));
    }
    try {
        const details = JSON.parse(errorMsg);
        return ( new SearchError(details.message, details.code));
    } catch (e) {
        return ( new SearchError(errorMsg, SearchErrorCode.other));
    }
}
function resolvePatternsForProvider(globalPattern, folderPattern) {
    const merged = {
        ...(globalPattern || {}),
        ...(folderPattern || {})
    };
    return ( Object.keys(merged)).filter(key => {
        const value = merged[key];
        return typeof value === "boolean" && value;
    });
}
class QueryGlobTester {
    constructor(config, folderQuery) {
        this._parsedIncludeExpression = null;
        const globOptions = config.ignoreGlobCase || folderQuery.ignoreGlobCase ? {
            ignoreCase: true
        } : undefined;
        this._excludeExpression = folderQuery.excludePattern?.map(excludePattern => {
            return {
                ...(config.excludePattern || {}),
                ...(excludePattern.pattern || {})
            };
        }) ?? [];
        if (this._excludeExpression.length === 0) {
            this._excludeExpression = [config.excludePattern || {}];
        }
        this._parsedExcludeExpression = ( this._excludeExpression.map(e => parse(e, globOptions)));
        let includeExpression = config.includePattern;
        if (folderQuery.includePattern) {
            if (includeExpression) {
                includeExpression = {
                    ...includeExpression,
                    ...folderQuery.includePattern
                };
            } else {
                includeExpression = folderQuery.includePattern;
            }
        }
        if (includeExpression) {
            this._parsedIncludeExpression = parse(includeExpression, globOptions);
        }
    }
    _evalParsedExcludeExpression(testPath, basename, hasSibling) {
        let result = null;
        for (const folderExclude of this._parsedExcludeExpression) {
            const evaluation = folderExclude(testPath, basename, hasSibling);
            if (typeof evaluation === "string") {
                result = evaluation;
                break;
            }
        }
        return result;
    }
    matchesExcludesSync(testPath, basename, hasSibling) {
        if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename, hasSibling)) {
            return true;
        }
        return false;
    }
    includedInQuerySync(testPath, basename, hasSibling) {
        if (this._parsedExcludeExpression && this._evalParsedExcludeExpression(testPath, basename, hasSibling)) {
            return false;
        }
        if (this._parsedIncludeExpression && !this._parsedIncludeExpression(testPath, basename, hasSibling)) {
            return false;
        }
        return true;
    }
    includedInQuery(testPath, basename, hasSibling) {
        const isIncluded = () => {
            return this._parsedIncludeExpression ? !!(this._parsedIncludeExpression(testPath, basename, hasSibling)) : true;
        };
        return Promise.all(( this._parsedExcludeExpression.map(e => {
            const excluded = e(testPath, basename, hasSibling);
            if (isThenable(excluded)) {
                return excluded.then(excluded => {
                    if (excluded) {
                        return false;
                    }
                    return isIncluded();
                });
            }
            return isIncluded();
        }))).then(e => ( e.some(e => !!e)));
    }
    hasSiblingExcludeClauses() {
        return this._excludeExpression.reduce((prev, curr) => hasSiblingClauses(curr) || prev, false);
    }
}
function hasSiblingClauses(pattern) {
    for (const key in pattern) {
        if (typeof pattern[key] !== "boolean") {
            return true;
        }
    }
    return false;
}
function hasSiblingPromiseFn(siblingsFn) {
    if (!siblingsFn) {
        return undefined;
    }
    let siblings;
    return name => {
        if (!siblings) {
            siblings = (siblingsFn() || Promise.resolve([])).then(list => list ? listToMap(list) : {});
        }
        return siblings.then(map => !!map[name]);
    };
}
function hasSiblingFn(siblingsFn) {
    if (!siblingsFn) {
        return undefined;
    }
    let siblings;
    return name => {
        if (!siblings) {
            const list = siblingsFn();
            siblings = list ? listToMap(list) : {};
        }
        return !!siblings[name];
    };
}
function listToMap(list) {
    const map = {};
    for (const key of list) {
        map[key] = true;
    }
    return map;
}
function excludeToGlobPattern(excludesForFolder) {
    return excludesForFolder.flatMap(exclude => ( exclude.patterns.map(pattern => {
        return exclude.baseUri ? {
            baseUri: exclude.baseUri,
            pattern: pattern
        } : pattern;
    })));
}
const DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS = {
    matchLines: 100,
    charsPerLine: 10000
};

export { DEFAULT_MAX_SEARCH_RESULTS, DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS, FileMatch, OneLineRange, QueryGlobTester, QueryType, SEARCH_EXCLUDE_CONFIG, SEARCH_RESULT_LANGUAGE_ID, SearchCompletionExitCode, SearchError, SearchErrorCode, SearchProviderType, SearchRange, SearchSortOrder, SemanticSearchBehavior, TextSearchMatch, VIEWLET_ID, VIEW_ID, ViewMode, deserializeSearchError, excludeToGlobPattern, getExcludes, hasSiblingFn, hasSiblingPromiseFn, isAIKeyword, isFileMatch, isProgressMessage, pathIncludedInQuery, resolvePatternsForProvider, resultIsMatch };
