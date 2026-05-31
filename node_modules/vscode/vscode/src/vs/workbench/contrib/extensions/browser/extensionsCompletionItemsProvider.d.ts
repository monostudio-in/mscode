import { Disposable } from "../../../../base/common/lifecycle.js";
import { IExtensionManagementService } from "../../../../platform/extensionManagement/common/extensionManagement.service.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.service.js";
export declare class ExtensionsCompletionItemsProvider extends Disposable implements IWorkbenchContribution {
    private readonly extensionManagementService;
    constructor(extensionManagementService: IExtensionManagementService, languageFeaturesService: ILanguageFeaturesService);
    private provideSupportUntrustedWorkspacesExtensionProposals;
}
