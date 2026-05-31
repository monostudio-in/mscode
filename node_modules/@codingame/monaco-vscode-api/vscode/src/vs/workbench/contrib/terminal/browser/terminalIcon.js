
import { hash } from '../../../../base/common/hash.js';
import { URI } from '../../../../base/common/uri.js';
import { getIconRegistry } from '../../../../platform/theme/common/iconRegistry.js';
import { isDark } from '../../../../platform/theme/common/theme.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ITerminalProfileResolverService } from '../common/terminal.service.js';
import { ansiColorMap } from '../common/terminalColorRegistry.js';
import { createStyleSheet } from '../../../../base/browser/domStylesheets.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { isString } from '../../../../base/common/types.js';

function getColorClass(terminalOrColorKey) {
    let color = undefined;
    if (isString(terminalOrColorKey)) {
        color = terminalOrColorKey;
    } else if (terminalOrColorKey.color) {
        color = terminalOrColorKey.color.replace(/\./g, "_");
    } else if (ThemeIcon.isThemeIcon(terminalOrColorKey.icon) && terminalOrColorKey.icon.color) {
        color = terminalOrColorKey.icon.color.id.replace(/\./g, "_");
    }
    if (color) {
        return `terminal-icon-${color.replace(/\./g, "_")}`;
    }
    return undefined;
}
function getStandardColors(colorTheme) {
    const standardColors = [];
    for (const colorKey in ansiColorMap) {
        const color = colorTheme.getColor(colorKey);
        if (color && !colorKey.toLowerCase().includes("bright")) {
            standardColors.push(colorKey);
        }
    }
    return standardColors;
}
function createColorStyleElement(colorTheme) {
    const disposable = ( new DisposableStore());
    const standardColors = getStandardColors(colorTheme);
    const styleElement = createStyleSheet(undefined, undefined, disposable);
    let css = "";
    for (const colorKey of standardColors) {
        const colorClass = getColorClass(colorKey);
        const color = colorTheme.getColor(colorKey);
        if (color) {
            css += (`.monaco-workbench .${colorClass} .codicon:first-child:not(.codicon-split-horizontal):not(.codicon-trashcan):not(.file-icon)` + `{ color: ${color} !important; }`);
        }
    }
    styleElement.textContent = css;
    return disposable;
}
function getColorStyleContent(colorTheme, editor) {
    const standardColors = getStandardColors(colorTheme);
    let css = "";
    for (const colorKey of standardColors) {
        const colorClass = getColorClass(colorKey);
        const color = colorTheme.getColor(colorKey);
        if (color) {
            {
                css += (`.monaco-workbench .show-file-icons .predefined-file-icon.terminal-tab.${colorClass}::before,` + `.monaco-workbench .show-file-icons .file-icon.terminal-tab.${colorClass}::before` + `{ color: ${color} !important; }`);
            }
        }
    }
    return css;
}
function getUriClasses(terminal, colorScheme, extensionContributed) {
    const icon = terminal.icon;
    if (!icon) {
        return undefined;
    }
    const iconClasses = [];
    let uri = undefined;
    if (extensionContributed) {
        if (isString(icon) && (icon.startsWith("$(") || getIconRegistry().getIcon(icon))) {
            return iconClasses;
        } else if (isString(icon)) {
            uri = ( URI.parse(icon));
        }
    }
    if (URI.isUri(icon)) {
        uri = icon;
    } else if (!ThemeIcon.isThemeIcon(icon) && !isString(icon)) {
        uri = isDark(colorScheme) ? icon.dark : icon.light;
    }
    if (uri instanceof URI) {
        const uriIconKey = ( hash(uri.path).toString(36));
        const className = `terminal-uri-icon-${uriIconKey}`;
        iconClasses.push(className);
        iconClasses.push(`terminal-uri-icon`);
    }
    return iconClasses;
}
function getIconId(accessor, terminal) {
    if (isString(terminal.icon)) {
        return terminal.icon;
    }
    if (ThemeIcon.isThemeIcon(terminal.icon)) {
        return terminal.icon.id;
    }
    return accessor.get(ITerminalProfileResolverService).getDefaultIcon().id;
}

export { createColorStyleElement, getColorClass, getColorStyleContent, getIconId, getStandardColors, getUriClasses };
