
import { equalsIgnoreCase } from '../../../../base/common/strings.js';
import { State } from './debug.js';
import { URI } from '../../../../base/common/uri.js';
import { isAbsolute } from '../../../../base/common/path.js';
import { deepClone } from '../../../../base/common/objects.js';
import { Schemas } from '../../../../base/common/network.js';
import { Range } from '../../../../editor/common/core/range.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { OperatingSystem, OS } from '../../../../base/common/platform.js';

const _formatPIIRegexp = /{([^}]+)}/g;
function formatPII(value, excludePII, args) {
    return value.replace(_formatPIIRegexp, function(match, group) {
        return args && args.hasOwnProperty(group) ? args[group] : match;
    });
}
function filterExceptionsFromTelemetry(data) {
    const output = {};
    for (const key of ( Object.keys(data))) {
        if (!key.startsWith("!")) {
            output[key] = data[key];
        }
    }
    return output;
}
function isSessionAttach(session) {
    return session.configuration.request === "attach" && !getExtensionHostDebugSession(session) && (!session.parentSession || isSessionAttach(session.parentSession));
}
function getExtensionHostDebugSession(session) {
    let type = session.configuration.type;
    if (!type) {
        return;
    }
    if (type === "vslsShare") {
        type = session.configuration.adapterProxy?.configuration?.type || type;
    }
    if (equalsIgnoreCase(type, "extensionhost") || equalsIgnoreCase(type, "pwa-extensionhost")) {
        return session;
    }
    return session.parentSession ? getExtensionHostDebugSession(session.parentSession) : undefined;
}
function isDebuggerMainContribution(dbg) {
    return dbg.type && (dbg.label || dbg.program || dbg.runtime);
}
function getExactExpressionStartAndEnd(lineContent, looseStart, looseEnd) {
    let matchingExpression = undefined;
    let startOffset = 0;
    const expression = /([^()\[\]{}<>\s+\-/%~#^;=|,`!]|\->)+/g;
    let result = null;
    while (result = expression.exec(lineContent)) {
        const start = result.index + 1;
        const end = start + result[0].length;
        if (start <= looseStart && end >= looseEnd) {
            matchingExpression = result[0];
            startOffset = start;
            break;
        }
    }
    if (matchingExpression) {
        const spreadMatch = matchingExpression.match(/^\.\.\.(.+)/);
        if (spreadMatch) {
            matchingExpression = spreadMatch[1];
            startOffset += 3;
        }
    }
    if (matchingExpression) {
        const subExpression = /(\w|\p{L})+/gu;
        let subExpressionResult = null;
        while (subExpressionResult = subExpression.exec(matchingExpression)) {
            const subEnd = subExpressionResult.index + 1 + startOffset + subExpressionResult[0].length;
            if (subEnd >= looseEnd) {
                break;
            }
        }
        if (subExpressionResult) {
            matchingExpression = matchingExpression.substring(0, subExpression.lastIndex);
        }
    }
    return matchingExpression ? {
        start: startOffset,
        end: startOffset + matchingExpression.length - 1
    } : {
        start: 0,
        end: 0
    };
}
async function getEvaluatableExpressionAtPosition(languageFeaturesService, model, position, token) {
    if (( languageFeaturesService.evaluatableExpressionProvider.has(model))) {
        const supports = languageFeaturesService.evaluatableExpressionProvider.ordered(model);
        const results = coalesce(await Promise.all(( supports.map(async support => {
            try {
                return await support.provideEvaluatableExpression(model, position, token ?? CancellationToken.None);
            } catch (err) {
                return undefined;
            }
        }))));
        if (results.length > 0) {
            let matchingExpression = results[0].expression;
            const range = results[0].range;
            if (!matchingExpression) {
                const lineContent = model.getLineContent(position.lineNumber);
                matchingExpression = lineContent.substring(range.startColumn - 1, range.endColumn - 1);
            }
            return {
                range,
                matchingExpression
            };
        }
    } else {
        const lineContent = model.getLineContent(position.lineNumber);
        const {
            start,
            end
        } = getExactExpressionStartAndEnd(lineContent, position.column, position.column);
        const matchingExpression = lineContent.substring(start - 1, end);
        return {
            matchingExpression,
            range: ( new Range(
                position.lineNumber,
                start,
                position.lineNumber,
                start + matchingExpression.length
            ))
        };
    }
    return null;
}
const _schemePattern = /^[a-zA-Z][a-zA-Z0-9\+\-\.]+:/;
function isUriString(s) {
    return !!(s && s.match(_schemePattern));
}
function stringToUri(source) {
    if (typeof source.path === "string") {
        if (typeof source.sourceReference === "number" && source.sourceReference > 0)
            ; else {
            if (isUriString(source.path)) {
                return URI.parse(source.path);
            } else {
                if (isAbsolute(source.path)) {
                    return URI.file(source.path);
                }
            }
        }
    }
    return source.path;
}
function uriToString(source) {
    if (typeof source.path === "object") {
        const u = URI.revive(source.path);
        if (u) {
            if (u.scheme === Schemas.file) {
                return u.fsPath;
            } else {
                return ( u.toString());
            }
        }
    }
    return source.path;
}
function convertToDAPaths(message, toUri) {
    const fixPath = toUri ? stringToUri : uriToString;
    const msg = deepClone(message);
    convertPaths(msg, (toDA, source) => {
        if (toDA && source) {
            source.path = fixPath(source);
        }
    });
    return msg;
}
function convertToVSCPaths(message, toUri) {
    const fixPath = toUri ? stringToUri : uriToString;
    const msg = deepClone(message);
    convertPaths(msg, (toDA, source) => {
        if (!toDA && source) {
            source.path = fixPath(source);
        }
    });
    return msg;
}
function convertPaths(msg, fixSourcePath) {
    switch (msg.type) {
    case "event":
        {
            const event = msg;
            switch (event.event) {
            case "output":
                fixSourcePath(false, event.body.source);
                break;
            case "loadedSource":
                fixSourcePath(false, event.body.source);
                break;
            case "breakpoint":
                fixSourcePath(false, event.body.breakpoint.source);
                break;
            }
            break;
        }
    case "request":
        {
            const request = msg;
            switch (request.command) {
            case "setBreakpoints":
                fixSourcePath(true, request.arguments.source);
                break;
            case "breakpointLocations":
                fixSourcePath(true, request.arguments.source);
                break;
            case "source":
                fixSourcePath(true, request.arguments.source);
                break;
            case "gotoTargets":
                fixSourcePath(true, request.arguments.source);
                break;
            case "launchVSCode":
                request.arguments.args.forEach(arg => fixSourcePath(false, arg));
                break;
            }
            break;
        }
    case "response":
        {
            const response = msg;
            if (response.success && response.body) {
                switch (response.command) {
                case "stackTrace":
                    response.body.stackFrames.forEach(frame => fixSourcePath(false, frame.source));
                    break;
                case "loadedSources":
                    response.body.sources.forEach(source => fixSourcePath(false, source));
                    break;
                case "scopes":
                    response.body.scopes.forEach(scope => fixSourcePath(false, scope.source));
                    break;
                case "setFunctionBreakpoints":
                    response.body.breakpoints.forEach(bp => fixSourcePath(false, bp.source));
                    break;
                case "setBreakpoints":
                    response.body.breakpoints.forEach(bp => fixSourcePath(false, bp.source));
                    break;
                case "disassemble":
                    {
                        const di = response;
                        di.body?.instructions.forEach(di => fixSourcePath(false, di.location));
                    }
                    break;
                case "locations":
                    fixSourcePath(false, response.body?.source);
                    break;
                }
            }
            break;
        }
    }
}
function getVisibleAndSorted(array) {
    return array.filter(config => !config.presentation?.hidden).sort((first, second) => {
        if (!first.presentation) {
            if (!second.presentation) {
                return 0;
            }
            return 1;
        }
        if (!second.presentation) {
            return -1;
        }
        if (!first.presentation.group) {
            if (!second.presentation.group) {
                return compareOrders(first.presentation.order, second.presentation.order);
            }
            return 1;
        }
        if (!second.presentation.group) {
            return -1;
        }
        if (first.presentation.group !== second.presentation.group) {
            return first.presentation.group.localeCompare(second.presentation.group);
        }
        return compareOrders(first.presentation.order, second.presentation.order);
    });
}
function compareOrders(first, second) {
    if (typeof first !== "number") {
        if (typeof second !== "number") {
            return 0;
        }
        return 1;
    }
    if (typeof second !== "number") {
        return -1;
    }
    return first - second;
}
async function saveAllBeforeDebugStart(configurationService, editorService) {
    const saveBeforeStartConfig = configurationService.getValue("debug.saveBeforeStart", {
        overrideIdentifier: editorService.activeTextEditorLanguageId
    });
    if (saveBeforeStartConfig !== "none") {
        await editorService.saveAll();
        if (saveBeforeStartConfig === "allEditorsInActiveGroup") {
            const activeEditor = editorService.activeEditorPane;
            if (activeEditor && activeEditor.input.resource?.scheme === Schemas.untitled) {
                await editorService.save({
                    editor: activeEditor.input,
                    groupId: activeEditor.group.id
                });
            }
        }
    }
    await configurationService.reloadConfiguration();
}
const sourcesEqual = (a, b) => !a || !b ? a === b : a.name === b.name && a.path === b.path && a.sourceReference === b.sourceReference;
function resolveChildSession(session, allSessions) {
    const childSessions = allSessions.filter(s => s.parentSession === session);
    if (childSessions.length > 0) {
        const stoppedChildSession = childSessions.find(s => s.state === State.Stopped);
        if (stoppedChildSession) {
            return stoppedChildSession;
        } else {
            return childSessions[0];
        }
    }
    return session;
}
function getPlatformSpecificConfig(config, os) {
    switch (os) {
    case OperatingSystem.Windows:
        return config.windows;
    case OperatingSystem.Macintosh:
        return config.osx;
    case OperatingSystem.Linux:
        return config.linux;
    }
}
function getEffectiveConfigForPlatform(config, os = OS) {
    const platformConfig = getPlatformSpecificConfig(config, os);
    if (!platformConfig) {
        return config;
    }
    return {
        ...config,
        ...platformConfig,
        presentation: platformConfig.presentation ? {
            ...config.presentation,
            ...platformConfig.presentation
        } : config.presentation
    };
}

export { convertToDAPaths, convertToVSCPaths, filterExceptionsFromTelemetry, formatPII, getEffectiveConfigForPlatform, getEvaluatableExpressionAtPosition, getExactExpressionStartAndEnd, getExtensionHostDebugSession, getVisibleAndSorted, isDebuggerMainContribution, isSessionAttach, isUriString, resolveChildSession, saveAllBeforeDebugStart, sourcesEqual };
