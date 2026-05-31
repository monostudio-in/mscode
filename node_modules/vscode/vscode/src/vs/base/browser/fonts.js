
import { mainWindow } from './window.js';
import { isWindows, isMacintosh, isElectron } from '../common/platform.js';

const DEFAULT_FONT_FAMILY = isWindows ? "\"Segoe WPC\", \"Segoe UI\", sans-serif" : isMacintosh ? "-apple-system, BlinkMacSystemFont, sans-serif" : "system-ui, \"Ubuntu\", \"Droid Sans\", sans-serif";
const getFonts = async () => {
    try {
        const fonts = await mainWindow.queryLocalFonts();
        const fontsArray = [...fonts];
        const families = ( fontsArray.map(font => font.family));
        return families;
    } catch (error) {
        console.error(`Failed to query fonts: ${error}`);
        return [];
    }
};
const getFontSnippets = async () => {
    if (!isElectron) {
        return [];
    }
    const fonts = await getFonts();
    const snippets = ( fonts.map(font => {
        return {
            body: `${font}`
        };
    }));
    return snippets;
};

export { DEFAULT_FONT_FAMILY, getFontSnippets, getFonts };
