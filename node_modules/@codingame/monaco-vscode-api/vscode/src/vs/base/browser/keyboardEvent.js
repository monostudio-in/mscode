
import { isFirefox, isWebKit } from './browser.js';
import { KeyCodeUtils, KeyCode, EVENT_KEY_CODE_MAP, KeyMod as KeyMod$1, isModifierKey } from '../common/keyCodes.js';
import { KeyCodeChord } from '../common/keybindings.js';
import { isMacintosh, isLinux } from '../common/platform.js';
import { isHTMLIframeElement } from './dom.js';

function extractKeyCode(e) {
    if (e.charCode) {
        const char = String.fromCharCode(e.charCode).toUpperCase();
        return KeyCodeUtils.fromString(char);
    }
    const keyCode = e.keyCode;
    if (keyCode === 3) {
        return KeyCode.PauseBreak;
    } else if (isFirefox) {
        switch (keyCode) {
        case 59:
            return KeyCode.Semicolon;
        case 60:
            if (isLinux) {
                return KeyCode.IntlBackslash;
            }
            break;
        case 61:
            return KeyCode.Equal;
        case 107:
            return KeyCode.NumpadAdd;
        case 109:
            return KeyCode.NumpadSubtract;
        case 173:
            return KeyCode.Minus;
        case 224:
            if (isMacintosh) {
                return KeyCode.Meta;
            }
            break;
        }
    } else if (isWebKit) {
        if (isMacintosh && keyCode === 93) {
            return KeyCode.Meta;
        } else if (!isMacintosh && keyCode === 92) {
            return KeyCode.Meta;
        }
    }
    return EVENT_KEY_CODE_MAP[keyCode] || KeyCode.Unknown;
}
const ctrlKeyMod = (isMacintosh ? KeyMod$1.WinCtrl : KeyMod$1.CtrlCmd);
const altKeyMod = KeyMod$1.Alt;
const shiftKeyMod = KeyMod$1.Shift;
const metaKeyMod = (isMacintosh ? KeyMod$1.CtrlCmd : KeyMod$1.WinCtrl);
function printKeyboardEvent(e) {
    const modifiers = [];
    if (e.ctrlKey) {
        modifiers.push(`ctrl`);
    }
    if (e.shiftKey) {
        modifiers.push(`shift`);
    }
    if (e.altKey) {
        modifiers.push(`alt`);
    }
    if (e.metaKey) {
        modifiers.push(`meta`);
    }
    return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode}, key: ${e.key}`;
}
function printStandardKeyboardEvent(e) {
    const modifiers = [];
    if (e.ctrlKey) {
        modifiers.push(`ctrl`);
    }
    if (e.shiftKey) {
        modifiers.push(`shift`);
    }
    if (e.altKey) {
        modifiers.push(`alt`);
    }
    if (e.metaKey) {
        modifiers.push(`meta`);
    }
    return `modifiers: [${modifiers.join(",")}], code: ${e.code}, keyCode: ${e.keyCode} ('${( KeyCodeUtils.toString(e.keyCode))}')`;
}
function hasModifierKeys(keyStatus) {
    return keyStatus.ctrlKey || keyStatus.shiftKey || keyStatus.altKey || keyStatus.metaKey;
}
function getTarget(source) {
    if (isHTMLIframeElement(source.target)) {
        return source.target;
    }
    return source.composedPath()[0] ?? source.target;
}
class StandardKeyboardEvent {
    constructor(source) {
        this._standardKeyboardEventBrand = true;
        const e = source;
        this.browserEvent = e;
        this.target = getTarget(e);
        this.ctrlKey = e.ctrlKey;
        this.shiftKey = e.shiftKey;
        this.altKey = e.altKey;
        this.metaKey = e.metaKey;
        this.altGraphKey = e.getModifierState?.("AltGraph");
        this.keyCode = extractKeyCode(e);
        this.code = e.code;
        this.ctrlKey = this.ctrlKey || this.keyCode === KeyCode.Ctrl;
        this.altKey = this.altKey || this.keyCode === KeyCode.Alt;
        this.shiftKey = this.shiftKey || this.keyCode === KeyCode.Shift;
        this.metaKey = this.metaKey || this.keyCode === KeyCode.Meta;
        this._asKeybinding = this._computeKeybinding();
        this._asKeyCodeChord = this._computeKeyCodeChord();
    }
    preventDefault() {
        if (this.browserEvent && this.browserEvent.preventDefault) {
            this.browserEvent.preventDefault();
        }
    }
    stopPropagation() {
        if (this.browserEvent && this.browserEvent.stopPropagation) {
            this.browserEvent.stopPropagation();
        }
    }
    toKeyCodeChord() {
        return this._asKeyCodeChord;
    }
    equals(other) {
        return this._asKeybinding === other;
    }
    _computeKeybinding() {
        let key = KeyCode.Unknown;
        if (!isModifierKey(this.keyCode)) {
            key = this.keyCode;
        }
        let result = 0;
        if (this.ctrlKey) {
            result |= ctrlKeyMod;
        }
        if (this.altKey) {
            result |= altKeyMod;
        }
        if (this.shiftKey) {
            result |= shiftKeyMod;
        }
        if (this.metaKey) {
            result |= metaKeyMod;
        }
        result |= key;
        return result;
    }
    _computeKeyCodeChord() {
        let key = KeyCode.Unknown;
        if (!isModifierKey(this.keyCode)) {
            key = this.keyCode;
        }
        return ( new KeyCodeChord(this.ctrlKey, this.shiftKey, this.altKey, this.metaKey, key));
    }
}

export { StandardKeyboardEvent, hasModifierKeys, printKeyboardEvent, printStandardKeyboardEvent };
