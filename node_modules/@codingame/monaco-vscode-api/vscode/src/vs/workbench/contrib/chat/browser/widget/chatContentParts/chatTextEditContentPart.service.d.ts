import { IReference } from "../../../../../../base/common/lifecycle.js";
import { IResolvedTextEditorModel } from "@codingame/monaco-vscode-model-service-override/vscode/vs/editor/common/services/resolverService";
import { IChatTextEditGroup } from "../../../common/model/chatModel.js";
import { IChatResponseViewModel } from "../../../common/model/chatViewModel.js";
export declare const ICodeCompareModelService: import("../../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICodeCompareModelService>;
export interface ICodeCompareModelService {
    _serviceBrand: undefined;
    createModel(response: IChatResponseViewModel, chatTextEdit: IChatTextEditGroup): Promise<IReference<{
        originalSha1: string;
        original: IResolvedTextEditorModel;
        modified: IResolvedTextEditorModel;
    }>>;
}
