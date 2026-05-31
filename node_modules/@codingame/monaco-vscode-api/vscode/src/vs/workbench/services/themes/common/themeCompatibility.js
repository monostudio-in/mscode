
import { Color } from '../../../../base/common/color.js';
import '../../../../platform/theme/common/colorUtils.js';
import '../../../../platform/theme/common/colors/baseColors.js';
import '../../../../platform/theme/common/colors/chartsColors.js';
import { editorBackground, editorForeground, editorSelectionBackground, editorInactiveSelection, editorSelectionHighlight, editorFindMatchHighlight, editorFindMatch, editorHoverHighlight, editorFindRangeHighlight } from '../../../../platform/theme/common/colors/editorColors.js';
import '../../../../platform/theme/common/colors/inputColors.js';
import '../../../../platform/theme/common/colors/listColors.js';
import '../../../../platform/theme/common/colors/menuColors.js';
import '../../../../platform/theme/common/colors/minimapColors.js';
import '../../../../platform/theme/common/colors/miscColors.js';
import '../../../../platform/theme/common/colors/quickpickColors.js';
import '../../../../platform/theme/common/colors/searchColors.js';
import { editorLineHighlight, editorRangeHighlight, editorCursorForeground, editorWhitespaces, editorIndentGuide1, editorActiveIndentGuide1 } from '../../../../editor/common/core/editorColorRegistry.js';

const settingToColorIdMapping = {};
function addSettingMapping(settingId, colorId) {
    let colorIds = settingToColorIdMapping[settingId];
    if (!colorIds) {
        settingToColorIdMapping[settingId] = colorIds = [];
    }
    colorIds.push(colorId);
}
function convertSettings(oldSettings, result) {
    for (const rule of oldSettings) {
        result.textMateRules.push(rule);
        if (!rule.scope) {
            const settings = rule.settings;
            if (!settings) {
                rule.settings = {};
            } else {
                for (const settingKey in settings) {
                    const key = settingKey;
                    const mappings = settingToColorIdMapping[key];
                    if (mappings) {
                        const colorHex = settings[key];
                        if (typeof colorHex === "string") {
                            const color = ( Color.fromHex(colorHex));
                            for (const colorId of mappings) {
                                result.colors[colorId] = color;
                            }
                        }
                    }
                    if (key !== "foreground" && key !== "background" && key !== "fontStyle") {
                        delete settings[key];
                    }
                }
            }
        }
    }
}
addSettingMapping("background", editorBackground);
addSettingMapping("foreground", editorForeground);
addSettingMapping("selection", editorSelectionBackground);
addSettingMapping("inactiveSelection", editorInactiveSelection);
addSettingMapping("selectionHighlightColor", editorSelectionHighlight);
addSettingMapping("findMatchHighlight", editorFindMatchHighlight);
addSettingMapping("currentFindMatchHighlight", editorFindMatch);
addSettingMapping("hoverHighlight", editorHoverHighlight);
addSettingMapping("wordHighlight", "editor.wordHighlightBackground");
addSettingMapping("wordHighlightStrong", "editor.wordHighlightStrongBackground");
addSettingMapping("findRangeHighlight", editorFindRangeHighlight);
addSettingMapping("findMatchHighlight", "peekViewResult.matchHighlightBackground");
addSettingMapping("referenceHighlight", "peekViewEditor.matchHighlightBackground");
addSettingMapping("lineHighlight", editorLineHighlight);
addSettingMapping("rangeHighlight", editorRangeHighlight);
addSettingMapping("caret", editorCursorForeground);
addSettingMapping("invisibles", editorWhitespaces);
addSettingMapping("guide", editorIndentGuide1);
addSettingMapping("activeGuide", editorActiveIndentGuide1);
const ansiColorMap = [
    "ansiBlack",
    "ansiRed",
    "ansiGreen",
    "ansiYellow",
    "ansiBlue",
    "ansiMagenta",
    "ansiCyan",
    "ansiWhite",
    "ansiBrightBlack",
    "ansiBrightRed",
    "ansiBrightGreen",
    "ansiBrightYellow",
    "ansiBrightBlue",
    "ansiBrightMagenta",
    "ansiBrightCyan",
    "ansiBrightWhite"
];
for (const color of ansiColorMap) {
    addSettingMapping(color, "terminal." + color);
}

export { convertSettings };
