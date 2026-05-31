
import { isStandalone, isSafari } from './browser.js';
import { mainWindow } from './window.js';
import { isNative } from '../common/platform.js';

var KeyboardSupport;
(function (KeyboardSupport) {
    KeyboardSupport[KeyboardSupport["Always"] = 0] = "Always";
    KeyboardSupport[KeyboardSupport["FullScreen"] = 1] = "FullScreen";
    KeyboardSupport[KeyboardSupport["None"] = 2] = "None";
})(KeyboardSupport || (KeyboardSupport = {}));
const BrowserFeatures = {
    clipboard: {
        writeText: (isNative
            || (mainWindow.document.queryCommandSupported && mainWindow.document.queryCommandSupported('copy'))
            || !!(mainWindow.navigator && mainWindow.navigator.clipboard && mainWindow.navigator.clipboard.writeText)),
        readText: (isNative
            || !!(mainWindow.navigator && mainWindow.navigator.clipboard && mainWindow.navigator.clipboard.readText))
    },
    keyboard: (() => {
        if (isNative || isStandalone()) {
            return KeyboardSupport.Always;
        }
        if (mainWindow.navigator.keyboard || isSafari) {
            return KeyboardSupport.FullScreen;
        }
        return KeyboardSupport.None;
    })(),
    pointerEvents: mainWindow.PointerEvent && ('ontouchstart' in mainWindow || mainWindow.navigator.maxTouchPoints > 0)
};

export { BrowserFeatures, KeyboardSupport };
