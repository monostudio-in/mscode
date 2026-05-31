
import { KeyCode, KeyCodeUtils, IMMUTABLE_CODE_TO_KEY_CODE, ScanCode } from '../../../base/common/keyCodes.js';
import { KeyCodeChord } from '../../../base/common/keybindings.js';
import { OperatingSystem } from '../../../base/common/platform.js';
import { BaseResolvedKeybinding } from './baseResolvedKeybinding.js';
import { toEmptyArrayIfContainsNull } from './resolvedKeybindingItem.js';

class USLayoutResolvedKeybinding extends BaseResolvedKeybinding {
    constructor(chords, os) {
        super(os, chords);
    }
    _keyCodeToUILabel(keyCode) {
        if (this._os === OperatingSystem.Macintosh) {
            switch (keyCode) {
            case KeyCode.LeftArrow:
                return "←";
            case KeyCode.UpArrow:
                return "↑";
            case KeyCode.RightArrow:
                return "→";
            case KeyCode.DownArrow:
                return "↓";
            }
        }
        return ( KeyCodeUtils.toString(keyCode));
    }
    _getLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return "";
        }
        return this._keyCodeToUILabel(chord.keyCode);
    }
    _getAriaLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return "";
        }
        return ( KeyCodeUtils.toString(chord.keyCode));
    }
    _getElectronAccelerator(chord) {
        return KeyCodeUtils.toElectronAccelerator(chord.keyCode);
    }
    _getUserSettingsLabel(chord) {
        if (chord.isDuplicateModifierCase()) {
            return "";
        }
        const result = KeyCodeUtils.toUserSettingsUS(chord.keyCode);
        return (result ? result.toLowerCase() : result);
    }
    _isWYSIWYG() {
        return true;
    }
    _getChordDispatch(chord) {
        return USLayoutResolvedKeybinding.getDispatchStr(chord);
    }
    static getDispatchStr(chord) {
        if (chord.isModifierKey()) {
            return null;
        }
        let result = "";
        if (chord.ctrlKey) {
            result += "ctrl+";
        }
        if (chord.shiftKey) {
            result += "shift+";
        }
        if (chord.altKey) {
            result += "alt+";
        }
        if (chord.metaKey) {
            result += "meta+";
        }
        result += ( KeyCodeUtils.toString(chord.keyCode));
        return result;
    }
    _getSingleModifierChordDispatch(keybinding) {
        if (keybinding.keyCode === KeyCode.Ctrl && !keybinding.shiftKey && !keybinding.altKey && !keybinding.metaKey) {
            return "ctrl";
        }
        if (keybinding.keyCode === KeyCode.Shift && !keybinding.ctrlKey && !keybinding.altKey && !keybinding.metaKey) {
            return "shift";
        }
        if (keybinding.keyCode === KeyCode.Alt && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.metaKey) {
            return "alt";
        }
        if (keybinding.keyCode === KeyCode.Meta && !keybinding.ctrlKey && !keybinding.shiftKey && !keybinding.altKey) {
            return "meta";
        }
        return null;
    }
    static _scanCodeToKeyCode(scanCode) {
        const immutableKeyCode = IMMUTABLE_CODE_TO_KEY_CODE[scanCode];
        if (immutableKeyCode !== KeyCode.DependsOnKbLayout) {
            return immutableKeyCode;
        }
        switch (scanCode) {
        case ScanCode.KeyA:
            return KeyCode.KeyA;
        case ScanCode.KeyB:
            return KeyCode.KeyB;
        case ScanCode.KeyC:
            return KeyCode.KeyC;
        case ScanCode.KeyD:
            return KeyCode.KeyD;
        case ScanCode.KeyE:
            return KeyCode.KeyE;
        case ScanCode.KeyF:
            return KeyCode.KeyF;
        case ScanCode.KeyG:
            return KeyCode.KeyG;
        case ScanCode.KeyH:
            return KeyCode.KeyH;
        case ScanCode.KeyI:
            return KeyCode.KeyI;
        case ScanCode.KeyJ:
            return KeyCode.KeyJ;
        case ScanCode.KeyK:
            return KeyCode.KeyK;
        case ScanCode.KeyL:
            return KeyCode.KeyL;
        case ScanCode.KeyM:
            return KeyCode.KeyM;
        case ScanCode.KeyN:
            return KeyCode.KeyN;
        case ScanCode.KeyO:
            return KeyCode.KeyO;
        case ScanCode.KeyP:
            return KeyCode.KeyP;
        case ScanCode.KeyQ:
            return KeyCode.KeyQ;
        case ScanCode.KeyR:
            return KeyCode.KeyR;
        case ScanCode.KeyS:
            return KeyCode.KeyS;
        case ScanCode.KeyT:
            return KeyCode.KeyT;
        case ScanCode.KeyU:
            return KeyCode.KeyU;
        case ScanCode.KeyV:
            return KeyCode.KeyV;
        case ScanCode.KeyW:
            return KeyCode.KeyW;
        case ScanCode.KeyX:
            return KeyCode.KeyX;
        case ScanCode.KeyY:
            return KeyCode.KeyY;
        case ScanCode.KeyZ:
            return KeyCode.KeyZ;
        case ScanCode.Digit1:
            return KeyCode.Digit1;
        case ScanCode.Digit2:
            return KeyCode.Digit2;
        case ScanCode.Digit3:
            return KeyCode.Digit3;
        case ScanCode.Digit4:
            return KeyCode.Digit4;
        case ScanCode.Digit5:
            return KeyCode.Digit5;
        case ScanCode.Digit6:
            return KeyCode.Digit6;
        case ScanCode.Digit7:
            return KeyCode.Digit7;
        case ScanCode.Digit8:
            return KeyCode.Digit8;
        case ScanCode.Digit9:
            return KeyCode.Digit9;
        case ScanCode.Digit0:
            return KeyCode.Digit0;
        case ScanCode.Minus:
            return KeyCode.Minus;
        case ScanCode.Equal:
            return KeyCode.Equal;
        case ScanCode.BracketLeft:
            return KeyCode.BracketLeft;
        case ScanCode.BracketRight:
            return KeyCode.BracketRight;
        case ScanCode.Backslash:
            return KeyCode.Backslash;
        case ScanCode.IntlHash:
            return KeyCode.Unknown;
        case ScanCode.Semicolon:
            return KeyCode.Semicolon;
        case ScanCode.Quote:
            return KeyCode.Quote;
        case ScanCode.Backquote:
            return KeyCode.Backquote;
        case ScanCode.Comma:
            return KeyCode.Comma;
        case ScanCode.Period:
            return KeyCode.Period;
        case ScanCode.Slash:
            return KeyCode.Slash;
        case ScanCode.IntlBackslash:
            return KeyCode.IntlBackslash;
        }
        return KeyCode.Unknown;
    }
    static _toKeyCodeChord(chord) {
        if (!chord) {
            return null;
        }
        if (chord instanceof KeyCodeChord) {
            return chord;
        }
        const keyCode = this._scanCodeToKeyCode(chord.scanCode);
        if (keyCode === KeyCode.Unknown) {
            return null;
        }
        return ( new KeyCodeChord(chord.ctrlKey, chord.shiftKey, chord.altKey, chord.metaKey, keyCode));
    }
    static resolveKeybinding(keybinding, os) {
        const chords = toEmptyArrayIfContainsNull(( keybinding.chords.map(chord => this._toKeyCodeChord(chord))));
        if (chords.length > 0) {
            return [( new USLayoutResolvedKeybinding(chords, os))];
        }
        return [];
    }
}

export { USLayoutResolvedKeybinding };
