import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.service.js";
import { IConfigurationNode } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
export declare const editorConfiguration: Readonly<IConfigurationNode>;
export declare const notebookEditorConfiguration: Readonly<IConfigurationNode>;
export declare class CodeActionsContribution extends Disposable implements IWorkbenchContribution {
    private readonly languageFeatures;
    private readonly _onDidChangeSchemaContributions;
    private _allProvidedCodeActionKinds;
    constructor(keybindingService: IKeybindingService, languageFeatures: ILanguageFeaturesService);
    private getAllProvidedCodeActionKinds;
    private updateConfigurationSchema;
    private getKeybindingSchemaAdditions;
}
