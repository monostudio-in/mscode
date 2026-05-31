
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { Codicon } from '../../../base/common/codicons.js';
import { MainContext } from './extHost.protocol.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { ThemeIcon } from './extHostTypes.js';
import { ViewColumn } from './extHostTypeConverters.js';

class ExtHostBrowserTab {
    constructor(id, _proxy, _sessions, data) {
        this.id = id;
        this._proxy = _proxy;
        this._sessions = _sessions;
        this._url = data.url;
        this._title = data.title;
        this._favicon = data.favicon;
        const that = this;
        this.value = {
            get url() {
                return that._url;
            },
            get title() {
                return that._title;
            },
            get icon() {
                return that._favicon ? ( URI.parse(that._favicon)) : new ThemeIcon(Codicon.globe.id);
            },
            startCDPSession() {
                return that._startCDPSession();
            },
            close() {
                return that._close();
            }
        };
    }
    update(data) {
        let changed = false;
        if (data.url !== this._url) {
            this._url = data.url;
            changed = true;
        }
        if (data.title !== this._title) {
            this._title = data.title;
            changed = true;
        }
        if (data.favicon !== this._favicon) {
            this._favicon = data.favicon;
            changed = true;
        }
        return changed;
    }
    async _startCDPSession() {
        const sessionId = generateUuid();
        await this._proxy.$startCDPSession(sessionId, this.id);
        const session = ( new ExtHostBrowserCDPSession(sessionId, this._proxy));
        this._sessions.set(sessionId, session);
        return session.value;
    }
    async _close() {
        await this._proxy.$closeBrowserTab(this.id);
    }
}
class ExtHostBrowserCDPSession {
    constructor(id, _proxy) {
        this.id = id;
        this._proxy = _proxy;
        this._onDidReceiveMessage = ( new Emitter());
        this._onDidClose = ( new Emitter());
        this._closed = false;
        const that = this;
        this.value = {
            get onDidReceiveMessage() {
                return that._onDidReceiveMessage.event;
            },
            get onDidClose() {
                return that._onDidClose.event;
            },
            sendMessage(message) {
                return that._sendMessage(message);
            },
            close() {
                return that._close();
            }
        };
    }
    dispose() {
        this._onDidReceiveMessage.dispose();
        this._onDidClose.dispose();
    }
    async _sendMessage(message) {
        if (this._closed) {
            throw ( new Error("Session is closed"));
        }
        if (!message || typeof message !== "object") {
            throw ( new Error("Message must be an object"));
        }
        if (typeof message.id !== "number") {
            throw ( new Error("Message must have a numeric id"));
        }
        if (typeof message.method !== "string") {
            throw ( new Error("Message must have a method string"));
        }
        if (message.params !== undefined && typeof message.params !== "object") {
            throw ( new Error("Message params must be an object"));
        }
        if (message.sessionId !== undefined && typeof message.sessionId !== "string") {
            throw ( new Error("Message sessionId must be a string"));
        }
        await this._proxy.$sendCDPMessage(this.id, {
            id: message.id,
            method: message.method,
            params: message.params,
            sessionId: message.sessionId
        });
    }
    async _close() {
        this._closed = true;
        await this._proxy.$closeCDPSession(this.id);
    }
    _acceptMessage(message) {
        this._onDidReceiveMessage.fire(message);
    }
    _acceptClosed() {
        this._closed = true;
        this._onDidClose.fire();
    }
}
class ExtHostBrowsers extends Disposable {
    constructor(mainContext) {
        super();
        this._browserTabs = ( new Map());
        this._sessions = this._register(( new DisposableMap()));
        this._onDidOpenBrowserTab = this._register(( new Emitter()));
        this.onDidOpenBrowserTab = this._onDidOpenBrowserTab.event;
        this._onDidCloseBrowserTab = this._register(( new Emitter()));
        this.onDidCloseBrowserTab = this._onDidCloseBrowserTab.event;
        this._onDidChangeActiveBrowserTab = this._register(( new Emitter()));
        this.onDidChangeActiveBrowserTab = this._onDidChangeActiveBrowserTab.event;
        this._onDidChangeBrowserTabState = this._register(( new Emitter()));
        this.onDidChangeBrowserTabState = this._onDidChangeBrowserTabState.event;
        this._proxy = ( mainContext.getProxy(MainContext.MainThreadBrowsers));
    }
    get browserTabs() {
        return ( [...( this._browserTabs.values())].map(t => t.value));
    }
    get activeBrowserTab() {
        if (this._activeBrowserTabId) {
            return this._browserTabs.get(this._activeBrowserTabId)?.value;
        }
        return undefined;
    }
    async openBrowserTab(url, options) {
        const viewColumn = ViewColumn.from(options?.viewColumn);
        const dto = await this._proxy.$openBrowserTab(url, viewColumn, {
            preserveFocus: options?.preserveFocus,
            inactive: options?.background
        });
        return this._getOrCreateTab(dto).value;
    }
    _getOrCreateTab(dto) {
        let tab = this._browserTabs.get(dto.id);
        if (!tab) {
            tab = ( new ExtHostBrowserTab(dto.id, this._proxy, this._sessions, dto));
            this._browserTabs.set(dto.id, tab);
            this._onDidOpenBrowserTab.fire(tab.value);
        } else {
            tab.update(dto);
        }
        return tab;
    }
    $onDidOpenBrowserTab(dto) {
        this._getOrCreateTab(dto);
    }
    $onDidCloseBrowserTab(browserId) {
        const tab = this._browserTabs.get(browserId);
        if (tab) {
            this._browserTabs.delete(browserId);
            if (this._activeBrowserTabId === browserId) {
                this._activeBrowserTabId = undefined;
            }
            this._onDidCloseBrowserTab.fire(tab.value);
        }
    }
    $onDidChangeActiveBrowserTab(browserId) {
        this._activeBrowserTabId = browserId;
        this._onDidChangeActiveBrowserTab.fire(this.activeBrowserTab);
    }
    $onDidChangeBrowserTabState(data) {
        const tab = this._browserTabs.get(data.id);
        if (tab && tab.update(data)) {
            this._onDidChangeBrowserTabState.fire(tab.value);
        }
    }
    $onCDPSessionMessage(sessionId, message) {
        const session = this._sessions.get(sessionId);
        if (session) {
            session._acceptMessage(message);
        }
    }
    $onCDPSessionClosed(sessionId) {
        const session = this._sessions.get(sessionId);
        if (session) {
            session._acceptClosed();
            this._sessions.deleteAndDispose(sessionId);
        }
    }
}

export { ExtHostBrowsers };
