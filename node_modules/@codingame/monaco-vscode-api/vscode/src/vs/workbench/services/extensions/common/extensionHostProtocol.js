
import { VSBuffer } from '../../../../base/common/buffer.js';

var UIKind;
(function (UIKind) {
    UIKind[UIKind["Desktop"] = 1] = "Desktop";
    UIKind[UIKind["Web"] = 2] = "Web";
})(UIKind || (UIKind = {}));
var ExtensionHostExitCode;
(function (ExtensionHostExitCode) {
    ExtensionHostExitCode[ExtensionHostExitCode["VersionMismatch"] = 55] = "VersionMismatch";
    ExtensionHostExitCode[ExtensionHostExitCode["UnexpectedError"] = 81] = "UnexpectedError";
})(ExtensionHostExitCode || (ExtensionHostExitCode = {}));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Initialized"] = 0] = "Initialized";
    MessageType[MessageType["Ready"] = 1] = "Ready";
    MessageType[MessageType["Terminate"] = 2] = "Terminate";
})(MessageType || (MessageType = {}));
function createMessageOfType(type) {
    const result = VSBuffer.alloc(1);
    switch (type) {
        case MessageType.Initialized:
            result.writeUInt8(1, 0);
            break;
        case MessageType.Ready:
            result.writeUInt8(2, 0);
            break;
        case MessageType.Terminate:
            result.writeUInt8(3, 0);
            break;
    }
    return result;
}
function isMessageOfType(message, type) {
    if (message.byteLength !== 1) {
        return false;
    }
    switch (message.readUInt8(0)) {
        case 1: return type === MessageType.Initialized;
        case 2: return type === MessageType.Ready;
        case 3: return type === MessageType.Terminate;
        default: return false;
    }
}
var NativeLogMarkers;
(function (NativeLogMarkers) {
    NativeLogMarkers["Start"] = "START_NATIVE_LOG";
    NativeLogMarkers["End"] = "END_NATIVE_LOG";
})(NativeLogMarkers || (NativeLogMarkers = {}));

export { ExtensionHostExitCode, MessageType, NativeLogMarkers, UIKind, createMessageOfType, isMessageOfType };
