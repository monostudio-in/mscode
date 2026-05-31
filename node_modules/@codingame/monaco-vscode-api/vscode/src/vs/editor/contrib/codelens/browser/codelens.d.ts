import { CancellationToken } from "../../../../base/common/cancellation.js";
import { ITextModel } from "../../../common/model.js";
import { CodeLens, CodeLensList, CodeLensProvider } from "../../../common/languages.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
export interface CodeLensItem {
    readonly symbol: CodeLens;
    readonly provider: CodeLensProvider;
}
export declare class CodeLensModel {
    static readonly Empty: CodeLensModel;
    lenses: CodeLensItem[];
    private _store;
    dispose(): void;
    get isDisposed(): boolean;
    add(list: CodeLensList, provider: CodeLensProvider): void;
}
export declare function getCodeLensModel(registry: LanguageFeatureRegistry<CodeLensProvider>, model: ITextModel, token: CancellationToken): Promise<CodeLensModel>;
