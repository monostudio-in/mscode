import { IDocumentDiffProvider } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/editor/common/diff/documentDiffProvider";
import { IDocumentDiffFactoryOptions } from "./diffProviderFactoryService.js";
export declare const IDiffProviderFactoryService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDiffProviderFactoryService>;
export interface IDiffProviderFactoryService {
    readonly _serviceBrand: undefined;
    createDiffProvider(options: IDocumentDiffFactoryOptions): IDocumentDiffProvider;
}
