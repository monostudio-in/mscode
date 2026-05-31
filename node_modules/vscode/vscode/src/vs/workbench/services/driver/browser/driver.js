
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { getTopLeftOffset, isHTMLDivElement, isHTMLTextAreaElement, getClientArea } from '../../../../base/browser/dom.js';
import { mainWindow } from '../../../../base/browser/window.js';
import { coalesce } from '../../../../base/common/arrays.js';
import { locale, language } from '../../../../base/common/platform.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.service.js';
import { IFileService } from '../../../../platform/files/common/files.service.js';
import localizedStrings from '../../../../platform/languagePacks/common/localizedStrings.js';
import { getLogs } from '../../../../platform/log/browser/log.js';
import { ILogService } from '../../../../platform/log/common/log.service.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../common/contributions.js';
import { LifecyclePhase } from '../../lifecycle/common/lifecycle.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.service.js';

let BrowserWindowDriver = class BrowserWindowDriver {
    constructor(fileService, environmentService, lifecycleService, logService) {
        this.fileService = fileService;
        this.environmentService = environmentService;
        this.lifecycleService = lifecycleService;
        this.logService = logService;
    }
    async getLogs() {
        return getLogs(this.fileService, this.environmentService);
    }
    async whenWorkbenchRestored() {
        this.logService.info("[driver] Waiting for restored lifecycle phase...");
        await this.lifecycleService.when(LifecyclePhase.Restored);
        this.logService.info("[driver] Restored lifecycle phase reached. Waiting for contributions...");
        await ( Registry.as(Extensions.Workbench)).whenRestored;
        this.logService.info("[driver] Workbench contributions created.");
    }
    async setValue(selector, text) {
        const element = mainWindow.document.querySelector(selector);
        if (!element) {
            return Promise.reject(( new Error(`Element not found: ${selector}`)));
        }
        const inputElement = element;
        inputElement.value = text;
        const event = ( new Event("input", {
            bubbles: true,
            cancelable: true
        }));
        inputElement.dispatchEvent(event);
    }
    async isActiveElement(selector) {
        const element = mainWindow.document.querySelector(selector);
        if (element !== mainWindow.document.activeElement) {
            const chain = [];
            let el = mainWindow.document.activeElement;
            while (el) {
                const tagName = el.tagName;
                const id = el.id ? `#${el.id}` : "";
                const classes = ( coalesce(( el.className.split(/\s+/g).map(c => c.trim()))).map(c => `.${c}`)).join("");
                chain.unshift(`${tagName}${id}${classes}`);
                el = el.parentElement;
            }
            throw ( new Error(
                `Active element not found. Current active element is '${chain.join(" > ")}'. Looking for ${selector}`
            ));
        }
        return true;
    }
    async getElements(selector, recursive) {
        const query = mainWindow.document.querySelectorAll(selector);
        const result = [];
        for (let i = 0; i < query.length; i++) {
            const element = query.item(i);
            result.push(this.serializeElement(element, recursive));
        }
        return result;
    }
    serializeElement(element, recursive) {
        const attributes = Object.create(null);
        for (let j = 0; j < element.attributes.length; j++) {
            const attr = element.attributes.item(j);
            if (attr) {
                attributes[attr.name] = attr.value;
            }
        }
        const children = [];
        if (recursive) {
            for (let i = 0; i < element.children.length; i++) {
                const child = element.children.item(i);
                if (child) {
                    children.push(this.serializeElement(child, true));
                }
            }
        }
        const {
            left,
            top
        } = getTopLeftOffset(element);
        return {
            tagName: element.tagName,
            className: element.className,
            textContent: element.textContent || "",
            attributes,
            children,
            left,
            top
        };
    }
    async getElementXY(selector, xoffset, yoffset) {
        const offset = typeof xoffset === "number" && typeof yoffset === "number" ? {
            x: xoffset,
            y: yoffset
        } : undefined;
        return this._getElementXY(selector, offset);
    }
    async typeInEditor(selector, text) {
        const element = mainWindow.document.querySelector(selector);
        if (!element) {
            throw ( new Error(`Editor not found: ${selector}`));
        }
        if (isHTMLDivElement(element)) {
            const editContext = element.editContext;
            if (!editContext) {
                throw ( new Error(`Edit context not found: ${selector}`));
            }
            const selectionStart = editContext.selectionStart;
            const selectionEnd = editContext.selectionEnd;
            const event = ( new TextUpdateEvent("textupdate", {
                updateRangeStart: selectionStart,
                updateRangeEnd: selectionEnd,
                text,
                selectionStart: selectionStart + text.length,
                selectionEnd: selectionStart + text.length,
                compositionStart: 0,
                compositionEnd: 0
            }));
            editContext.dispatchEvent(event);
        } else if (isHTMLTextAreaElement(element)) {
            const start = element.selectionStart;
            const newStart = start + text.length;
            const value = element.value;
            const newValue = value.substr(0, start) + text + value.substr(start);
            element.value = newValue;
            element.setSelectionRange(newStart, newStart);
            const event = ( new Event("input", {
                "bubbles": true,
                "cancelable": true
            }));
            element.dispatchEvent(event);
        }
    }
    async getEditorSelection(selector) {
        const element = mainWindow.document.querySelector(selector);
        if (!element) {
            throw ( new Error(`Editor not found: ${selector}`));
        }
        if (isHTMLDivElement(element)) {
            const editContext = element.editContext;
            if (!editContext) {
                throw ( new Error(`Edit context not found: ${selector}`));
            }
            return {
                selectionStart: editContext.selectionStart,
                selectionEnd: editContext.selectionEnd
            };
        } else if (isHTMLTextAreaElement(element)) {
            return {
                selectionStart: element.selectionStart,
                selectionEnd: element.selectionEnd
            };
        } else {
            throw ( new Error(`Unknown type of element: ${selector}`));
        }
    }
    async getTerminalBuffer(selector) {
        const element = mainWindow.document.querySelector(selector);
        if (!element) {
            throw ( new Error(`Terminal not found: ${selector}`));
        }
        const xterm = element.xterm;
        if (!xterm) {
            throw ( new Error(`Xterm not found: ${selector}`));
        }
        const lines = [];
        for (let i = 0; i < xterm.buffer.active.length; i++) {
            lines.push(xterm.buffer.active.getLine(i).translateToString(true));
        }
        return lines;
    }
    async writeInTerminal(selector, text) {
        const element = mainWindow.document.querySelector(selector);
        if (!element) {
            throw ( new Error(`Element not found: ${selector}`));
        }
        const xterm = element.xterm;
        if (!xterm) {
            throw ( new Error(`Xterm not found: ${selector}`));
        }
        xterm.input(text);
    }
    getLocaleInfo() {
        return Promise.resolve({
            language: language,
            locale: locale
        });
    }
    getLocalizedStrings() {
        return Promise.resolve({
            open: localizedStrings.open,
            close: localizedStrings.close,
            find: localizedStrings.find
        });
    }
    async _getElementXY(selector, offset) {
        const element = mainWindow.document.querySelector(selector);
        if (!element) {
            return Promise.reject(( new Error(`Element not found: ${selector}`)));
        }
        const {
            left,
            top
        } = getTopLeftOffset(element);
        const {
            width,
            height
        } = getClientArea(element);
        let x, y;
        if (offset) {
            x = left + offset.x;
            y = top + offset.y;
        } else {
            x = left + (width / 2);
            y = top + (height / 2);
        }
        x = Math.round(x);
        y = Math.round(y);
        return {
            x,
            y
        };
    }
};
BrowserWindowDriver = ( __decorate([( __param(0, IFileService)), ( __param(1, IEnvironmentService)), ( __param(2, ILifecycleService)), ( __param(3, ILogService))], BrowserWindowDriver));
function registerWindowDriver(instantiationService) {
    Object.assign(mainWindow, {
        driver: instantiationService.createInstance(BrowserWindowDriver)
    });
}

export { BrowserWindowDriver, registerWindowDriver };
