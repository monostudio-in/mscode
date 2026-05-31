
import { RawContextKey } from '../../contextkey/common/contextkey.js';

var AccessibilitySupport;
(function(AccessibilitySupport) {
    AccessibilitySupport[AccessibilitySupport["Unknown"] = 0] = "Unknown";
    AccessibilitySupport[AccessibilitySupport["Disabled"] = 1] = "Disabled";
    AccessibilitySupport[AccessibilitySupport["Enabled"] = 2] = "Enabled";
})(AccessibilitySupport || (AccessibilitySupport = {}));
const CONTEXT_ACCESSIBILITY_MODE_ENABLED = ( new RawContextKey("accessibilityModeEnabled", false));
function isAccessibilityInformation(obj) {
    if (!obj || typeof obj !== "object") {
        return false;
    }
    const candidate = obj;
    return typeof candidate.label === "string" && (typeof candidate.role === "undefined" || typeof candidate.role === "string");
}
const ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX = "ACCESSIBLE_VIEW_SHOWN_";

export { ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX, AccessibilitySupport, CONTEXT_ACCESSIBILITY_MODE_ENABLED, isAccessibilityInformation };
