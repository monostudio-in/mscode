
import { applyFontInfo } from './domFontInfo.js';
import { createElement } from '../../../base/browser/dom.js';

var CharWidthRequestType;
(function(CharWidthRequestType) {
    CharWidthRequestType[CharWidthRequestType["Regular"] = 0] = "Regular";
    CharWidthRequestType[CharWidthRequestType["Italic"] = 1] = "Italic";
    CharWidthRequestType[CharWidthRequestType["Bold"] = 2] = "Bold";
})(CharWidthRequestType || (CharWidthRequestType = {}));
class CharWidthRequest {
    constructor(chr, type) {
        this.chr = chr;
        this.type = type;
        this.width = 0;
    }
    fulfill(width) {
        this.width = width;
    }
}
class DomCharWidthReader {
    constructor(bareFontInfo, requests) {
        this._bareFontInfo = bareFontInfo;
        this._requests = requests;
        this._container = null;
        this._testElements = null;
    }
    read(targetWindow) {
        this._createDomElements();
        targetWindow.document.body.appendChild(this._container);
        this._readFromDomElements();
        this._container?.remove();
        this._container = null;
        this._testElements = null;
    }
    _createDomElements() {
        const container = createElement("div");
        container.style.position = "absolute";
        container.style.top = "-50000px";
        container.style.width = "50000px";
        const regularDomNode = createElement("div");
        applyFontInfo(regularDomNode, this._bareFontInfo);
        container.appendChild(regularDomNode);
        const boldDomNode = createElement("div");
        applyFontInfo(boldDomNode, this._bareFontInfo);
        boldDomNode.style.fontWeight = "bold";
        container.appendChild(boldDomNode);
        const italicDomNode = createElement("div");
        applyFontInfo(italicDomNode, this._bareFontInfo);
        italicDomNode.style.fontStyle = "italic";
        container.appendChild(italicDomNode);
        const testElements = [];
        for (const request of this._requests) {
            let parent;
            if (request.type === CharWidthRequestType.Regular) {
                parent = regularDomNode;
            }
            if (request.type === CharWidthRequestType.Bold) {
                parent = boldDomNode;
            }
            if (request.type === CharWidthRequestType.Italic) {
                parent = italicDomNode;
            }
            parent.appendChild(createElement("br"));
            const testElement = createElement("span");
            DomCharWidthReader._render(testElement, request);
            parent.appendChild(testElement);
            testElements.push(testElement);
        }
        this._container = container;
        this._testElements = testElements;
    }
    static _render(testElement, request) {
        if (request.chr === " ") {
            let htmlString = " ";
            for (let i = 0; i < 8; i++) {
                htmlString += htmlString;
            }
            testElement.innerText = htmlString;
        } else {
            let testString = request.chr;
            for (let i = 0; i < 8; i++) {
                testString += testString;
            }
            testElement.textContent = testString;
        }
    }
    _readFromDomElements() {
        for (let i = 0, len = this._requests.length; i < len; i++) {
            const request = this._requests[i];
            const testElement = this._testElements[i];
            request.fulfill(testElement.offsetWidth / 256);
        }
    }
}
function readCharWidths(targetWindow, bareFontInfo, requests) {
    const reader = ( new DomCharWidthReader(bareFontInfo, requests));
    reader.read(targetWindow);
}

export { CharWidthRequest, CharWidthRequestType, readCharWidths };
