
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { Emitter } from '../../../base/common/event.js';
import { Schemas } from '../../../base/common/network.js';
import { isFalsyOrWhitespace } from '../../../base/common/strings.js';
import { URI } from '../../../base/common/uri.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { decodeBase64 } from '../../../base/common/buffer.js';

var ExtHostWindow_1;
let ExtHostWindow = class ExtHostWindow {
    static {
        ExtHostWindow_1 = this;
    }
    static {
        this.InitialState = {
            focused: true,
            active: true
        };
    }
    getState() {
        const state = this._state;
        return {
            get focused() {
                return state.focused;
            },
            get active() {
                return state.active;
            }
        };
    }
    constructor(initData, extHostRpc) {
        this._onDidChangeWindowState = ( new Emitter());
        this.onDidChangeWindowState = this._onDidChangeWindowState.event;
        this._state = ExtHostWindow_1.InitialState;
        if (initData.handle) {
            this._nativeHandle = decodeBase64(initData.handle).buffer;
        }
        this._proxy = ( extHostRpc.getProxy(MainContext.MainThreadWindow));
        this._proxy.$getInitialState().then((
            {
                isFocused,
                isActive
            }
        ) => {
            this.onDidChangeWindowProperty("focused", isFocused);
            this.onDidChangeWindowProperty("active", isActive);
        });
    }
    get nativeHandle() {
        return this._nativeHandle;
    }
    $onDidChangeActiveNativeWindowHandle(handle) {
        this._nativeHandle = handle ? decodeBase64(handle).buffer : undefined;
    }
    $onDidChangeWindowFocus(value) {
        this.onDidChangeWindowProperty("focused", value);
    }
    $onDidChangeWindowActive(value) {
        this.onDidChangeWindowProperty("active", value);
    }
    onDidChangeWindowProperty(property, value) {
        if (value === this._state[property]) {
            return;
        }
        this._state = {
            ...this._state,
            [property]: value
        };
        this._onDidChangeWindowState.fire(this._state);
    }
    openUri(stringOrUri, options) {
        let uriAsString;
        if (typeof stringOrUri === "string") {
            uriAsString = stringOrUri;
            try {
                stringOrUri = ( URI.parse(stringOrUri));
            } catch (e) {
                return Promise.reject(`Invalid uri - '${stringOrUri}'`);
            }
        }
        if (isFalsyOrWhitespace(stringOrUri.scheme)) {
            return Promise.reject("Invalid scheme - cannot be empty");
        } else if (stringOrUri.scheme === Schemas.command) {
            return Promise.reject(`Invalid scheme '${stringOrUri.scheme}'`);
        }
        return this._proxy.$openUri(stringOrUri, uriAsString, options);
    }
    async asExternalUri(uri, options) {
        if (isFalsyOrWhitespace(uri.scheme)) {
            return Promise.reject("Invalid scheme - cannot be empty");
        }
        const result = await this._proxy.$asExternalUri(uri, options);
        return ( URI.from(result));
    }
};
ExtHostWindow = ExtHostWindow_1 = ( __decorate([( __param(0, IExtHostInitDataService)), ( __param(1, IExtHostRpcService))], ExtHostWindow));
const IExtHostWindow = ( createDecorator("IExtHostWindow"));

export { ExtHostWindow, IExtHostWindow };
