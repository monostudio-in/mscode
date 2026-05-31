import { Disposable } from "../../../../base/common/lifecycle.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { ISearchService } from "../../../services/search/common/search.service.js";
import { IChatContextPickService } from "../../chat/browser/attachments/chatContextPickService.service.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
export declare class SearchChatContextContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contributions.searchChatContextContribution";
    constructor(instantiationService: IInstantiationService, chatContextPickService: IChatContextPickService);
}
export declare function searchFilesAndFolders(workspace: URI, pattern: string, fuzzyMatch: boolean, token: CancellationToken | undefined, cacheKey: string | undefined, configurationService: IConfigurationService, searchService: ISearchService): Promise<{
    folders: URI[];
    files: URI[];
}>;
export declare function getTopLevelFolders(workspaces: URI[], fileService: IFileService): Promise<URI[]>;
