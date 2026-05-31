import { Disposable } from "../../../../base/common/lifecycle.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.service.js";
import { IConfigurationNode } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
export declare const editorConfiguration: Readonly<IConfigurationNode>;
export declare class DropOrPasteSchemaContribution extends Disposable implements IWorkbenchContribution {
    private readonly languageFeatures;
    static ID: string;
    private readonly _onDidChangeSchemaContributions;
    private _allProvidedDropKinds;
    private _allProvidedPasteKinds;
    constructor(keybindingService: IKeybindingService, languageFeatures: ILanguageFeaturesService);
    private updateProvidedKinds;
    private updateConfigurationSchema;
    private getKeybindingSchemaAdditions;
}
