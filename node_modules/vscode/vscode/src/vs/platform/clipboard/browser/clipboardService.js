
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { isSafari, isWebkitWebView } from '../../../base/browser/browser.js';
import { onDidRegisterWindow, addDisposableListener, getActiveWindow, getActiveDocument, getActiveElement, $, isHTMLElement } from '../../../base/browser/dom.js';
import { mainWindow } from '../../../base/browser/window.js';
import { DeferredPromise } from '../../../base/common/async.js';
import { Event } from '../../../base/common/event.js';
import { hash } from '../../../base/common/hash.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ILayoutService } from '../../layout/browser/layoutService.service.js';
import { ILogService } from '../../log/common/log.service.js';

var BrowserClipboardService_1;
const vscodeResourcesMime = "application/vnd.code.resources";
let BrowserClipboardService = class BrowserClipboardService extends Disposable {
    static {
        BrowserClipboardService_1 = this;
    }
    constructor(layoutService, logService) {
        super();
        this.layoutService = layoutService;
        this.logService = logService;
        this.mapTextToType = ( new Map());
        this.findText = "";
        this.resources = [];
        this.resourcesStateHash = undefined;
        if (isSafari || isWebkitWebView) {
            this.installWebKitWriteTextWorkaround();
        }
        this._register(Event.runAndSubscribe(onDidRegisterWindow, (
            {
                window,
                disposables
            }
        ) => {
            disposables.add(
                addDisposableListener(window.document, "copy", () => this.clearResourcesState())
            );
        }, {
            window: mainWindow,
            disposables: this._store
        }));
    }
    triggerPaste() {
        this.logService.trace("BrowserClipboardService#triggerPaste");
        return undefined;
    }
    async readImage() {
        try {
            const clipboardItems = await mainWindow.navigator.clipboard.read();
            const clipboardItem = clipboardItems[0];
            const supportedImageTypes = ["image/png", "image/jpeg", "image/gif", "image/tiff", "image/bmp"];
            const mimeType = supportedImageTypes.find(type => clipboardItem.types.includes(type));
            if (mimeType) {
                const blob = await clipboardItem.getType(mimeType);
                const buffer = await blob.arrayBuffer();
                return ( new Uint8Array(buffer));
            } else {
                console.error("No supported image type found in the clipboard");
            }
        } catch (error) {
            console.error("Error reading image from clipboard:", error);
        }
        return ( new Uint8Array(0));
    }
    installWebKitWriteTextWorkaround() {
        const handler = () => {
            const currentWritePromise = ( new DeferredPromise());
            if (this.webKitPendingClipboardWritePromise && !this.webKitPendingClipboardWritePromise.isSettled) {
                this.webKitPendingClipboardWritePromise.cancel();
            }
            this.webKitPendingClipboardWritePromise = currentWritePromise;
            getActiveWindow().navigator.clipboard.write([( new ClipboardItem({
                "text/plain": currentWritePromise.p
            }))]).catch(async err => {
                if (!(err instanceof Error) || err.name !== "NotAllowedError" || !currentWritePromise.isRejected) {
                    this.logService.error(err);
                }
            });
        };
        this._register(Event.runAndSubscribe(this.layoutService.onDidAddContainer, (
            {
                container,
                disposables
            }
        ) => {
            disposables.add(addDisposableListener(container, "click", handler));
            disposables.add(addDisposableListener(container, "keydown", handler));
        }, {
            container: this.layoutService.mainContainer,
            disposables: this._store
        }));
    }
    async writeText(text, type) {
        this.logService.trace(
            "BrowserClipboardService#writeText called with type:",
            type,
            " text.length:",
            text.length
        );
        this.clearResourcesState();
        if (type) {
            this.mapTextToType.set(type, text);
            this.logService.trace("BrowserClipboardService#writeText");
            return;
        }
        if (this.webKitPendingClipboardWritePromise) {
            return this.webKitPendingClipboardWritePromise.complete(text);
        }
        try {
            this.logService.trace("before navigator.clipboard.writeText");
            return await getActiveWindow().navigator.clipboard.writeText(text);
        } catch (error) {
            console.error(error);
        }
        this.fallbackWriteText(text);
    }
    fallbackWriteText(text) {
        this.logService.trace("BrowserClipboardService#fallbackWriteText");
        const activeDocument = getActiveDocument();
        const activeElement = getActiveElement();
        const textArea = activeDocument.body.appendChild($("textarea", {
            "aria-hidden": true
        }));
        textArea.style.height = "1px";
        textArea.style.width = "1px";
        textArea.style.position = "absolute";
        textArea.value = text;
        textArea.focus();
        textArea.select();
        activeDocument.execCommand("copy");
        if (isHTMLElement(activeElement)) {
            activeElement.focus();
        }
        textArea.remove();
    }
    async readText(type) {
        this.logService.trace("BrowserClipboardService#readText called with type:", type);
        if (type) {
            const readText = this.mapTextToType.get(type) || "";
            this.logService.trace("BrowserClipboardService#readText text.length:", readText.length);
            return readText;
        }
        try {
            const readText = await getActiveWindow().navigator.clipboard.readText();
            this.logService.trace("BrowserClipboardService#readText text.length:", readText.length);
            return readText;
        } catch (error) {
            console.error(error);
        }
        return "";
    }
    async readFindText() {
        return this.findText;
    }
    async writeFindText(text) {
        this.findText = text;
    }
    static {
        this.MAX_RESOURCE_STATE_SOURCE_LENGTH = 1000;
    }
    async writeResources(resources) {
        try {
            await getActiveWindow().navigator.clipboard.write([( new ClipboardItem({
                [`web ${vscodeResourcesMime}`]: ( new Blob([JSON.stringify(( resources.map(x => x.toJSON())))], {
                    type: vscodeResourcesMime
                }))
            }))]);
        } catch (error) {}
        if (resources.length === 0) {
            this.clearResourcesState();
        } else {
            this.resources = resources;
            this.resourcesStateHash = await this.computeResourcesStateHash();
        }
    }
    async readResources() {
        try {
            const items = await getActiveWindow().navigator.clipboard.read();
            for (const item of items) {
                if (item.types.includes(`web ${vscodeResourcesMime}`)) {
                    const blob = await item.getType(`web ${vscodeResourcesMime}`);
                    const resources = ( JSON.parse(await blob.text()).map(x => ( URI.from(x))));
                    return resources;
                }
            }
        } catch (error) {}
        const resourcesStateHash = await this.computeResourcesStateHash();
        if (this.resourcesStateHash !== resourcesStateHash) {
            this.clearResourcesState();
        }
        return this.resources;
    }
    async computeResourcesStateHash() {
        if (this.resources.length === 0) {
            return undefined;
        }
        const clipboardText = await this.readText();
        return hash(
            clipboardText.substring(0, BrowserClipboardService_1.MAX_RESOURCE_STATE_SOURCE_LENGTH)
        );
    }
    async hasResources() {
        try {
            const items = await getActiveWindow().navigator.clipboard.read();
            for (const item of items) {
                if (item.types.includes(`web ${vscodeResourcesMime}`)) {
                    return true;
                }
            }
        } catch (error) {}
        return this.resources.length > 0;
    }
    clearInternalState() {
        this.clearResourcesState();
    }
    clearResourcesState() {
        this.resources = [];
        this.resourcesStateHash = undefined;
    }
};
BrowserClipboardService = BrowserClipboardService_1 = ( __decorate([( __param(0, ILayoutService)), ( __param(1, ILogService))], BrowserClipboardService));

export { BrowserClipboardService };
