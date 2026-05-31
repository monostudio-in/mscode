
import { ViewEventHandler } from '../../common/viewEventHandler.js';
import { getRootContainer } from '../../../base/browser/dom.js';

class ViewPart extends ViewEventHandler {
    constructor(context) {
        super();
        this._context = context;
        this._context.addEventHandler(this);
    }
    dispose() {
        this._context.removeEventHandler(this);
        super.dispose();
    }
    onBeforeRender(viewportData) {}
}
var PartFingerprint;
(function(PartFingerprint) {
    PartFingerprint[PartFingerprint["None"] = 0] = "None";
    PartFingerprint[PartFingerprint["ContentWidgets"] = 1] = "ContentWidgets";
    PartFingerprint[PartFingerprint["OverflowingContentWidgets"] = 2] = "OverflowingContentWidgets";
    PartFingerprint[PartFingerprint["OverflowGuard"] = 3] = "OverflowGuard";
    PartFingerprint[PartFingerprint["OverlayWidgets"] = 4] = "OverlayWidgets";
    PartFingerprint[PartFingerprint["OverflowingOverlayWidgets"] = 5] = "OverflowingOverlayWidgets";
    PartFingerprint[PartFingerprint["ScrollableElement"] = 6] = "ScrollableElement";
    PartFingerprint[PartFingerprint["TextArea"] = 7] = "TextArea";
    PartFingerprint[PartFingerprint["ViewLines"] = 8] = "ViewLines";
    PartFingerprint[PartFingerprint["Minimap"] = 9] = "Minimap";
    PartFingerprint[PartFingerprint["ViewLinesGpu"] = 10] = "ViewLinesGpu";
})(PartFingerprint || (PartFingerprint = {}));
class PartFingerprints {
    static write(target, partId) {
        target.setAttribute("data-mprt", String(partId));
    }
    static read(target) {
        const r = target.getAttribute("data-mprt");
        if (r === null) {
            return PartFingerprint.None;
        }
        return parseInt(r, 10);
    }
    static collect(child, stopAt) {
        const result = [];
        let resultLen = 0;
        while (child && child !== getRootContainer(child)) {
            if (child === stopAt) {
                break;
            }
            if (child.nodeType === child.ELEMENT_NODE) {
                result[resultLen++] = this.read(child);
            }
            child = child.parentElement;
        }
        const r = ( new Uint8Array(resultLen));
        for (let i = 0; i < resultLen; i++) {
            r[i] = result[resultLen - i - 1];
        }
        return r;
    }
}

export { PartFingerprint, PartFingerprints, ViewPart };
