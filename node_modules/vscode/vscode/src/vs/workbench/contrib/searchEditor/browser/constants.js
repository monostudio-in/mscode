
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';

const InSearchEditor = ( new RawContextKey("inSearchEditor", false));
const SearchEditorScheme = "search-editor";
const SearchEditorWorkingCopyTypeId = "search/editor";
const SearchEditorFindMatchClass = "searchEditorFindMatch";
const SearchEditorID = "workbench.editor.searchEditor";
const OpenNewEditorCommandId = "search.action.openNewEditor";
const OpenEditorCommandId = "search.action.openEditor";
const ToggleSearchEditorContextLinesCommandId = "toggleSearchEditorContextLines";
const SearchEditorInputTypeId = "workbench.editorinputs.searchEditorInput";

export { InSearchEditor, OpenEditorCommandId, OpenNewEditorCommandId, SearchEditorFindMatchClass, SearchEditorID, SearchEditorInputTypeId, SearchEditorScheme, SearchEditorWorkingCopyTypeId, ToggleSearchEditorContextLinesCommandId };
