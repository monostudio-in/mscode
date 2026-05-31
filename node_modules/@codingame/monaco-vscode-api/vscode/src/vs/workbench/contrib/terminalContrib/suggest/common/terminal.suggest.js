

var TerminalSuggestCommandId;
(function (TerminalSuggestCommandId) {
    TerminalSuggestCommandId["SelectPrevSuggestion"] = "workbench.action.terminal.selectPrevSuggestion";
    TerminalSuggestCommandId["SelectPrevPageSuggestion"] = "workbench.action.terminal.selectPrevPageSuggestion";
    TerminalSuggestCommandId["SelectNextSuggestion"] = "workbench.action.terminal.selectNextSuggestion";
    TerminalSuggestCommandId["SelectNextPageSuggestion"] = "workbench.action.terminal.selectNextPageSuggestion";
    TerminalSuggestCommandId["AcceptSelectedSuggestion"] = "workbench.action.terminal.acceptSelectedSuggestion";
    TerminalSuggestCommandId["AcceptSelectedSuggestionEnter"] = "workbench.action.terminal.acceptSelectedSuggestionEnter";
    TerminalSuggestCommandId["ChangeSelectionModeNever"] = "workbench.action.terminal.changeSelectionModeNever";
    TerminalSuggestCommandId["ChangeSelectionModePartial"] = "workbench.action.terminal.changeSelectionModePartial";
    TerminalSuggestCommandId["ChangeSelectionModeAlways"] = "workbench.action.terminal.changeSelectionModeAlways";
    TerminalSuggestCommandId["HideSuggestWidget"] = "workbench.action.terminal.hideSuggestWidget";
    TerminalSuggestCommandId["HideSuggestWidgetAndNavigateHistory"] = "workbench.action.terminal.hideSuggestWidgetAndNavigateHistory";
    TerminalSuggestCommandId["TriggerSuggest"] = "workbench.action.terminal.triggerSuggest";
    TerminalSuggestCommandId["ResetWidgetSize"] = "workbench.action.terminal.resetSuggestWidgetSize";
    TerminalSuggestCommandId["ToggleDetails"] = "workbench.action.terminal.suggestToggleDetails";
    TerminalSuggestCommandId["ToggleDetailsFocus"] = "workbench.action.terminal.suggestToggleDetailsFocus";
    TerminalSuggestCommandId["ConfigureSettings"] = "workbench.action.terminal.configureSuggestSettings";
    TerminalSuggestCommandId["LearnMore"] = "workbench.action.terminal.suggestLearnMore";
    TerminalSuggestCommandId["ResetDiscoverability"] = "workbench.action.terminal.resetDiscoverability";
    TerminalSuggestCommandId["ShowOnType"] = "workbench.action.terminal.showSuggestOnType";
    TerminalSuggestCommandId["DoNotShowOnType"] = "workbench.action.terminal.doNotShowSuggestOnType";
})(TerminalSuggestCommandId || (TerminalSuggestCommandId = {}));
const defaultTerminalSuggestCommandsToSkipShell = [
    TerminalSuggestCommandId.SelectPrevSuggestion,
    TerminalSuggestCommandId.SelectPrevPageSuggestion,
    TerminalSuggestCommandId.SelectNextSuggestion,
    TerminalSuggestCommandId.SelectNextPageSuggestion,
    TerminalSuggestCommandId.AcceptSelectedSuggestion,
    TerminalSuggestCommandId.AcceptSelectedSuggestionEnter,
    TerminalSuggestCommandId.HideSuggestWidget,
    TerminalSuggestCommandId.TriggerSuggest,
    TerminalSuggestCommandId.ToggleDetails,
    TerminalSuggestCommandId.ToggleDetailsFocus,
];

export { TerminalSuggestCommandId, defaultTerminalSuggestCommandsToSkipShell };
