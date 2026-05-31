import { ICodeEditor, IDiffEditorConstructionOptions } from "../../editorBrowser.js";
import { ICodeEditorService } from "../../services/codeEditorService.service.js";
import { DiffEditorWidget, IDiffCodeEditorWidgetOptions } from "./diffEditorWidget.js";
import { IEditorOptions } from "../../../common/config/editorOptions.js";
import { IAccessibilitySignalService } from "../../../../platform/accessibilitySignal/browser/accessibilitySignalService.service.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
export declare class EmbeddedDiffEditorWidget extends DiffEditorWidget {
    private readonly _parentEditor;
    private readonly _overwriteOptions;
    constructor(domElement: HTMLElement, options: Readonly<IDiffEditorConstructionOptions>, codeEditorWidgetOptions: IDiffCodeEditorWidgetOptions, parentEditor: ICodeEditor, contextKeyService: IContextKeyService, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, accessibilitySignalService: IAccessibilitySignalService, editorProgressService: IEditorProgressService, keybindingService: IKeybindingService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged;
    updateOptions(newOptions: IEditorOptions): void;
}
