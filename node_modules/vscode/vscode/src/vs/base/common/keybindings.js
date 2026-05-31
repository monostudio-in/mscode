
import { illegalArgument } from './errors.js';
import { KeyCode, ScanCode } from './keyCodes.js';
import { OperatingSystem } from './platform.js';

var BinaryKeybindingsMask;
(function(BinaryKeybindingsMask) {
    BinaryKeybindingsMask[BinaryKeybindingsMask["CtrlCmd"] = 2048] = "CtrlCmd";
    BinaryKeybindingsMask[BinaryKeybindingsMask["Shift"] = 1024] = "Shift";
    BinaryKeybindingsMask[BinaryKeybindingsMask["Alt"] = 512] = "Alt";
    BinaryKeybindingsMask[BinaryKeybindingsMask["WinCtrl"] = 256] = "WinCtrl";
    BinaryKeybindingsMask[BinaryKeybindingsMask["KeyCode"] = 255] = "KeyCode";
})(BinaryKeybindingsMask || (BinaryKeybindingsMask = {}));
function decodeKeybinding(keybinding, OS) {
    if (typeof keybinding === "number") {
        if (keybinding === 0) {
            return null;
        }
        const firstChord = (keybinding & 0x0000FFFF) >>> 0;
        const secondChord = (keybinding & 0xFFFF0000) >>> 16;
        if (secondChord !== 0) {
            return ( new Keybinding([
                createSimpleKeybinding(firstChord, OS),
                createSimpleKeybinding(secondChord, OS)
            ]));
        }
        return ( new Keybinding([createSimpleKeybinding(firstChord, OS)]));
    } else {
        const chords = [];
        for (let i = 0; i < keybinding.length; i++) {
            chords.push(createSimpleKeybinding(keybinding[i], OS));
        }
        return ( new Keybinding(chords));
    }
}
function createSimpleKeybinding(keybinding, OS) {
    const ctrlCmd = (keybinding & BinaryKeybindingsMask.CtrlCmd ? true : false);
    const winCtrl = (keybinding & BinaryKeybindingsMask.WinCtrl ? true : false);
    const ctrlKey = (OS === OperatingSystem.Macintosh ? winCtrl : ctrlCmd);
    const shiftKey = (keybinding & BinaryKeybindingsMask.Shift ? true : false);
    const altKey = (keybinding & BinaryKeybindingsMask.Alt ? true : false);
    const metaKey = (OS === OperatingSystem.Macintosh ? ctrlCmd : winCtrl);
    const keyCode = (keybinding & BinaryKeybindingsMask.KeyCode);
    return ( new KeyCodeChord(ctrlKey, shiftKey, altKey, metaKey, keyCode));
}
class KeyCodeChord {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyCode = keyCode;
    }
    equals(other) {
        return (other instanceof KeyCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.keyCode === other.keyCode);
    }
    getHashCode() {
        const ctrl = this.ctrlKey ? "1" : "0";
        const shift = this.shiftKey ? "1" : "0";
        const alt = this.altKey ? "1" : "0";
        const meta = this.metaKey ? "1" : "0";
        return `K${ctrl}${shift}${alt}${meta}${this.keyCode}`;
    }
    isModifierKey() {
        return (this.keyCode === KeyCode.Unknown || this.keyCode === KeyCode.Ctrl || this.keyCode === KeyCode.Meta || this.keyCode === KeyCode.Alt || this.keyCode === KeyCode.Shift);
    }
    toKeybinding() {
        return ( new Keybinding([this]));
    }
    isDuplicateModifierCase() {
        return ((this.ctrlKey && this.keyCode === KeyCode.Ctrl) || (this.shiftKey && this.keyCode === KeyCode.Shift) || (this.altKey && this.keyCode === KeyCode.Alt) || (this.metaKey && this.keyCode === KeyCode.Meta));
    }
}
class ScanCodeChord {
    constructor(ctrlKey, shiftKey, altKey, metaKey, scanCode) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.scanCode = scanCode;
    }
    equals(other) {
        return (other instanceof ScanCodeChord && this.ctrlKey === other.ctrlKey && this.shiftKey === other.shiftKey && this.altKey === other.altKey && this.metaKey === other.metaKey && this.scanCode === other.scanCode);
    }
    getHashCode() {
        const ctrl = this.ctrlKey ? "1" : "0";
        const shift = this.shiftKey ? "1" : "0";
        const alt = this.altKey ? "1" : "0";
        const meta = this.metaKey ? "1" : "0";
        return `S${ctrl}${shift}${alt}${meta}${this.scanCode}`;
    }
    isDuplicateModifierCase() {
        return ((this.ctrlKey && (this.scanCode === ScanCode.ControlLeft || this.scanCode === ScanCode.ControlRight)) || (this.shiftKey && (this.scanCode === ScanCode.ShiftLeft || this.scanCode === ScanCode.ShiftRight)) || (this.altKey && (this.scanCode === ScanCode.AltLeft || this.scanCode === ScanCode.AltRight)) || (this.metaKey && (this.scanCode === ScanCode.MetaLeft || this.scanCode === ScanCode.MetaRight)));
    }
}
class Keybinding {
    constructor(chords) {
        if (chords.length === 0) {
            throw illegalArgument(`chords`);
        }
        this.chords = chords;
    }
    getHashCode() {
        let result = "";
        for (let i = 0, len = this.chords.length; i < len; i++) {
            if (i !== 0) {
                result += ";";
            }
            result += this.chords[i].getHashCode();
        }
        return result;
    }
    equals(other) {
        if (other === null) {
            return false;
        }
        if (this.chords.length !== other.chords.length) {
            return false;
        }
        for (let i = 0; i < this.chords.length; i++) {
            if (!this.chords[i].equals(other.chords[i])) {
                return false;
            }
        }
        return true;
    }
}
class ResolvedChord {
    constructor(ctrlKey, shiftKey, altKey, metaKey, keyLabel, keyAriaLabel) {
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.altKey = altKey;
        this.metaKey = metaKey;
        this.keyLabel = keyLabel;
        this.keyAriaLabel = keyAriaLabel;
    }
}
class ResolvedKeybinding {}

export { KeyCodeChord, Keybinding, ResolvedChord, ResolvedKeybinding, ScanCodeChord, createSimpleKeybinding, decodeKeybinding };
