
import { mark, clearMarks } from '../../../../base/common/performance.js';
import { chatSessionResourceToId } from './model/chatUri.js';

const chatPerfPrefix = "code/chat/";
const chatMarksBySession = ( new Map());
const ChatPerfMark = {
    RequestStart: "request/start",
    RequestUiUpdated: "request/uiUpdated",
    WillCollectInstructions: "request/willCollectInstructions",
    DidCollectInstructions: "request/didCollectInstructions",
    FirstToken: "request/firstToken",
    RequestComplete: "request/complete",
    AgentWillInvoke: "agent/willInvoke",
    AgentDidInvoke: "agent/didInvoke"
};
function markChat(sessionResource, name) {
    const sessionId = chatSessionResourceToId(sessionResource);
    const fullName = `${chatPerfPrefix}${sessionId}/${name}`;
    let names = chatMarksBySession.get(sessionId);
    if (!names) {
        names = ( new Set());
        chatMarksBySession.set(sessionId, names);
    }
    names.add(fullName);
    mark(fullName);
}
function clearChatMarks(sessionResource) {
    const sessionId = chatSessionResourceToId(sessionResource);
    const names = chatMarksBySession.get(sessionId);
    if (names) {
        for (const name of names) {
            clearMarks(name);
        }
        chatMarksBySession.delete(sessionId);
    }
}
const ChatGlobalPerfMark = {
    WillWaitForActivation: "willWaitForActivation",
    DidWaitForActivation: "didWaitForActivation"
};
function markChatGlobal(name) {
    mark(`${chatPerfPrefix}${name}`);
}

export { ChatGlobalPerfMark, ChatPerfMark, clearChatMarks, markChat, markChatGlobal };
