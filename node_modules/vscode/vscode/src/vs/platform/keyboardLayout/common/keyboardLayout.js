
import '../../../base/common/keyCodes.js';

function areKeyboardLayoutsEqual(a, b) {
    if (!a || !b) {
        return false;
    }
    if (a.name && b.name && a.name === b.name) {
        return true;
    }
    if (a.id && b.id && a.id === b.id) {
        return true;
    }
    if (a.model && b.model && a.model === b.model && a.layout === b.layout) {
        return true;
    }
    return false;
}
function parseKeyboardLayoutDescription(layout) {
    if (!layout) {
        return {
            label: "",
            description: ""
        };
    }
    if (layout.name) {
        const windowsLayout = layout;
        return {
            label: windowsLayout.text,
            description: ""
        };
    }
    if (layout.id) {
        const macLayout = layout;
        if (macLayout.localizedName) {
            return {
                label: macLayout.localizedName,
                description: ""
            };
        }
        if (/^com\.apple\.keylayout\./.test(macLayout.id)) {
            return {
                label: macLayout.id.replace(/^com\.apple\.keylayout\./, "").replace(/-/g, " "),
                description: ""
            };
        }
        if (/^.*inputmethod\./.test(macLayout.id)) {
            return {
                label: macLayout.id.replace(/^.*inputmethod\./, "").replace(/[-\.]/g, " "),
                description: `Input Method (${macLayout.lang})`
            };
        }
        return {
            label: macLayout.lang,
            description: ""
        };
    }
    const linuxLayout = layout;
    return {
        label: linuxLayout.layout,
        description: ""
    };
}
function getKeyboardLayoutId(layout) {
    if (layout.name) {
        return layout.name;
    }
    if (layout.id) {
        return layout.id;
    }
    return layout.layout;
}

export { areKeyboardLayoutsEqual, getKeyboardLayoutId, parseKeyboardLayoutDescription };
