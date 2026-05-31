
import { getDomNodePagePosition } from '../../../../base/browser/dom.js';

var PADDING;
(function (PADDING) {
    PADDING[PADDING["VALUE"] = 3] = "VALUE";
})(PADDING || (PADDING = {}));
function isMousePositionWithinElement(element, posx, posy) {
    const elementRect = getDomNodePagePosition(element);
    if (posx < elementRect.left + PADDING.VALUE
        || posx > elementRect.left + elementRect.width - PADDING.VALUE
        || posy < elementRect.top + PADDING.VALUE
        || posy > elementRect.top + elementRect.height - PADDING.VALUE) {
        return false;
    }
    return true;
}
function shouldShowHover(hoverEnabled, multiCursorModifier, mouseEvent) {
    if (hoverEnabled === 'on') {
        return true;
    }
    if (hoverEnabled === 'off') {
        return false;
    }
    return isTriggerModifierPressed(multiCursorModifier, mouseEvent.event);
}
function isTriggerModifierPressed(multiCursorModifier, event) {
    if (multiCursorModifier === 'altKey') {
        return event.ctrlKey || event.metaKey;
    }
    return event.altKey;
}

export { isMousePositionWithinElement, isTriggerModifierPressed, shouldShowHover };
