
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationTokenSource, CancellationToken } from '../../../../base/common/cancellation.js';
import { CharCode } from '../../../../base/common/charCode.js';
import { canceled, transformErrorForSerialization } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { MarshalledId } from '../../../../base/common/marshallingIds.js';
import { transformIncomingURIs } from '../../../../base/common/uriIpc.js';
import { CanceledLazyPromise, LazyPromise } from './lazyPromise.js';
import { ProxyIdentifier, getStringIdentifierForProxy, SerializableObjectWithBuffers } from './proxyIdentifier.js';

var _a;
function safeStringify(obj, replacer) {
    try {
        return JSON.stringify(obj, replacer);
    } catch (err) {
        return "null";
    }
}
const refSymbolName = "$$ref$$";
const undefinedRef = {
    [refSymbolName]: -1
};
function stringifyJsonWithBufferRefs(obj, replacer = null, useSafeStringify = false) {
    const foundBuffers = [];
    const serialized = (useSafeStringify ? safeStringify : JSON.stringify)(obj, (key, value) => {
        if (typeof value === "undefined") {
            return undefinedRef;
        } else if (typeof value === "object") {
            if (value instanceof VSBuffer) {
                const bufferIndex = foundBuffers.push(value) - 1;
                return {
                    [refSymbolName]: bufferIndex
                };
            }
            if (replacer) {
                return replacer(key, value);
            }
        }
        return value;
    });
    return {
        jsonString: serialized,
        referencedBuffers: foundBuffers
    };
}
function parseJsonAndRestoreBufferRefs(jsonString, buffers, uriTransformer) {
    return JSON.parse(jsonString, (_key, value) => {
        if (value) {
            const ref = value[refSymbolName];
            if (typeof ref === "number") {
                return buffers[ref];
            }
            if (uriTransformer && value.$mid === MarshalledId.Uri) {
                return uriTransformer.transformIncoming(value);
            }
        }
        return value;
    });
}
function stringify(obj, replacer) {
    return JSON.stringify(obj, replacer);
}
function createURIReplacer(transformer) {
    if (!transformer) {
        return null;
    }
    return (key, value) => {
        if (value && value.$mid === MarshalledId.Uri) {
            return transformer.transformOutgoing(value);
        }
        return value;
    };
}
var RequestInitiator;
(function(RequestInitiator) {
    RequestInitiator[RequestInitiator["LocalSide"] = 0] = "LocalSide";
    RequestInitiator[RequestInitiator["OtherSide"] = 1] = "OtherSide";
})(RequestInitiator || (RequestInitiator = {}));
var ResponsiveState;
(function(ResponsiveState) {
    ResponsiveState[ResponsiveState["Responsive"] = 0] = "Responsive";
    ResponsiveState[ResponsiveState["Unresponsive"] = 1] = "Unresponsive";
})(ResponsiveState || (ResponsiveState = {}));
const noop = () => {};
const _RPCProtocolSymbol = Symbol.for("rpcProtocol");
const _RPCProxySymbol = Symbol.for("rpcProxy");
class RPCProtocol extends Disposable {
    static {
        _a = _RPCProtocolSymbol;
    }
    static {
        this.UNRESPONSIVE_TIME = 3 * 1000;
    }
    constructor(protocol, logger = null, transformer = null) {
        super();
        this[_a] = true;
        this._onDidChangeResponsiveState = this._register(( new Emitter()));
        this.onDidChangeResponsiveState = this._onDidChangeResponsiveState.event;
        this._protocol = protocol;
        this._logger = logger;
        this._uriTransformer = transformer;
        this._uriReplacer = createURIReplacer(this._uriTransformer);
        this._isDisposed = false;
        this._locals = [];
        this._proxies = [];
        for (let i = 0, len = ProxyIdentifier.count; i < len; i++) {
            this._locals[i] = null;
            this._proxies[i] = null;
        }
        this._lastMessageId = 0;
        this._cancelInvokedHandlers = Object.create(null);
        this._pendingRPCReplies = {};
        this._responsiveState = ResponsiveState.Responsive;
        this._unacknowledgedCount = 0;
        this._unresponsiveTime = 0;
        this._asyncCheckUresponsive = this._register(( new RunOnceScheduler(() => this._checkUnresponsive(), 1000)));
        this._register(this._protocol.onMessage(msg => this._receiveOneMessage(msg)));
    }
    dispose() {
        this._isDisposed = true;
        ( Object.keys(this._pendingRPCReplies)).forEach(msgId => {
            const pending = this._pendingRPCReplies[msgId];
            delete this._pendingRPCReplies[msgId];
            pending.resolveErr(canceled());
        });
        super.dispose();
    }
    drain() {
        if (typeof this._protocol.drain === "function") {
            return this._protocol.drain();
        }
        return Promise.resolve();
    }
    _onWillSendRequest(req) {
        if (this._unacknowledgedCount === 0) {
            this._unresponsiveTime = Date.now() + RPCProtocol.UNRESPONSIVE_TIME;
        }
        this._unacknowledgedCount++;
        if (!this._asyncCheckUresponsive.isScheduled()) {
            this._asyncCheckUresponsive.schedule();
        }
    }
    _onDidReceiveAcknowledge(req) {
        this._unresponsiveTime = Date.now() + RPCProtocol.UNRESPONSIVE_TIME;
        this._unacknowledgedCount--;
        if (this._unacknowledgedCount === 0) {
            this._asyncCheckUresponsive.cancel();
        }
        this._setResponsiveState(ResponsiveState.Responsive);
    }
    _checkUnresponsive() {
        if (this._unacknowledgedCount === 0) {
            return;
        }
        if (Date.now() > this._unresponsiveTime) {
            this._setResponsiveState(ResponsiveState.Unresponsive);
        } else {
            this._asyncCheckUresponsive.schedule();
        }
    }
    _setResponsiveState(newResponsiveState) {
        if (this._responsiveState === newResponsiveState) {
            return;
        }
        this._responsiveState = newResponsiveState;
        this._onDidChangeResponsiveState.fire(this._responsiveState);
    }
    get responsiveState() {
        return this._responsiveState;
    }
    transformIncomingURIs(obj) {
        if (!this._uriTransformer) {
            return obj;
        }
        return transformIncomingURIs(obj, this._uriTransformer);
    }
    getProxy(identifier) {
        const {
            nid: rpcId,
            sid
        } = identifier;
        if (!this._proxies[rpcId]) {
            this._proxies[rpcId] = this._createProxy(rpcId, sid);
        }
        return this._proxies[rpcId];
    }
    _createProxy(rpcId, debugName) {
        const handler = {
            get: (target, name) => {
                if (typeof name === "string" && !target[name] && name.charCodeAt(0) === CharCode.DollarSign) {
                    target[name] = (...myArgs) => {
                        return this._remoteCall(rpcId, name, myArgs);
                    };
                }
                if (name === _RPCProxySymbol) {
                    return debugName;
                }
                return target[name];
            }
        };
        return ( new Proxy(Object.create(null), handler));
    }
    set(identifier, value) {
        this._locals[identifier.nid] = value;
        return value;
    }
    assertRegistered(identifiers) {
        for (let i = 0, len = identifiers.length; i < len; i++) {
            const identifier = identifiers[i];
            if (!this._locals[identifier.nid]) {
                throw ( new Error(`Missing proxy instance ${identifier.sid}`));
            }
        }
    }
    _receiveOneMessage(rawmsg) {
        if (this._isDisposed) {
            return;
        }
        const msgLength = rawmsg.byteLength;
        const buff = MessageBuffer.read(rawmsg, 0);
        const messageType = buff.readUInt8();
        const req = buff.readUInt32();
        switch (messageType) {
        case MessageType.RequestJSONArgs:
        case MessageType.RequestJSONArgsWithCancellation:
            {
                let {
                    rpcId,
                    method,
                    args
                } = MessageIO.deserializeRequestJSONArgs(buff);
                if (this._uriTransformer) {
                    args = transformIncomingURIs(args, this._uriTransformer);
                }
                this._receiveRequest(
                    msgLength,
                    req,
                    rpcId,
                    method,
                    args,
                    (messageType === MessageType.RequestJSONArgsWithCancellation)
                );
                break;
            }
        case MessageType.RequestMixedArgs:
        case MessageType.RequestMixedArgsWithCancellation:
            {
                let {
                    rpcId,
                    method,
                    args
                } = MessageIO.deserializeRequestMixedArgs(buff);
                if (this._uriTransformer) {
                    args = transformIncomingURIs(args, this._uriTransformer);
                }
                this._receiveRequest(
                    msgLength,
                    req,
                    rpcId,
                    method,
                    args,
                    (messageType === MessageType.RequestMixedArgsWithCancellation)
                );
                break;
            }
        case MessageType.Acknowledged:
            {
                this._logger?.logIncoming(msgLength, req, RequestInitiator.LocalSide, `ack`);
                this._onDidReceiveAcknowledge(req);
                break;
            }
        case MessageType.Cancel:
            {
                this._receiveCancel(msgLength, req);
                break;
            }
        case MessageType.ReplyOKEmpty:
            {
                this._receiveReply(msgLength, req, undefined);
                break;
            }
        case MessageType.ReplyOKJSON:
            {
                let value = MessageIO.deserializeReplyOKJSON(buff);
                if (this._uriTransformer) {
                    value = transformIncomingURIs(value, this._uriTransformer);
                }
                this._receiveReply(msgLength, req, value);
                break;
            }
        case MessageType.ReplyOKJSONWithBuffers:
            {
                const value = MessageIO.deserializeReplyOKJSONWithBuffers(buff, this._uriTransformer);
                this._receiveReply(msgLength, req, value);
                break;
            }
        case MessageType.ReplyOKVSBuffer:
            {
                const value = MessageIO.deserializeReplyOKVSBuffer(buff);
                this._receiveReply(msgLength, req, value);
                break;
            }
        case MessageType.ReplyErrError:
            {
                let err = MessageIO.deserializeReplyErrError(buff);
                if (this._uriTransformer) {
                    err = transformIncomingURIs(err, this._uriTransformer);
                }
                this._receiveReplyErr(msgLength, req, err);
                break;
            }
        case MessageType.ReplyErrEmpty:
            {
                this._receiveReplyErr(msgLength, req, undefined);
                break;
            }
        default:
            console.error(`received unexpected message`);
            console.error(rawmsg);
        }
    }
    _receiveRequest(msgLength, req, rpcId, method, args, usesCancellationToken) {
        this._logger?.logIncoming(
            msgLength,
            req,
            RequestInitiator.OtherSide,
            `receiveRequest ${getStringIdentifierForProxy(rpcId)}.${method}(`,
            args
        );
        const callId = String(req);
        let promise;
        let cancel;
        if (usesCancellationToken) {
            const cancellationTokenSource = ( new CancellationTokenSource());
            args.push(cancellationTokenSource.token);
            promise = this._invokeHandler(rpcId, method, args);
            cancel = () => cancellationTokenSource.cancel();
        } else {
            promise = this._invokeHandler(rpcId, method, args);
            cancel = noop;
        }
        this._cancelInvokedHandlers[callId] = cancel;
        const msg = MessageIO.serializeAcknowledged(req);
        this._logger?.logOutgoing(msg.byteLength, req, RequestInitiator.OtherSide, `ack`);
        this._protocol.send(msg);
        promise.then(r => {
            delete this._cancelInvokedHandlers[callId];
            const msg = MessageIO.serializeReplyOK(req, r, this._uriReplacer);
            this._logger?.logOutgoing(msg.byteLength, req, RequestInitiator.OtherSide, `reply:`, r);
            this._protocol.send(msg);
        }, err => {
            delete this._cancelInvokedHandlers[callId];
            const msg = MessageIO.serializeReplyErr(req, err);
            this._logger?.logOutgoing(msg.byteLength, req, RequestInitiator.OtherSide, `replyErr:`, err);
            this._protocol.send(msg);
        });
    }
    _receiveCancel(msgLength, req) {
        this._logger?.logIncoming(msgLength, req, RequestInitiator.OtherSide, `receiveCancel`);
        const callId = String(req);
        this._cancelInvokedHandlers[callId]?.();
    }
    _receiveReply(msgLength, req, value) {
        this._logger?.logIncoming(msgLength, req, RequestInitiator.LocalSide, `receiveReply:`, value);
        const callId = String(req);
        if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
            return;
        }
        const pendingReply = this._pendingRPCReplies[callId];
        delete this._pendingRPCReplies[callId];
        pendingReply.resolveOk(value);
    }
    _receiveReplyErr(msgLength, req, value) {
        this._logger?.logIncoming(msgLength, req, RequestInitiator.LocalSide, `receiveReplyErr:`, value);
        const callId = String(req);
        if (!this._pendingRPCReplies.hasOwnProperty(callId)) {
            return;
        }
        const pendingReply = this._pendingRPCReplies[callId];
        delete this._pendingRPCReplies[callId];
        let err = undefined;
        if (value) {
            if (value.$isError) {
                err = ( new Error());
                err.name = value.name;
                err.message = value.message;
                err.stack = value.stack;
            } else {
                err = value;
            }
        }
        pendingReply.resolveErr(err);
    }
    _invokeHandler(rpcId, methodName, args) {
        try {
            return Promise.resolve(this._doInvokeHandler(rpcId, methodName, args));
        } catch (err) {
            return Promise.reject(err);
        }
    }
    _doInvokeHandler(rpcId, methodName, args) {
        const actor = this._locals[rpcId];
        if (!actor) {
            throw ( new Error("Unknown actor " + getStringIdentifierForProxy(rpcId)));
        }
        const method = actor[methodName];
        if (typeof method !== "function") {
            throw ( new Error(
                "Unknown method " + methodName + " on actor " + getStringIdentifierForProxy(rpcId)
            ));
        }
        return method.apply(actor, args);
    }
    _remoteCall(rpcId, methodName, args) {
        if (this._isDisposed) {
            return ( new CanceledLazyPromise());
        }
        let cancellationToken = null;
        if (args.length > 0 && CancellationToken.isCancellationToken(args[args.length - 1])) {
            cancellationToken = args.pop();
        }
        if (cancellationToken && cancellationToken.isCancellationRequested) {
            return Promise.reject(canceled());
        }
        const serializedRequestArguments = MessageIO.serializeRequestArguments(args, this._uriReplacer);
        const req = ++this._lastMessageId;
        const callId = String(req);
        const result = ( new LazyPromise());
        const disposable = ( new DisposableStore());
        if (cancellationToken) {
            disposable.add(cancellationToken.onCancellationRequested(() => {
                const msg = MessageIO.serializeCancel(req);
                this._logger?.logOutgoing(msg.byteLength, req, RequestInitiator.LocalSide, `cancel`);
                this._protocol.send(msg);
            }));
        }
        this._pendingRPCReplies[callId] = ( new PendingRPCReply(result, disposable));
        this._onWillSendRequest(req);
        const msg = MessageIO.serializeRequest(req, rpcId, methodName, serializedRequestArguments, !!cancellationToken);
        this._logger?.logOutgoing(
            msg.byteLength,
            req,
            RequestInitiator.LocalSide,
            `request: ${getStringIdentifierForProxy(rpcId)}.${methodName}(`,
            args
        );
        this._protocol.send(msg);
        return result;
    }
}
class PendingRPCReply {
    constructor(_promise, _disposable) {
        this._promise = _promise;
        this._disposable = _disposable;
    }
    resolveOk(value) {
        this._promise.resolveOk(value);
        this._disposable.dispose();
    }
    resolveErr(err) {
        this._promise.resolveErr(err);
        this._disposable.dispose();
    }
}
class MessageBuffer {
    static alloc(type, req, messageSize) {
        const result = ( new MessageBuffer(VSBuffer.alloc(messageSize + 1  + 4 ), 0));
        result.writeUInt8(type);
        result.writeUInt32(req);
        return result;
    }
    static read(buff, offset) {
        return ( new MessageBuffer(buff, offset));
    }
    get buffer() {
        return this._buff;
    }
    constructor(buff, offset) {
        this._buff = buff;
        this._offset = offset;
    }
    static sizeUInt8() {
        return 1;
    }
    static {
        this.sizeUInt32 = 4;
    }
    writeUInt8(n) {
        this._buff.writeUInt8(n, this._offset);
        this._offset += 1;
    }
    readUInt8() {
        const n = this._buff.readUInt8(this._offset);
        this._offset += 1;
        return n;
    }
    writeUInt32(n) {
        this._buff.writeUInt32BE(n, this._offset);
        this._offset += 4;
    }
    readUInt32() {
        const n = this._buff.readUInt32BE(this._offset);
        this._offset += 4;
        return n;
    }
    static sizeShortString(str) {
        return 1  + str.byteLength ;
    }
    writeShortString(str) {
        this._buff.writeUInt8(str.byteLength, this._offset);
        this._offset += 1;
        this._buff.set(str, this._offset);
        this._offset += str.byteLength;
    }
    readShortString() {
        const strByteLength = this._buff.readUInt8(this._offset);
        this._offset += 1;
        const strBuff = this._buff.slice(this._offset, this._offset + strByteLength);
        const str = ( strBuff.toString());
        this._offset += strByteLength;
        return str;
    }
    static sizeLongString(str) {
        return 4  + str.byteLength ;
    }
    writeLongString(str) {
        this._buff.writeUInt32BE(str.byteLength, this._offset);
        this._offset += 4;
        this._buff.set(str, this._offset);
        this._offset += str.byteLength;
    }
    readLongString() {
        const strByteLength = this._buff.readUInt32BE(this._offset);
        this._offset += 4;
        const strBuff = this._buff.slice(this._offset, this._offset + strByteLength);
        const str = ( strBuff.toString());
        this._offset += strByteLength;
        return str;
    }
    writeBuffer(buff) {
        this._buff.writeUInt32BE(buff.byteLength, this._offset);
        this._offset += 4;
        this._buff.set(buff, this._offset);
        this._offset += buff.byteLength;
    }
    static sizeVSBuffer(buff) {
        return 4  + buff.byteLength ;
    }
    writeVSBuffer(buff) {
        this._buff.writeUInt32BE(buff.byteLength, this._offset);
        this._offset += 4;
        this._buff.set(buff, this._offset);
        this._offset += buff.byteLength;
    }
    readVSBuffer() {
        const buffLength = this._buff.readUInt32BE(this._offset);
        this._offset += 4;
        const buff = this._buff.slice(this._offset, this._offset + buffLength);
        this._offset += buffLength;
        return buff;
    }
    static sizeMixedArray(arr) {
        let size = 0;
        size += 1;
        for (let i = 0, len = arr.length; i < len; i++) {
            const el = arr[i];
            size += 1;
            switch (el.type) {
            case ArgType.String:
                size += this.sizeLongString(el.value);
                break;
            case ArgType.VSBuffer:
                size += this.sizeVSBuffer(el.value);
                break;
            case ArgType.SerializedObjectWithBuffers:
                size += this.sizeUInt32;
                size += this.sizeLongString(el.value);
                for (let i = 0; i < el.buffers.length; ++i) {
                    size += this.sizeVSBuffer(el.buffers[i]);
                }
                break;
            }
        }
        return size;
    }
    writeMixedArray(arr) {
        this._buff.writeUInt8(arr.length, this._offset);
        this._offset += 1;
        for (let i = 0, len = arr.length; i < len; i++) {
            const el = arr[i];
            switch (el.type) {
            case ArgType.String:
                this.writeUInt8(ArgType.String);
                this.writeLongString(el.value);
                break;
            case ArgType.VSBuffer:
                this.writeUInt8(ArgType.VSBuffer);
                this.writeVSBuffer(el.value);
                break;
            case ArgType.SerializedObjectWithBuffers:
                this.writeUInt8(ArgType.SerializedObjectWithBuffers);
                this.writeUInt32(el.buffers.length);
                this.writeLongString(el.value);
                for (let i = 0; i < el.buffers.length; ++i) {
                    this.writeBuffer(el.buffers[i]);
                }
                break;
            case ArgType.Undefined:
                this.writeUInt8(ArgType.Undefined);
                break;
            }
        }
    }
    readMixedArray() {
        const arrLen = this._buff.readUInt8(this._offset);
        this._offset += 1;
        const arr = ( new Array(arrLen));
        for (let i = 0; i < arrLen; i++) {
            const argType = this.readUInt8();
            switch (argType) {
            case ArgType.String:
                arr[i] = this.readLongString();
                break;
            case ArgType.VSBuffer:
                arr[i] = this.readVSBuffer();
                break;
            case ArgType.SerializedObjectWithBuffers:
                {
                    const bufferCount = this.readUInt32();
                    const jsonString = this.readLongString();
                    const buffers = [];
                    for (let i = 0; i < bufferCount; ++i) {
                        buffers.push(this.readVSBuffer());
                    }
                    arr[i] = ( new SerializableObjectWithBuffers(parseJsonAndRestoreBufferRefs(jsonString, buffers, null)));
                    break;
                }
            case ArgType.Undefined:
                arr[i] = undefined;
                break;
            }
        }
        return arr;
    }
}
var SerializedRequestArgumentType;
(function(SerializedRequestArgumentType) {
    SerializedRequestArgumentType[SerializedRequestArgumentType["Simple"] = 0] = "Simple";
    SerializedRequestArgumentType[SerializedRequestArgumentType["Mixed"] = 1] = "Mixed";
})(SerializedRequestArgumentType || (SerializedRequestArgumentType = {}));
class MessageIO {
    static _useMixedArgSerialization(arr) {
        for (let i = 0, len = arr.length; i < len; i++) {
            if (arr[i] instanceof VSBuffer) {
                return true;
            }
            if (arr[i] instanceof SerializableObjectWithBuffers) {
                return true;
            }
            if (typeof arr[i] === "undefined") {
                return true;
            }
        }
        return false;
    }
    static serializeRequestArguments(args, replacer) {
        if (this._useMixedArgSerialization(args)) {
            const massagedArgs = [];
            for (let i = 0, len = args.length; i < len; i++) {
                const arg = args[i];
                if (arg instanceof VSBuffer) {
                    massagedArgs[i] = {
                        type: ArgType.VSBuffer,
                        value: arg
                    };
                } else if (typeof arg === "undefined") {
                    massagedArgs[i] = {
                        type: ArgType.Undefined
                    };
                } else if (arg instanceof SerializableObjectWithBuffers) {
                    const {
                        jsonString,
                        referencedBuffers
                    } = stringifyJsonWithBufferRefs(arg.value, replacer);
                    massagedArgs[i] = {
                        type: ArgType.SerializedObjectWithBuffers,
                        value: VSBuffer.fromString(jsonString),
                        buffers: referencedBuffers
                    };
                } else {
                    massagedArgs[i] = {
                        type: ArgType.String,
                        value: VSBuffer.fromString(stringify(arg, replacer))
                    };
                }
            }
            return {
                type: SerializedRequestArgumentType.Mixed,
                args: massagedArgs
            };
        }
        return {
            type: SerializedRequestArgumentType.Simple,
            args: stringify(args, replacer)
        };
    }
    static serializeRequest(req, rpcId, method, serializedArgs, usesCancellationToken) {
        switch (serializedArgs.type) {
        case SerializedRequestArgumentType.Simple:
            return this._requestJSONArgs(req, rpcId, method, serializedArgs.args, usesCancellationToken);
        case SerializedRequestArgumentType.Mixed:
            return this._requestMixedArgs(req, rpcId, method, serializedArgs.args, usesCancellationToken);
        }
    }
    static _requestJSONArgs(req, rpcId, method, args, usesCancellationToken) {
        const methodBuff = VSBuffer.fromString(method);
        const argsBuff = VSBuffer.fromString(args);
        let len = 0;
        len += MessageBuffer.sizeUInt8();
        len += MessageBuffer.sizeShortString(methodBuff);
        len += MessageBuffer.sizeLongString(argsBuff);
        const result = MessageBuffer.alloc(
            usesCancellationToken ? MessageType.RequestJSONArgsWithCancellation : MessageType.RequestJSONArgs,
            req,
            len
        );
        result.writeUInt8(rpcId);
        result.writeShortString(methodBuff);
        result.writeLongString(argsBuff);
        return result.buffer;
    }
    static deserializeRequestJSONArgs(buff) {
        const rpcId = buff.readUInt8();
        const method = buff.readShortString();
        const args = buff.readLongString();
        return {
            rpcId: rpcId,
            method: method,
            args: JSON.parse(args)
        };
    }
    static _requestMixedArgs(req, rpcId, method, args, usesCancellationToken) {
        const methodBuff = VSBuffer.fromString(method);
        let len = 0;
        len += MessageBuffer.sizeUInt8();
        len += MessageBuffer.sizeShortString(methodBuff);
        len += MessageBuffer.sizeMixedArray(args);
        const result = MessageBuffer.alloc(
            usesCancellationToken ? MessageType.RequestMixedArgsWithCancellation : MessageType.RequestMixedArgs,
            req,
            len
        );
        result.writeUInt8(rpcId);
        result.writeShortString(methodBuff);
        result.writeMixedArray(args);
        return result.buffer;
    }
    static deserializeRequestMixedArgs(buff) {
        const rpcId = buff.readUInt8();
        const method = buff.readShortString();
        const rawargs = buff.readMixedArray();
        const args = ( new Array(rawargs.length));
        for (let i = 0, len = rawargs.length; i < len; i++) {
            const rawarg = rawargs[i];
            if (typeof rawarg === "string") {
                args[i] = JSON.parse(rawarg);
            } else {
                args[i] = rawarg;
            }
        }
        return {
            rpcId: rpcId,
            method: method,
            args: args
        };
    }
    static serializeAcknowledged(req) {
        return MessageBuffer.alloc(MessageType.Acknowledged, req, 0).buffer;
    }
    static serializeCancel(req) {
        return MessageBuffer.alloc(MessageType.Cancel, req, 0).buffer;
    }
    static serializeReplyOK(req, res, replacer) {
        if (typeof res === "undefined") {
            return this._serializeReplyOKEmpty(req);
        } else if (res instanceof VSBuffer) {
            return this._serializeReplyOKVSBuffer(req, res);
        } else if (res instanceof SerializableObjectWithBuffers) {
            const {
                jsonString,
                referencedBuffers
            } = stringifyJsonWithBufferRefs(res.value, replacer, true);
            return this._serializeReplyOKJSONWithBuffers(req, jsonString, referencedBuffers);
        } else {
            return this._serializeReplyOKJSON(req, safeStringify(res, replacer));
        }
    }
    static _serializeReplyOKEmpty(req) {
        return MessageBuffer.alloc(MessageType.ReplyOKEmpty, req, 0).buffer;
    }
    static _serializeReplyOKVSBuffer(req, res) {
        let len = 0;
        len += MessageBuffer.sizeVSBuffer(res);
        const result = MessageBuffer.alloc(MessageType.ReplyOKVSBuffer, req, len);
        result.writeVSBuffer(res);
        return result.buffer;
    }
    static deserializeReplyOKVSBuffer(buff) {
        return buff.readVSBuffer();
    }
    static _serializeReplyOKJSON(req, res) {
        const resBuff = VSBuffer.fromString(res);
        let len = 0;
        len += MessageBuffer.sizeLongString(resBuff);
        const result = MessageBuffer.alloc(MessageType.ReplyOKJSON, req, len);
        result.writeLongString(resBuff);
        return result.buffer;
    }
    static _serializeReplyOKJSONWithBuffers(req, res, buffers) {
        const resBuff = VSBuffer.fromString(res);
        let len = 0;
        len += MessageBuffer.sizeUInt32;
        len += MessageBuffer.sizeLongString(resBuff);
        for (const buffer of buffers) {
            len += MessageBuffer.sizeVSBuffer(buffer);
        }
        const result = MessageBuffer.alloc(MessageType.ReplyOKJSONWithBuffers, req, len);
        result.writeUInt32(buffers.length);
        result.writeLongString(resBuff);
        for (const buffer of buffers) {
            result.writeBuffer(buffer);
        }
        return result.buffer;
    }
    static deserializeReplyOKJSON(buff) {
        const res = buff.readLongString();
        return JSON.parse(res);
    }
    static deserializeReplyOKJSONWithBuffers(buff, uriTransformer) {
        const bufferCount = buff.readUInt32();
        const res = buff.readLongString();
        const buffers = [];
        for (let i = 0; i < bufferCount; ++i) {
            buffers.push(buff.readVSBuffer());
        }
        return ( new SerializableObjectWithBuffers(parseJsonAndRestoreBufferRefs(res, buffers, uriTransformer)));
    }
    static serializeReplyErr(req, err) {
        const errStr = (err ? safeStringify(transformErrorForSerialization(err), null) : undefined);
        if (typeof errStr !== "string") {
            return this._serializeReplyErrEmpty(req);
        }
        const errBuff = VSBuffer.fromString(errStr);
        let len = 0;
        len += MessageBuffer.sizeLongString(errBuff);
        const result = MessageBuffer.alloc(MessageType.ReplyErrError, req, len);
        result.writeLongString(errBuff);
        return result.buffer;
    }
    static deserializeReplyErrError(buff) {
        const err = buff.readLongString();
        return JSON.parse(err);
    }
    static _serializeReplyErrEmpty(req) {
        return MessageBuffer.alloc(MessageType.ReplyErrEmpty, req, 0).buffer;
    }
}
var MessageType;
(function(MessageType) {
    MessageType[MessageType["RequestJSONArgs"] = 1] = "RequestJSONArgs";
    MessageType[MessageType["RequestJSONArgsWithCancellation"] = 2] = "RequestJSONArgsWithCancellation";
    MessageType[MessageType["RequestMixedArgs"] = 3] = "RequestMixedArgs";
    MessageType[MessageType["RequestMixedArgsWithCancellation"] = 4] = "RequestMixedArgsWithCancellation";
    MessageType[MessageType["Acknowledged"] = 5] = "Acknowledged";
    MessageType[MessageType["Cancel"] = 6] = "Cancel";
    MessageType[MessageType["ReplyOKEmpty"] = 7] = "ReplyOKEmpty";
    MessageType[MessageType["ReplyOKVSBuffer"] = 8] = "ReplyOKVSBuffer";
    MessageType[MessageType["ReplyOKJSON"] = 9] = "ReplyOKJSON";
    MessageType[MessageType["ReplyOKJSONWithBuffers"] = 10] = "ReplyOKJSONWithBuffers";
    MessageType[MessageType["ReplyErrError"] = 11] = "ReplyErrError";
    MessageType[MessageType["ReplyErrEmpty"] = 12] = "ReplyErrEmpty";
})(MessageType || (MessageType = {}));
var ArgType;
(function(ArgType) {
    ArgType[ArgType["String"] = 1] = "String";
    ArgType[ArgType["VSBuffer"] = 2] = "VSBuffer";
    ArgType[ArgType["SerializedObjectWithBuffers"] = 3] = "SerializedObjectWithBuffers";
    ArgType[ArgType["Undefined"] = 4] = "Undefined";
})(ArgType || (ArgType = {}));

export { RPCProtocol, RequestInitiator, ResponsiveState, parseJsonAndRestoreBufferRefs, stringifyJsonWithBufferRefs };
