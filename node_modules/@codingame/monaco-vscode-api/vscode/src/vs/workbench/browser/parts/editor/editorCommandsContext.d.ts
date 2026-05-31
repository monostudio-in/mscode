import { IListService } from "../../../../platform/list/browser/listService.service.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IEditorGroup } from "../../../services/editor/common/editorGroupsService.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
export interface IResolvedEditorCommandsContext {
    readonly groupedEditors: {
        readonly group: IEditorGroup;
        readonly editors: EditorInput[];
    }[];
    readonly preserveFocus: boolean;
}
export declare function resolveCommandsContext(commandArgs: unknown[], editorService: IEditorService, editorGroupsService: IEditorGroupsService, listService: IListService): IResolvedEditorCommandsContext;
