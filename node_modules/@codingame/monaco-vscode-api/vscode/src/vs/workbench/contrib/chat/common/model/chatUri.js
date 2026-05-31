
import { encodeBase64, VSBuffer, decodeBase64 } from '../../../../../base/common/buffer.js';
import { Schemas } from '../../../../../base/common/network.js';
import { URI } from '../../../../../base/common/uri.js';
import { localChatSessionType } from '../chatSessionsService.js';

var LocalChatSessionUri;
(function(LocalChatSessionUri) {
    LocalChatSessionUri.scheme = Schemas.vscodeLocalChatSession;
    function forSession(sessionId) {
        const encodedId = encodeBase64(VSBuffer.wrap(( new TextEncoder()).encode(sessionId)), false, true);
        return ( URI.from({
            scheme: LocalChatSessionUri.scheme,
            authority: localChatSessionType,
            path: "/" + encodedId
        }));
    }
    LocalChatSessionUri.forSession = forSession;
    function getNewSessionUri() {
        const handle = Math.floor(Math.random() * 1e9);
        return forSession(`chat-${handle}`);
    }
    LocalChatSessionUri.getNewSessionUri = getNewSessionUri;
    function parseLocalSessionId(resource) {
        const parsed = parse(resource);
        return parsed?.chatSessionType === localChatSessionType ? parsed.sessionId : undefined;
    }
    LocalChatSessionUri.parseLocalSessionId = parseLocalSessionId;
    function isLocalSession(resource) {
        return !!parseLocalSessionId(resource);
    }
    LocalChatSessionUri.isLocalSession = isLocalSession;
    function parse(resource) {
        if (resource.scheme !== LocalChatSessionUri.scheme) {
            return undefined;
        }
        if (!resource.authority) {
            return undefined;
        }
        const parts = resource.path.split("/");
        if (parts.length !== 2) {
            return undefined;
        }
        const chatSessionType = resource.authority;
        const decodedSessionId = decodeBase64(parts[1]);
        return {
            chatSessionType,
            sessionId: ( new TextDecoder()).decode(decodedSessionId.buffer)
        };
    }
})(LocalChatSessionUri || (LocalChatSessionUri = {}));
function chatSessionResourceToId(resource) {
    const localId = LocalChatSessionUri.parseLocalSessionId(resource);
    if (localId) {
        return localId;
    }
    return ( resource.toString());
}
function getChatSessionType(resource) {
    if (resource.scheme === Schemas.vscodeChatEditor) {
        return localChatSessionType;
    }
    if (resource.scheme === LocalChatSessionUri.scheme) {
        return resource.authority || localChatSessionType;
    }
    return resource.scheme;
}
function isUntitledChatSession(resource) {
    return resource.path.startsWith("/untitled-");
}

export { LocalChatSessionUri, chatSessionResourceToId, getChatSessionType, isUntitledChatSession };
