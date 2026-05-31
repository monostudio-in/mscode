

var TerminalFindCommandId;
(function (TerminalFindCommandId) {
    TerminalFindCommandId["FindFocus"] = "workbench.action.terminal.focusFind";
    TerminalFindCommandId["FindHide"] = "workbench.action.terminal.hideFind";
    TerminalFindCommandId["FindNext"] = "workbench.action.terminal.findNext";
    TerminalFindCommandId["FindPrevious"] = "workbench.action.terminal.findPrevious";
    TerminalFindCommandId["ToggleFindRegex"] = "workbench.action.terminal.toggleFindRegex";
    TerminalFindCommandId["ToggleFindWholeWord"] = "workbench.action.terminal.toggleFindWholeWord";
    TerminalFindCommandId["ToggleFindCaseSensitive"] = "workbench.action.terminal.toggleFindCaseSensitive";
    TerminalFindCommandId["SearchWorkspace"] = "workbench.action.terminal.searchWorkspace";
})(TerminalFindCommandId || (TerminalFindCommandId = {}));
const defaultTerminalFindCommandToSkipShell = [
    TerminalFindCommandId.FindFocus,
    TerminalFindCommandId.FindHide,
    TerminalFindCommandId.FindNext,
    TerminalFindCommandId.FindPrevious,
    TerminalFindCommandId.ToggleFindRegex,
    TerminalFindCommandId.ToggleFindWholeWord,
    TerminalFindCommandId.ToggleFindCaseSensitive,
    TerminalFindCommandId.SearchWorkspace,
];

export { TerminalFindCommandId, defaultTerminalFindCommandToSkipShell };
