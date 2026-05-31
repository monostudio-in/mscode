import { IJSONSchema } from "../../../../../base/common/jsonSchema.js";
import { ExtensionIdentifier } from "../../../../../platform/extensions/common/extensions.js";
import { IProductService } from "../../../../../platform/product/common/productService.service.js";
import { IWorkbenchContribution } from "../../../../common/contributions.js";
import { ILanguageModelToolsService } from "./languageModelToolsService.service.js";
export interface IRawToolContribution {
    name: string;
    displayName: string;
    modelDescription: string;
    toolReferenceName?: string;
    legacyToolReferenceFullNames?: string[];
    icon?: string | {
        light: string;
        dark: string;
    };
    when?: string;
    tags?: string[];
    userDescription?: string;
    inputSchema?: IJSONSchema;
    canBeReferencedInPrompt?: boolean;
}
export interface IRawToolSetContribution {
    name: string;
    /**
     * @deprecated
     */
    referenceName?: string;
    legacyFullNames?: string[];
    description: string;
    icon?: string;
    tools: string[];
}
export declare function toToolSetKey(extensionIdentifier: ExtensionIdentifier, toolName: string): string;
export declare class LanguageModelToolsExtensionPointHandler implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.toolsExtensionPointHandler";
    private _registrationDisposables;
    constructor(productService: IProductService, languageModelToolsService: ILanguageModelToolsService);
}
