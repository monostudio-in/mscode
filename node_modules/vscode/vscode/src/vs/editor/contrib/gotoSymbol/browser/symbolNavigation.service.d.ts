import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { OneReference } from "./referencesModel.js";
export declare const ISymbolNavigationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ISymbolNavigationService>;
export interface ISymbolNavigationService {
    readonly _serviceBrand: undefined;
    reset(): void;
    put(anchor: OneReference): void;
    revealNext(source: ICodeEditor): Promise<any>;
}
