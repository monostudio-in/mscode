
import { VSBuffer } from '../../../base/common/buffer.js';
import { Emitter } from '../../../base/common/event.js';
import { isMessageOfType, MessageType, createMessageOfType } from '../../services/extensions/common/extensionHostProtocol.js';
import { ExtensionHostMain } from '../common/extensionHostMain.js';
import { NestedWorker } from '../../services/extensions/worker/polyfillNestedWorker.js';
import { basename } from '../../../base/common/path.js';
import { mark } from '../../../base/common/performance.js';
import '../common/extHost.common.services.js';
import './extHost.worker.services.js';
import { URI } from '../../../base/common/uri.js';

const nativeClose = self.close.bind(self);
self.close = () => console.trace(`'close' has been blocked`);
const nativePostMessage = postMessage.bind(self);
self.postMessage = () => console.trace(`'postMessage' has been blocked`);
function shouldTransformUri(uri) {
    return /^(file|extension-file|vscode-remote):/i.test(uri);
}
const nativeFetch = fetch.bind(self);
function patchFetching(asBrowserUri) {
    self.fetch = async function(input, init) {
        if (input instanceof Request) {
            return nativeFetch(input, init);
        }
        if (shouldTransformUri(String(input))) {
            input = ( (await ( asBrowserUri(( URI.parse(String(input)))))).toString(true));
        }
        return nativeFetch(input, init);
    };
    self.XMLHttpRequest = class extends XMLHttpRequest {
        open(method, url, async, username, password) {
            (async () => {
                if (shouldTransformUri(( url.toString()))) {
                    url = ( (await ( asBrowserUri(( URI.parse(( url.toString())))))).toString(true));
                }
                super.open(method, url, async ?? true, username, password);
            })();
        }
    };
}
self.importScripts = () => {
    throw ( new Error(`'importScripts' has been blocked`));
};
self.addEventListener = () => console.trace(`'addEventListener' has been blocked`);
self["AMDLoader"] = undefined;
self["NLSLoaderPlugin"] = undefined;
self["define"] = undefined;
self["require"] = undefined;
self["webkitRequestFileSystem"] = undefined;
self["webkitRequestFileSystemSync"] = undefined;
self["webkitResolveLocalFileSystemSyncURL"] = undefined;
self["webkitResolveLocalFileSystemURL"] = undefined;
function patchWorker(asBrowserUri, getAllStaticBrowserUris) {
    if (self.Worker) {
        const _Worker = self.Worker;
        Worker = function(stringUrl, options) {
            if (/^vscode-remote:/i.test(( stringUrl.toString()))) {
                throw ( new Error(`Creating workers from remote extensions is currently not supported.`));
            }
            async function getWorkerUri(workerUri) {
                const [browserUrl, staticBrowserUrls] = await Promise.all([( asBrowserUri(workerUri)).then(uri => ( uri.toString(true))), getAllStaticBrowserUris().then(bindings => Object.fromEntries(( bindings.map(([from, to]) => [( from.toString(true)), ( to.toString(true))]))))]);
                const bootstrapFnSource = ( (function bootstrapFn(workerUrl, staticBrowserUrls) {
                    function asWorkerBrowserUrl(url) {
                        if (typeof url === "string" || url instanceof URL) {
                            url = String(url).replace(/^file:\/\//i, "vscode-file://vscode-app");
                            return staticBrowserUrls[url] ?? url;
                        }
                        return url;
                    }
                    const nativeFetch = fetch.bind(self);
                    self.fetch = function(input, init) {
                        if (input instanceof Request) {
                            return nativeFetch(input, init);
                        }
                        return nativeFetch(asWorkerBrowserUrl(input), init);
                    };
                    self.XMLHttpRequest = class extends XMLHttpRequest {
                        constructor() {
                            super(...arguments);
                            this.notFound = false;
                        }
                        open(method, url, async, username, password) {
                            const transformedUrl = asWorkerBrowserUrl(url);
                            this.notFound = transformedUrl.startsWith("extension-file:");
                            return super.open(method, transformedUrl, async ?? true, username, password);
                        }
                        send(body) {
                            if (this.notFound) {
                                return;
                            }
                            super.send(body);
                        }
                        get status() {
                            return this.notFound ? 404 : super.status;
                        }
                    };
                    const nativeImportScripts = importScripts.bind(self);
                    self.importScripts = (...urls) => {
                        nativeImportScripts(...( urls.map(asWorkerBrowserUrl)));
                    };
                    self.importExt = url => {
                        return ( new Function("url", "return import(url)"))(asWorkerBrowserUrl(url));
                    };
                    nativeImportScripts(workerUrl);
                }).toString());
                const js = `(${bootstrapFnSource}('${browserUrl}', ${JSON.stringify(staticBrowserUrls)}))`;
                const blob = ( new Blob([js], {
                    type: "application/javascript"
                }));
                return URL.createObjectURL(blob);
            }
            options = options || {};
            options.name = `${name} -> ${options.name || basename(( stringUrl.toString()))}`;
            class ExtensionWorker {
                constructor(scriptURL, options) {
                    this._onmessage = null;
                    this._onmessageerror = null;
                    this._onerror = null;
                    this.workerPromise = getWorkerUri(( URI.parse(scriptURL instanceof URL ? ( scriptURL.toString()) : scriptURL))).then(url => {
                        return ( new _Worker(url, options));
                    });
                }
                set onmessage(cb) {
                    this._onmessage = cb;
                    this.workerPromise.then(worker => {
                        worker.onmessage = cb;
                    }, console.error);
                }
                get onmessage() {
                    return this._onmessage;
                }
                set onmessageerror(cb) {
                    this._onmessageerror = cb;
                    this.workerPromise.then(worker => {
                        worker.onmessageerror = cb;
                    }, console.error);
                }
                get onmessageerror() {
                    return this._onmessageerror;
                }
                set onerror(cb) {
                    this._onerror = cb;
                    this.workerPromise.then(worker => {
                        worker.onerror = cb;
                    }, console.error);
                }
                get onerror() {
                    return this._onerror;
                }
                postMessage(message, options) {
                    this.workerPromise.then(worker => {
                        worker.postMessage(message, options);
                    }, console.error);
                }
                terminate() {
                    this.workerPromise.then(worker => {
                        worker.terminate();
                    }, console.error);
                }
                addEventListener(type, listener, options) {
                    this.workerPromise.then(worker => {
                        worker.addEventListener(type, listener, options);
                    }, console.error);
                }
                removeEventListener(type, listener, options) {
                    this.workerPromise.then(worker => {
                        worker.removeEventListener(type, listener, options);
                    }, console.error);
                }
                dispatchEvent(event) {
                    this.workerPromise.then(worker => {
                        worker.dispatchEvent(event);
                    }, console.error);
                    return false;
                }
            }
            return ( new ExtensionWorker(stringUrl, options));
        };
    } else {
        self.Worker = class extends NestedWorker {
            constructor(stringOrUrl, options) {
                super(nativePostMessage, stringOrUrl, {
                    name: basename(( stringOrUrl.toString())),
                    ...options
                });
            }
        };
    }
}
const hostUtil = new (class {
    constructor() {
        this.pid = undefined;
    }
    exit(_code) {
        nativeClose();
    }
})();
class ExtensionWorker {
    constructor() {
        const channel = ( new MessageChannel());
        const emitter = ( new Emitter());
        let terminating = false;
        nativePostMessage(channel.port2, [channel.port2]);
        channel.port1.onmessage = event => {
            const {
                data
            } = event;
            if (!(data instanceof ArrayBuffer)) {
                console.warn("UNKNOWN data received", data);
                return;
            }
            const msg = VSBuffer.wrap(( new Uint8Array(data, 0, data.byteLength)));
            if (isMessageOfType(msg, MessageType.Terminate)) {
                terminating = true;
                onTerminate("received terminate message from renderer");
                return;
            }
            emitter.fire(msg);
        };
        this.protocol = {
            onMessage: emitter.event,
            send: vsbuf => {
                if (!terminating) {
                    const data = vsbuf.buffer.buffer.slice(vsbuf.buffer.byteOffset, vsbuf.buffer.byteOffset + vsbuf.buffer.byteLength);
                    channel.port1.postMessage(data, [data]);
                }
            }
        };
    }
}
function connectToRenderer(protocol) {
    return ( new Promise(resolve => {
        const once = protocol.onMessage(raw => {
            once.dispose();
            const initData = JSON.parse(( raw.toString()));
            protocol.send(createMessageOfType(MessageType.Initialized));
            resolve({
                protocol,
                initData
            });
        });
        protocol.send(createMessageOfType(MessageType.Ready));
    }));
}
let onTerminate = reason => nativeClose();
function isInitMessage(a) {
    return !!a && typeof a === "object" && a.type === "vscode.init" && a.data instanceof Map;
}
function create() {
    mark(`code/extHost/willConnectToRenderer`);
    const res = ( new ExtensionWorker());
    return {
        onmessage(message) {
            if (!isInitMessage(message)) {
                return;
            }
            connectToRenderer(res.protocol).then(data => {
                mark(`code/extHost/didWaitForInitData`);
                const extHostMain = ( new ExtensionHostMain(data.protocol, data.initData, hostUtil, null, message.data));
                patchFetching(uri => ( extHostMain.asBrowserUri(uri)));
                patchWorker(uri => ( extHostMain.asBrowserUri(uri)), () => extHostMain.getAllStaticBrowserUris());
                onTerminate = reason => extHostMain.terminate(reason);
            });
        }
    };
}

export { create };
