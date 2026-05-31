
import { ContextMenuController } from '../../../../editor/contrib/contextmenu/browser/contextmenu.js';
import { SnippetController2 } from '../../../../editor/contrib/snippet/browser/snippetController2.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { MenuPreventer } from './menuPreventer.js';
import { SelectionClipboardContributionID } from './selectionClipboard.js';
import { TabCompletionController } from '../../snippets/browser/tabCompletion.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { registerThemingParticipant } from '../../../../platform/theme/common/themeService.js';
import '../../../../platform/theme/common/colorUtils.js';
import { selectionBackground } from '../../../../platform/theme/common/colors/baseColors.js';
import '../../../../platform/theme/common/colors/chartsColors.js';
import { editorSelectionBackground } from '../../../../platform/theme/common/colors/editorColors.js';
import { inputBackground, inputForeground } from '../../../../platform/theme/common/colors/inputColors.js';
import '../../../../platform/theme/common/colors/listColors.js';
import '../../../../platform/theme/common/colors/menuColors.js';
import '../../../../platform/theme/common/colors/minimapColors.js';
import '../../../../platform/theme/common/colors/miscColors.js';
import '../../../../platform/theme/common/colors/quickpickColors.js';
import '../../../../platform/theme/common/colors/searchColors.js';

function getSimpleEditorOptions(configurationService) {
    return {
        wordWrap: "on",
        overviewRulerLanes: 0,
        glyphMargin: false,
        lineNumbers: "off",
        folding: false,
        selectOnLineNumbers: false,
        hideCursorInOverviewRuler: true,
        selectionHighlight: false,
        scrollbar: {
            horizontal: "hidden",
            alwaysConsumeMouseWheel: false
        },
        lineDecorationsWidth: 0,
        overviewRulerBorder: false,
        scrollBeyondLastLine: false,
        renderLineHighlight: "none",
        fixedOverflowWidgets: true,
        acceptSuggestionOnEnter: "smart",
        dragAndDrop: false,
        revealHorizontalRightPadding: 5,
        minimap: {
            enabled: false
        },
        guides: {
            indentation: false
        },
        wordSegmenterLocales: configurationService.getValue("editor.wordSegmenterLocales"),
        accessibilitySupport: configurationService.getValue("editor.accessibilitySupport"),
        cursorBlinking: configurationService.getValue("editor.cursorBlinking"),
        editContext: configurationService.getValue("editor.editContext"),
        defaultColorDecorators: "never",
        allowVariableLineHeights: false,
        allowVariableFonts: false,
        allowVariableFontsInAccessibilityMode: false
    };
}
function getSimpleCodeEditorWidgetOptions() {
    return {
        isSimpleWidget: true,
        contributions: EditorExtensionsRegistry.getSomeEditorContributions([
            MenuPreventer.ID,
            SelectionClipboardContributionID,
            ContextMenuController.ID,
            SuggestController.ID,
            SnippetController2.ID,
            TabCompletionController.ID
        ])
    };
}
function setupSimpleEditorSelectionStyling(editorContainerSelector) {
    return registerThemingParticipant((theme, collector) => {
        const selectionBackgroundColor = theme.getColor(selectionBackground);
        if (selectionBackgroundColor) {
            const inputBackgroundColor = theme.getColor(inputBackground);
            if (inputBackgroundColor) {
                collector.addRule(
                    `${editorContainerSelector} .monaco-editor-background { background-color: ${inputBackgroundColor}; } `
                );
                collector.addRule(
                    `${editorContainerSelector} .monaco-editor .selected-text { background-color: ${( inputBackgroundColor.transparent(0.4))}; }`
                );
            }
            const inputForegroundColor = theme.getColor(inputForeground);
            if (inputForegroundColor) {
                collector.addRule(
                    `${editorContainerSelector} .monaco-editor .view-line span.inline-selected-text { color: ${inputForegroundColor}; }`
                );
            }
            collector.addRule(
                `${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${selectionBackgroundColor}; }`
            );
        } else {
            collector.addRule(
                `${editorContainerSelector} .monaco-editor .focused .selected-text { background-color: ${theme.getColor(editorSelectionBackground)}; }`
            );
        }
    });
}

export { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions, setupSimpleEditorSelectionStyling };
