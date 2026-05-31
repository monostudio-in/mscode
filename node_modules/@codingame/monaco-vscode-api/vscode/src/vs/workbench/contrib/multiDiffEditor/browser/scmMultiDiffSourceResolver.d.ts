import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI, UriComponents } from "../../../../base/common/uri.js";
import { IMultiDiffEditorOptions } from "../../../../editor/browser/widget/multiDiffEditor/multiDiffEditorWidgetImpl.js";
import { Action2 } from "../../../../platform/actions/common/actions.js";
import { IInstantiationService, ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IActivityService } from "../../../services/activity/common/activity.service.js";
import { IEditorService } from "../../../services/editor/common/editorService.service.js";
import { ISCMProvider } from "../../scm/common/scm.js";
import { ISCMService } from "../../scm/common/scm.service.js";
import { IMultiDiffSourceResolver, IResolvedMultiDiffSource } from "./multiDiffSourceResolverService.js";
import { IMultiDiffSourceResolverService } from "./multiDiffSourceResolverService.service.js";
export declare class ScmMultiDiffSourceResolver implements IMultiDiffSourceResolver {
    private readonly _scmService;
    private readonly _activityService;
    private static readonly _scheme;
    static getMultiDiffSourceUri(repositoryUri: string, groupId: string): URI;
    private static parseUri;
    constructor(_scmService: ISCMService, _activityService: IActivityService);
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(uri: URI): Promise<IResolvedMultiDiffSource>;
}
interface ScmHistoryItemUriFields {
    readonly repositoryId: string;
    readonly historyItemId: string;
    readonly historyItemParentId?: string;
    readonly historyItemDisplayId?: string;
}
export declare class ScmHistoryItemResolver implements IMultiDiffSourceResolver {
    private readonly _scmService;
    static readonly scheme = "scm-history-item";
    static getMultiDiffSourceUri(provider: ISCMProvider, historyItemId: string, historyItemParentId: string | undefined, historyItemDisplayId: string | undefined): URI;
    static parseUri(uri: URI): ScmHistoryItemUriFields | undefined;
    constructor(_scmService: ISCMService);
    canHandleUri(uri: URI): boolean;
    resolveDiffSource(uri: URI): Promise<IResolvedMultiDiffSource>;
}
export declare class ScmMultiDiffSourceResolverContribution extends Disposable {
    static readonly ID = "workbench.contrib.scmMultiDiffSourceResolver";
    constructor(instantiationService: IInstantiationService, multiDiffSourceResolverService: IMultiDiffSourceResolverService);
}
interface OpenScmGroupActionOptions {
    title: string;
    repositoryUri: UriComponents;
    resourceGroupId: string;
}
export declare class OpenScmGroupAction extends Action2 {
    static openMultiFileDiffEditor(editorService: IEditorService, label: string, repositoryRootUri: URI | undefined, resourceGroupId: string, options?: IMultiDiffEditorOptions): Promise<import("../../../common/editor.js").IEditorPane | undefined>;
    constructor();
    run(accessor: ServicesAccessor, options: OpenScmGroupActionOptions): Promise<void>;
}
export {};
