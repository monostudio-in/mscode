import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ILanguageStatus } from "@codingame/monaco-vscode-languages-service-override/vscode/vs/workbench/services/languageStatus/common/languageStatusService";
export declare const ILanguageStatusService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ILanguageStatusService>;
export interface ILanguageStatusService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    addStatus(status: ILanguageStatus): IDisposable;
    getLanguageStatus(model: ITextModel): ILanguageStatus[];
}
