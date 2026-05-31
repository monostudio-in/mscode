import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.service.js";
import { IInstantiationService } from "../../../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../../../common/contributions.js";
import { ILanguageModelToolsService } from "../languageModelToolsService.service.js";
export declare class BuiltinToolsContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "chat.builtinTools";
    constructor(toolsService: ILanguageModelToolsService, instantiationService: IInstantiationService, configurationService: IConfigurationService);
}
export declare const InternalFetchWebPageToolId = "vscode_fetchWebPage_internal";
