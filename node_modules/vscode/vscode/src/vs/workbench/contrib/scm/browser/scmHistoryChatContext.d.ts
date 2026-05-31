import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { IModelService } from "../../../../editor/common/services/model.service.js";
import { ITextModelContentProvider } from "@codingame/monaco-vscode-model-service-override/vscode/vs/editor/common/services/resolverService";
import { ITextModelService } from "../../../../editor/common/services/resolverService.service.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IChatContextPickService } from "../../chat/browser/attachments/chatContextPickService.service.js";
import { ISCMHistoryItem } from "../common/history.js";
import { ISCMService } from "../common/scm.service.js";
export interface SCMHistoryItemTransferData {
    readonly name: string;
    readonly resource: UriComponents;
    readonly historyItem: ISCMHistoryItem;
}
export declare function extractSCMHistoryItemDropData(e: DragEvent): SCMHistoryItemTransferData[] | undefined;
export declare class SCMHistoryItemContextContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.chat.scmHistoryItemContextContribution";
    constructor(contextPickService: IChatContextPickService, instantiationService: IInstantiationService, textModelResolverService: ITextModelService);
}
export interface ScmHistoryItemChangeRangeUriFields {
    readonly repositoryId: string;
    readonly start: string;
    readonly end: string;
}
export declare class SCMHistoryItemChangeRangeContentProvider implements ITextModelContentProvider {
    private readonly _modelService;
    private readonly _scmService;
    static readonly scheme = "scm-history-item-change-range";
    constructor(_modelService: IModelService, _scmService: ISCMService);
    provideTextContent(resource: URI): Promise<ITextModel | null>;
    private _parseUri;
}
