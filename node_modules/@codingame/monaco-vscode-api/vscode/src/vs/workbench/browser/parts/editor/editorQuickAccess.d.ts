import { IQuickPickSeparator, IQuickPickItemWithResource, IQuickPick } from "../../../../platform/quickinput/common/quickInput.js";
import { PickerQuickAccessProvider, IPickerQuickAccessItem } from "../../../../platform/quickinput/browser/pickerQuickAccess.js";
import { IEditorGroupsService } from "../../../services/editor/common/editorGroupsService.service.js";
import { IEditorIdentifier, GroupIdentifier } from "../../../common/editor.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { IModelService } from "../../../../editor/common/services/model.service.js";
import { ILanguageService } from "../../../../editor/common/languages/language.service.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
interface IEditorQuickPickItem extends IQuickPickItemWithResource, IPickerQuickAccessItem {
    groupId: GroupIdentifier;
}
export declare abstract class BaseEditorQuickAccessProvider extends PickerQuickAccessProvider<IEditorQuickPickItem> {
    protected readonly editorGroupService: IEditorGroupsService;
    protected readonly editorService: IEditorService;
    private readonly modelService;
    private readonly languageService;
    private readonly pickState;
    constructor(prefix: string, editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    provide(picker: IQuickPick<IEditorQuickPickItem, {
        useSeparators: true;
    }>, token: CancellationToken): IDisposable;
    protected _getPicks(filter: string): Array<IEditorQuickPickItem | IQuickPickSeparator>;
    private doGetEditorPickItems;
    protected abstract doGetEditors(): IEditorIdentifier[];
}
export declare class ActiveGroupEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByAppearanceQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export declare class AllEditorsByMostRecentlyUsedQuickAccess extends BaseEditorQuickAccessProvider {
    static PREFIX: string;
    constructor(editorGroupService: IEditorGroupsService, editorService: IEditorService, modelService: IModelService, languageService: ILanguageService);
    protected doGetEditors(): IEditorIdentifier[];
}
export {};
