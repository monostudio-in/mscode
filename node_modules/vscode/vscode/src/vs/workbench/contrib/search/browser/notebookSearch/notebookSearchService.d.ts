import { CancellationToken } from "../../../../../base/common/cancellation.js";
import { ResourceSet } from "../../../../../base/common/map.js";
import { IConfigurationService } from "../../../../../platform/configuration/common/configuration.service.js";
import { ILogService } from "../../../../../platform/log/common/log.service.js";
import { IUriIdentityService } from "../../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { INotebookService } from "../../../notebook/common/notebookService.service.js";
import { INotebookSearchService } from "../../common/notebookSearch.service.js";
import { ITextQuery, ISearchProgressItem, ISearchComplete } from "../../../../services/search/common/search.js";
import { ISearchService } from "../../../../services/search/common/search.service.js";
import { IEditorResolverService } from "../../../../services/editor/common/editorResolverService.service.js";
import { INotebookEditorService } from "../../../notebook/browser/services/notebookEditorService.service.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
export declare class NotebookSearchService implements INotebookSearchService {
    private readonly uriIdentityService;
    private readonly notebookEditorService;
    private readonly logService;
    private readonly notebookService;
    private readonly configurationService;
    private readonly editorResolverService;
    private readonly searchService;
    readonly _serviceBrand: undefined;
    private queryBuilder;
    constructor(uriIdentityService: IUriIdentityService, notebookEditorService: INotebookEditorService, logService: ILogService, notebookService: INotebookService, configurationService: IConfigurationService, editorResolverService: IEditorResolverService, searchService: ISearchService, instantiationService: IInstantiationService);
    notebookSearch(query: ITextQuery, token: CancellationToken | undefined, searchInstanceID: string, onProgress?: (result: ISearchProgressItem) => void): {
        openFilesToScan: ResourceSet;
        completeData: Promise<ISearchComplete>;
        allScannedFiles: Promise<ResourceSet>;
    };
    private doesFileExist;
    private getClosedNotebookResults;
    private getLocalNotebookResults;
    private getLocalNotebookWidgets;
}
