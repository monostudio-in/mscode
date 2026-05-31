
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';

var SearchCommandIds;
(function(SearchCommandIds) {
    SearchCommandIds["FindInFilesActionId"] = "workbench.action.findInFiles";
    SearchCommandIds["FocusActiveEditorCommandId"] = "search.action.focusActiveEditor";
    SearchCommandIds["FocusSearchFromResults"] = "search.action.focusSearchFromResults";
    SearchCommandIds["OpenMatch"] = "search.action.openResult";
    SearchCommandIds["OpenMatchToSide"] = "search.action.openResultToSide";
    SearchCommandIds["RemoveActionId"] = "search.action.remove";
    SearchCommandIds["CopyPathCommandId"] = "search.action.copyPath";
    SearchCommandIds["CopyMatchCommandId"] = "search.action.copyMatch";
    SearchCommandIds["CopyAllCommandId"] = "search.action.copyAll";
    SearchCommandIds["OpenInEditorCommandId"] = "search.action.openInEditor";
    SearchCommandIds["ClearSearchHistoryCommandId"] = "search.action.clearHistory";
    SearchCommandIds["FocusSearchListCommandID"] = "search.action.focusSearchList";
    SearchCommandIds["ReplaceActionId"] = "search.action.replace";
    SearchCommandIds["ReplaceAllInFileActionId"] = "search.action.replaceAllInFile";
    SearchCommandIds["ReplaceAllInFolderActionId"] = "search.action.replaceAllInFolder";
    SearchCommandIds["CloseReplaceWidgetActionId"] = "closeReplaceInFilesWidget";
    SearchCommandIds["ToggleCaseSensitiveCommandId"] = "toggleSearchCaseSensitive";
    SearchCommandIds["ToggleWholeWordCommandId"] = "toggleSearchWholeWord";
    SearchCommandIds["ToggleRegexCommandId"] = "toggleSearchRegex";
    SearchCommandIds["TogglePreserveCaseId"] = "toggleSearchPreserveCase";
    SearchCommandIds["AddCursorsAtSearchResults"] = "addCursorsAtSearchResults";
    SearchCommandIds["RevealInSideBarForSearchResults"] = "search.action.revealInSideBar";
    SearchCommandIds["ReplaceInFilesActionId"] = "workbench.action.replaceInFiles";
    SearchCommandIds["ShowAllSymbolsActionId"] = "workbench.action.showAllSymbols";
    SearchCommandIds["QuickTextSearchActionId"] = "workbench.action.quickTextSearch";
    SearchCommandIds["CancelSearchActionId"] = "search.action.cancel";
    SearchCommandIds["RefreshSearchResultsActionId"] = "search.action.refreshSearchResults";
    SearchCommandIds["FocusNextSearchResultActionId"] = "search.action.focusNextSearchResult";
    SearchCommandIds["FocusPreviousSearchResultActionId"] = "search.action.focusPreviousSearchResult";
    SearchCommandIds["ToggleSearchOnTypeActionId"] = "workbench.action.toggleSearchOnType";
    SearchCommandIds["CollapseSearchResultsActionId"] = "search.action.collapseSearchResults";
    SearchCommandIds["ExpandSearchResultsActionId"] = "search.action.expandSearchResults";
    SearchCommandIds["ExpandRecursivelyCommandId"] = "search.action.expandRecursively";
    SearchCommandIds["ClearSearchResultsActionId"] = "search.action.clearSearchResults";
    SearchCommandIds["GetSearchResultsActionId"] = "search.action.getSearchResults";
    SearchCommandIds["ViewAsTreeActionId"] = "search.action.viewAsTree";
    SearchCommandIds["ViewAsListActionId"] = "search.action.viewAsList";
    SearchCommandIds["ShowAIResultsActionId"] = "search.action.showAIResults";
    SearchCommandIds["HideAIResultsActionId"] = "search.action.hideAIResults";
    SearchCommandIds["SearchWithAIActionId"] = "search.action.searchWithAI";
    SearchCommandIds["ToggleQueryDetailsActionId"] = "workbench.action.search.toggleQueryDetails";
    SearchCommandIds["ExcludeFolderFromSearchId"] = "search.action.excludeFromSearch";
    SearchCommandIds["ExcludeFileTypeFromSearchId"] = "search.action.excludeFileTypeFromSearch";
    SearchCommandIds["IncludeFileTypeInSearchId"] = "search.action.includeFileTypeInSearch";
    SearchCommandIds["FocusNextInputActionId"] = "search.focus.nextInputBox";
    SearchCommandIds["FocusPreviousInputActionId"] = "search.focus.previousInputBox";
    SearchCommandIds["RestrictSearchToFolderId"] = "search.action.restrictSearchToFolder";
    SearchCommandIds["FindInFolderId"] = "filesExplorer.findInFolder";
    SearchCommandIds["FindInWorkspaceId"] = "filesExplorer.findInWorkspace";
})(SearchCommandIds || (SearchCommandIds = {}));
const SearchContext = {
    SearchViewVisibleKey: ( new RawContextKey("searchViewletVisible", true)),
    SearchViewFocusedKey: ( new RawContextKey("searchViewletFocus", false)),
    SearchResultListFocusedKey: ( new RawContextKey("searchResultListFocused", true)),
    InputBoxFocusedKey: ( new RawContextKey("inputBoxFocus", false)),
    SearchInputBoxFocusedKey: ( new RawContextKey("searchInputBoxFocus", false)),
    ReplaceInputBoxFocusedKey: ( new RawContextKey("replaceInputBoxFocus", false)),
    PatternIncludesFocusedKey: ( new RawContextKey("patternIncludesInputBoxFocus", false)),
    PatternExcludesFocusedKey: ( new RawContextKey("patternExcludesInputBoxFocus", false)),
    ReplaceActiveKey: ( new RawContextKey("replaceActive", false)),
    HasSearchResults: ( new RawContextKey("hasSearchResult", false)),
    FirstMatchFocusKey: ( new RawContextKey("firstMatchFocus", false)),
    FileMatchOrMatchFocusKey: ( new RawContextKey("fileMatchOrMatchFocus", false)),
    FileMatchOrFolderMatchFocusKey: ( new RawContextKey("fileMatchOrFolderMatchFocus", false)),
    FileMatchOrFolderMatchWithResourceFocusKey: ( new RawContextKey("fileMatchOrFolderMatchWithResourceFocus", false)),
    FileFocusKey: ( new RawContextKey("fileMatchFocus", false)),
    FolderFocusKey: ( new RawContextKey("folderMatchFocus", false)),
    ResourceFolderFocusKey: ( new RawContextKey("folderMatchWithResourceFocus", false)),
    IsEditableItemKey: ( new RawContextKey("isEditableItem", true)),
    MatchFocusKey: ( new RawContextKey("matchFocus", false)),
    SearchResultHeaderFocused: ( new RawContextKey("searchResultHeaderFocused", false)),
    ViewHasSearchPatternKey: ( new RawContextKey("viewHasSearchPattern", false)),
    ViewHasReplacePatternKey: ( new RawContextKey("viewHasReplacePattern", false)),
    ViewHasFilePatternKey: ( new RawContextKey("viewHasFilePattern", false)),
    ViewHasSomeCollapsibleKey: ( new RawContextKey("viewHasSomeCollapsibleResult", false)),
    InTreeViewKey: ( new RawContextKey("inTreeView", false)),
    hasAIResultProvider: ( new RawContextKey("hasAIResultProviderKey", false)),
    AIResultsTitle: ( new RawContextKey("aiResultsTitle", false)),
    AIResultsRequested: ( new RawContextKey("aiResultsRequested", false))
};

export { SearchCommandIds, SearchContext };
