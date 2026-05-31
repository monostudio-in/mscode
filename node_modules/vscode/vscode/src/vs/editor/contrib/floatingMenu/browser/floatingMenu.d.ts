import { Disposable } from "../../../../base/common/lifecycle.js";
import { IObservable } from "../../../../base/common/observable.js";
import { URI } from "../../../../base/common/uri.js";
import { MenuId } from "../../../../platform/actions/common/actions.js";
import { IMenuService } from "../../../../platform/actions/common/actions.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
export declare class FloatingEditorToolbar extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.floatingToolbar";
    constructor(editor: ICodeEditor, instantiationService: IInstantiationService, keybindingService: IKeybindingService, menuService: IMenuService);
}
export declare class FloatingEditorToolbarWidget extends Disposable {
    readonly element: HTMLElement;
    readonly hasActions: IObservable<boolean>;
    constructor(_menuId: MenuId, _scopedContextKeyService: IContextKeyService, _toolbarContext: IObservable<URI | undefined>, instantiationService: IInstantiationService, keybindingService: IKeybindingService, menuService: IMenuService);
}
