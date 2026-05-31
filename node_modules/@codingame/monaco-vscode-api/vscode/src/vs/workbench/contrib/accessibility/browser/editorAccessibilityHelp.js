
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.service.js';
import { EditorOption } from '../../../../editor/common/config/editorOptions.js';
import { AccessibilityHelpNLS } from '../../../../editor/common/standaloneStrings.js';
import { ICommandService } from '../../../../platform/commands/common/commands.service.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.service.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.service.js';
import { AccessibilityHelpAction } from './accessibleViewActions.js';
import { ChatContextKeys } from '../../chat/common/actions/chatContextKeys.js';
import { CommentAccessibilityHelpNLS } from '../../comments/browser/commentsAccessibility.js';
import { CommentContextKeys } from '../../comments/common/commentContextKeys.js';
import { NEW_UNTITLED_FILE_COMMAND_ID } from '../../files/browser/fileConstants.js';
import { AccessibleViewProviderId, AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.service.js';
import { AccessibilityVerbositySettingId } from './accessibilityConfiguration.js';
import { ctxHasEditorModification, ctxHasRequestInProgress } from '../../chat/browser/chatEditing/chatEditingEditorContextKeys.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.service.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.service.js';

class EditorAccessibilityHelpContribution extends Disposable {
    constructor() {
        super();
        this._register(
            AccessibilityHelpAction.addImplementation(90, "editor", async accessor => {
                const codeEditorService = accessor.get(ICodeEditorService);
                const accessibleViewService = accessor.get(IAccessibleViewService);
                const instantiationService = accessor.get(IInstantiationService);
                const commandService = accessor.get(ICommandService);
                let codeEditor = codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor();
                if (!codeEditor) {
                    await commandService.executeCommand(NEW_UNTITLED_FILE_COMMAND_ID);
                    codeEditor = codeEditorService.getActiveCodeEditor();
                }
                accessibleViewService.show(
                    instantiationService.createInstance(EditorAccessibilityHelpProvider, codeEditor)
                );
            })
        );
    }
}
let EditorAccessibilityHelpProvider = class EditorAccessibilityHelpProvider extends Disposable {
    onClose() {
        this._editor.focus();
    }
    constructor(
        _editor,
        _keybindingService,
        _contextKeyService,
        accessibilityService,
        _configurationService
    ) {
        super();
        this._editor = _editor;
        this._keybindingService = _keybindingService;
        this._contextKeyService = _contextKeyService;
        this.accessibilityService = accessibilityService;
        this._configurationService = _configurationService;
        this.id = AccessibleViewProviderId.Editor;
        this.options = {
            type: AccessibleViewType.Help,
            readMoreUrl: "https://go.microsoft.com/fwlink/?linkid=851010"
        };
        this.verbositySettingKey = AccessibilityVerbositySettingId.Editor;
    }
    provideContent() {
        const options = this._editor.getOptions();
        const content = [];
        if (options.get(EditorOption.inDiffEditor)) {
            if (options.get(EditorOption.readOnly)) {
                content.push(AccessibilityHelpNLS.readonlyDiffEditor);
            } else {
                content.push(AccessibilityHelpNLS.editableDiffEditor);
            }
        } else {
            if (options.get(EditorOption.readOnly)) {
                content.push(AccessibilityHelpNLS.readonlyEditor);
            } else {
                content.push(AccessibilityHelpNLS.editableEditor);
            }
        }
        if (this.accessibilityService.isScreenReaderOptimized() && this._configurationService.getValue("accessibility.windowTitleOptimized")) {
            content.push(AccessibilityHelpNLS.defaultWindowTitleIncludesEditorState);
        } else {
            content.push(AccessibilityHelpNLS.defaultWindowTitleExcludingEditorState);
        }
        content.push(AccessibilityHelpNLS.toolbar);
        const chatEditInfo = getChatEditInfo(this._keybindingService, this._contextKeyService, this._editor);
        if (chatEditInfo) {
            content.push(chatEditInfo);
        }
        content.push(AccessibilityHelpNLS.listSignalSounds);
        content.push(AccessibilityHelpNLS.listAlerts);
        content.push(AccessibilityHelpNLS.announceCursorPosition);
        content.push(AccessibilityHelpNLS.focusNotifications);
        const chatCommandInfo = getChatCommandInfo(this._keybindingService, this._contextKeyService);
        if (chatCommandInfo) {
            content.push(chatCommandInfo);
        }
        const commentCommandInfo = getCommentCommandInfo(this._keybindingService, this._contextKeyService, this._editor);
        if (commentCommandInfo) {
            content.push(commentCommandInfo);
        }
        content.push(AccessibilityHelpNLS.suggestActions);
        content.push(AccessibilityHelpNLS.acceptSuggestAction);
        content.push(AccessibilityHelpNLS.toggleSuggestionFocus);
        if (options.get(EditorOption.stickyScroll).enabled) {
            content.push(AccessibilityHelpNLS.stickScroll);
        }
        if (options.get(EditorOption.tabFocusMode)) {
            content.push(AccessibilityHelpNLS.tabFocusModeOnMsg);
        } else {
            content.push(AccessibilityHelpNLS.tabFocusModeOffMsg);
        }
        content.push(AccessibilityHelpNLS.codeFolding);
        content.push(AccessibilityHelpNLS.intellisense);
        content.push(AccessibilityHelpNLS.showOrFocusHover);
        content.push(AccessibilityHelpNLS.goToSymbol);
        content.push(AccessibilityHelpNLS.startDebugging);
        content.push(AccessibilityHelpNLS.setBreakpoint);
        content.push(AccessibilityHelpNLS.debugExecuteSelection);
        content.push(AccessibilityHelpNLS.addToWatch);
        return content.join("\n");
    }
};
EditorAccessibilityHelpProvider = ( __decorate([( __param(1, IKeybindingService)), ( __param(2, IContextKeyService)), ( __param(3, IAccessibilityService)), ( __param(4, IConfigurationService))], EditorAccessibilityHelpProvider));
function getCommentCommandInfo(keybindingService, contextKeyService, editor) {
    const editorContext = contextKeyService.getContext(editor.getDomNode());
    if (editorContext.getValue(CommentContextKeys.activeEditorHasCommentingRange.key)) {
        return [
            CommentAccessibilityHelpNLS.intro,
            CommentAccessibilityHelpNLS.addComment,
            CommentAccessibilityHelpNLS.nextCommentThread,
            CommentAccessibilityHelpNLS.previousCommentThread,
            CommentAccessibilityHelpNLS.nextRange,
            CommentAccessibilityHelpNLS.previousRange
        ].join("\n");
    }
    return;
}
function getChatCommandInfo(keybindingService, contextKeyService) {
    if (ChatContextKeys.enabled.getValue(contextKeyService)) {
        return [AccessibilityHelpNLS.quickChat, AccessibilityHelpNLS.startInlineChat].join("\n");
    }
    return;
}
function getChatEditInfo(keybindingService, contextKeyService, editor) {
    const editorContext = contextKeyService.getContext(editor.getDomNode());
    if (editorContext.getValue(ctxHasEditorModification.key)) {
        return AccessibilityHelpNLS.chatEditorModification + "\n" + AccessibilityHelpNLS.chatEditActions;
    } else if (editorContext.getValue(ctxHasRequestInProgress.key)) {
        return AccessibilityHelpNLS.chatEditorRequestInProgress;
    }
    return;
}

export { EditorAccessibilityHelpContribution, getChatCommandInfo, getChatEditInfo, getCommentCommandInfo };
