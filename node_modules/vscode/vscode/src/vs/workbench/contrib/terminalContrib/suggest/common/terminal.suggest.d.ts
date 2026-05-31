export declare enum TerminalSuggestCommandId {
    SelectPrevSuggestion = "workbench.action.terminal.selectPrevSuggestion",
    SelectPrevPageSuggestion = "workbench.action.terminal.selectPrevPageSuggestion",
    SelectNextSuggestion = "workbench.action.terminal.selectNextSuggestion",
    SelectNextPageSuggestion = "workbench.action.terminal.selectNextPageSuggestion",
    AcceptSelectedSuggestion = "workbench.action.terminal.acceptSelectedSuggestion",
    AcceptSelectedSuggestionEnter = "workbench.action.terminal.acceptSelectedSuggestionEnter",
    ChangeSelectionModeNever = "workbench.action.terminal.changeSelectionModeNever",
    ChangeSelectionModePartial = "workbench.action.terminal.changeSelectionModePartial",
    ChangeSelectionModeAlways = "workbench.action.terminal.changeSelectionModeAlways",
    HideSuggestWidget = "workbench.action.terminal.hideSuggestWidget",
    HideSuggestWidgetAndNavigateHistory = "workbench.action.terminal.hideSuggestWidgetAndNavigateHistory",
    TriggerSuggest = "workbench.action.terminal.triggerSuggest",
    ResetWidgetSize = "workbench.action.terminal.resetSuggestWidgetSize",
    ToggleDetails = "workbench.action.terminal.suggestToggleDetails",
    ToggleDetailsFocus = "workbench.action.terminal.suggestToggleDetailsFocus",
    ConfigureSettings = "workbench.action.terminal.configureSuggestSettings",
    LearnMore = "workbench.action.terminal.suggestLearnMore",
    ResetDiscoverability = "workbench.action.terminal.resetDiscoverability",
    ShowOnType = "workbench.action.terminal.showSuggestOnType",
    DoNotShowOnType = "workbench.action.terminal.doNotShowSuggestOnType"
}
export declare const defaultTerminalSuggestCommandsToSkipShell: TerminalSuggestCommandId[];
