

var TerminalAccessibilityCommandId;
(function (TerminalAccessibilityCommandId) {
    TerminalAccessibilityCommandId["FocusAccessibleBuffer"] = "workbench.action.terminal.focusAccessibleBuffer";
    TerminalAccessibilityCommandId["AccessibleBufferGoToNextCommand"] = "workbench.action.terminal.accessibleBufferGoToNextCommand";
    TerminalAccessibilityCommandId["AccessibleBufferGoToPreviousCommand"] = "workbench.action.terminal.accessibleBufferGoToPreviousCommand";
    TerminalAccessibilityCommandId["ScrollToBottomAccessibleView"] = "workbench.action.terminal.scrollToBottomAccessibleView";
    TerminalAccessibilityCommandId["ScrollToTopAccessibleView"] = "workbench.action.terminal.scrollToTopAccessibleView";
})(TerminalAccessibilityCommandId || (TerminalAccessibilityCommandId = {}));
const defaultTerminalAccessibilityCommandsToSkipShell = [
    TerminalAccessibilityCommandId.FocusAccessibleBuffer
];

export { TerminalAccessibilityCommandId, defaultTerminalAccessibilityCommandsToSkipShell };
