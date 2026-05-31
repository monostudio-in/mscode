import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.service.js";
export declare class EditorStatusContribution extends Disposable implements IWorkbenchContribution {
    private readonly editorGroupService;
    static readonly ID = "workbench.contrib.editorStatus";
    constructor(editorGroupService: IEditorGroupsService);
    private createEditorStatus;
}
export declare class ChangeLanguageAction extends Action2 {
    static readonly ID = "workbench.action.editor.changeLanguageMode";
    constructor();
    run(accessor: ServicesAccessor, languageMode?: string): Promise<void>;
    private configureFileAssociation;
}
export declare class ChangeEOLAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ChangeEncodingAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
