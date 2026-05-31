

const VIEWLET_ID = 'workbench.view.scm';
const VIEW_PANE_ID = 'workbench.scm';
const REPOSITORIES_VIEW_PANE_ID = 'workbench.scm.repositories';
const HISTORY_VIEW_PANE_ID = 'workbench.scm.history';
var ViewMode;
(function (ViewMode) {
    ViewMode["List"] = "list";
    ViewMode["Tree"] = "tree";
})(ViewMode || (ViewMode = {}));
var InputValidationType;
(function (InputValidationType) {
    InputValidationType[InputValidationType["Error"] = 0] = "Error";
    InputValidationType[InputValidationType["Warning"] = 1] = "Warning";
    InputValidationType[InputValidationType["Information"] = 2] = "Information";
})(InputValidationType || (InputValidationType = {}));
var SCMInputChangeReason;
(function (SCMInputChangeReason) {
    SCMInputChangeReason[SCMInputChangeReason["HistoryPrevious"] = 0] = "HistoryPrevious";
    SCMInputChangeReason[SCMInputChangeReason["HistoryNext"] = 1] = "HistoryNext";
})(SCMInputChangeReason || (SCMInputChangeReason = {}));
var ISCMRepositorySortKey;
(function (ISCMRepositorySortKey) {
    ISCMRepositorySortKey["DiscoveryTime"] = "discoveryTime";
    ISCMRepositorySortKey["Name"] = "name";
    ISCMRepositorySortKey["Path"] = "path";
})(ISCMRepositorySortKey || (ISCMRepositorySortKey = {}));
var ISCMRepositorySelectionMode;
(function (ISCMRepositorySelectionMode) {
    ISCMRepositorySelectionMode["Single"] = "single";
    ISCMRepositorySelectionMode["Multiple"] = "multiple";
})(ISCMRepositorySelectionMode || (ISCMRepositorySelectionMode = {}));

export { HISTORY_VIEW_PANE_ID, ISCMRepositorySelectionMode, ISCMRepositorySortKey, InputValidationType, REPOSITORIES_VIEW_PANE_ID, SCMInputChangeReason, VIEWLET_ID, VIEW_PANE_ID, ViewMode };
