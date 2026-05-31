
import { OperatingSystem } from './platform.js';
import { localize } from '../../nls.js';

class ModifierLabelProvider {
    constructor(mac, windows, linux = windows) {
        this.modifierLabels = [null];
        this.modifierLabels[OperatingSystem.Macintosh] = mac;
        this.modifierLabels[OperatingSystem.Windows] = windows;
        this.modifierLabels[OperatingSystem.Linux] = linux;
    }
    toLabel(OS, chords, keyLabelProvider) {
        if (chords.length === 0) {
            return null;
        }
        const result = [];
        for (let i = 0, len = chords.length; i < len; i++) {
            const chord = chords[i];
            const keyLabel = keyLabelProvider(chord);
            if (keyLabel === null) {
                return null;
            }
            result[i] = _simpleAsString(chord, keyLabel, this.modifierLabels[OS]);
        }
        return result.join(" ");
    }
}
const UILabelProvider = ( new ModifierLabelProvider({
    ctrlKey: "⌃",
    shiftKey: "⇧",
    altKey: "⌥",
    metaKey: "⌘",
    separator: ""
}, {
    ctrlKey: ( localize(125, "Ctrl")),
    shiftKey: ( localize(126, "Shift")),
    altKey: ( localize(127, "Alt")),
    metaKey: ( localize(128, "Windows")),
    separator: "+"
}, {
    ctrlKey: ( localize(125, "Ctrl")),
    shiftKey: ( localize(126, "Shift")),
    altKey: ( localize(127, "Alt")),
    metaKey: ( localize(129, "Super")),
    separator: "+"
}));
const AriaLabelProvider = ( new ModifierLabelProvider({
    ctrlKey: ( localize(130, "Control")),
    shiftKey: ( localize(131, "Shift")),
    altKey: ( localize(132, "Option")),
    metaKey: ( localize(133, "Command")),
    separator: "+"
}, {
    ctrlKey: ( localize(130, "Control")),
    shiftKey: ( localize(131, "Shift")),
    altKey: ( localize(134, "Alt")),
    metaKey: ( localize(135, "Windows")),
    separator: "+"
}, {
    ctrlKey: ( localize(130, "Control")),
    shiftKey: ( localize(131, "Shift")),
    altKey: ( localize(134, "Alt")),
    metaKey: ( localize(136, "Super")),
    separator: "+"
}));
const ElectronAcceleratorLabelProvider = ( new ModifierLabelProvider({
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Cmd",
    separator: "+"
}, {
    ctrlKey: "Ctrl",
    shiftKey: "Shift",
    altKey: "Alt",
    metaKey: "Super",
    separator: "+"
}));
const UserSettingsLabelProvider = ( new ModifierLabelProvider({
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "cmd",
    separator: "+"
}, {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "win",
    separator: "+"
}, {
    ctrlKey: "ctrl",
    shiftKey: "shift",
    altKey: "alt",
    metaKey: "meta",
    separator: "+"
}));
function _simpleAsString(modifiers, key, labels) {
    if (key === null) {
        return "";
    }
    const result = [];
    if (modifiers.ctrlKey) {
        result.push(labels.ctrlKey);
    }
    if (modifiers.shiftKey) {
        result.push(labels.shiftKey);
    }
    if (modifiers.altKey) {
        result.push(labels.altKey);
    }
    if (modifiers.metaKey) {
        result.push(labels.metaKey);
    }
    if (key !== "") {
        result.push(key);
    }
    return result.join(labels.separator);
}

export { AriaLabelProvider, ElectronAcceleratorLabelProvider, ModifierLabelProvider, UILabelProvider, UserSettingsLabelProvider };
