
import { ResourceSet } from '../../../../base/common/map.js';
import { chatEditingSessionIsReady } from './editing/chatEditingService.js';
import { isLegacyChatTerminalToolInvocationData } from './chatService/chatService.js';

function checkModeOption(mode, option) {
    if (option === undefined) {
        return undefined;
    }
    if (typeof option === "function") {
        return option(mode);
    }
    return option;
}
function migrateLegacyTerminalToolSpecificData(data) {
    if (isLegacyChatTerminalToolInvocationData(data)) {
        data = {
            kind: "terminal",
            commandLine: {
                original: data.command,
                toolEdited: undefined,
                userEdited: undefined
            },
            language: data.language
        };
    }
    return data;
}
async function awaitStatsForSession(model) {
    if (!model.editingSession) {
        return undefined;
    }
    await chatEditingSessionIsReady(model.editingSession);
    if (!model.editingSession) {
        return undefined;
    }
    await Promise.all(( model.editingSession.entries.get().map(entry => entry.getDiffInfo?.())));
    if (!model.editingSession) {
        return undefined;
    }
    const diffs = model.editingSession.entries.get();
    const reduceResult = diffs.reduce((acc, diff) => {
        acc.fileUris.add(diff.originalURI);
        acc.added += diff.linesAdded?.get() ?? 0;
        acc.removed += diff.linesRemoved?.get() ?? 0;
        return acc;
    }, {
        fileUris: ( new ResourceSet()),
        added: 0,
        removed: 0
    });
    if (reduceResult.fileUris.size > 0 && (reduceResult.added > 0 || reduceResult.removed > 0)) {
        return {
            fileCount: reduceResult.fileUris.size,
            added: reduceResult.added,
            removed: reduceResult.removed
        };
    }
    return undefined;
}

export { awaitStatsForSession, checkModeOption, migrateLegacyTerminalToolSpecificData };
