
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { safeStringify } from '../../../base/common/objects.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';

let AbstractExtHostConsoleForwarder = class AbstractExtHostConsoleForwarder {
    constructor(extHostRpc, initData) {
        this._mainThreadConsole = ( extHostRpc.getProxy(MainContext.MainThreadConsole));
        this._includeStack = initData.consoleForward.includeStack;
        this._logNative = initData.consoleForward.logNative;
        this._wrapConsoleMethod("info", "log");
        this._wrapConsoleMethod("log", "log");
        this._wrapConsoleMethod("warn", "warn");
        this._wrapConsoleMethod("debug", "debug");
        this._wrapConsoleMethod("error", "error");
    }
    _wrapConsoleMethod(method, severity) {
        const that = this;
        const original = console[method];
        Object.defineProperty(console, method, {
            set: () => {},
            get: () => (...args) => {
                that._handleConsoleCall(method, severity, original, args);
            }
        });
    }
    _handleConsoleCall(method, severity, original, args) {
        this._mainThreadConsole.$logExtensionHostMessage({
            type: "__$console",
            severity,
            arguments: safeStringifyArgumentsToArray(args, this._includeStack)
        });
        if (this._logNative) {
            this._nativeConsoleLogMessage(method, original, args);
        }
    }
};
AbstractExtHostConsoleForwarder = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, IExtHostInitDataService))], AbstractExtHostConsoleForwarder));
const MAX_LENGTH = 100000;
function safeStringifyArgumentsToArray(args, includeStack) {
    const argsArray = [];
    if (args.length) {
        for (let i = 0; i < args.length; i++) {
            let arg = args[i];
            if (typeof arg === "undefined") {
                arg = "undefined";
            }
            else if (arg instanceof Error) {
                const errorObj = arg;
                if (errorObj.stack) {
                    arg = errorObj.stack;
                } else {
                    arg = ( errorObj.toString());
                }
            }
            argsArray.push(arg);
        }
    }
    if (includeStack) {
        const stack = ( new Error()).stack;
        if (stack) {
            argsArray.push({
                __$stack: stack.split("\n").slice(3).join("\n")
            });
        }
    }
    try {
        const res = safeStringify(argsArray);
        if (res.length > MAX_LENGTH) {
            return "Output omitted for a large object that exceeds the limits";
        }
        return res;
    } catch (error) {
        return `Output omitted for an object that cannot be inspected ('${( error.toString())}')`;
    }
}

export { AbstractExtHostConsoleForwarder };
