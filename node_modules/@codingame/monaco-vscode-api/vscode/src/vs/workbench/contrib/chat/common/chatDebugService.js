

var ChatDebugLogLevel;
(function (ChatDebugLogLevel) {
    ChatDebugLogLevel[ChatDebugLogLevel["Trace"] = 0] = "Trace";
    ChatDebugLogLevel[ChatDebugLogLevel["Info"] = 1] = "Info";
    ChatDebugLogLevel[ChatDebugLogLevel["Warning"] = 2] = "Warning";
    ChatDebugLogLevel[ChatDebugLogLevel["Error"] = 3] = "Error";
})(ChatDebugLogLevel || (ChatDebugLogLevel = {}));
var ChatDebugHookResult;
(function (ChatDebugHookResult) {
    ChatDebugHookResult[ChatDebugHookResult["Success"] = 0] = "Success";
    ChatDebugHookResult[ChatDebugHookResult["Error"] = 1] = "Error";
    ChatDebugHookResult[ChatDebugHookResult["NonBlockingError"] = 2] = "NonBlockingError";
})(ChatDebugHookResult || (ChatDebugHookResult = {}));

export { ChatDebugHookResult, ChatDebugLogLevel };
