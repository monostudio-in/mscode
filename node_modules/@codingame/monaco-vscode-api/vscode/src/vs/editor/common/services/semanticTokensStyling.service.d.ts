import { SemanticTokensProviderStyling } from "./semanticTokensProviderStyling.js";
import { DocumentTokensProvider } from "./semanticTokensStyling.js";
export declare const ISemanticTokensStylingService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISemanticTokensStylingService>;
export interface ISemanticTokensStylingService {
    readonly _serviceBrand: undefined;
    getStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
}
