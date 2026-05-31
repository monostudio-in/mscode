import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { MainThreadTreeViewsShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { ITreeItem, IRevealOptions, IViewBadge } from "@codingame/monaco-vscode-api/vscode/vs/workbench/common/views";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { INotificationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/notification/common/notification.service";
import { IExtensionService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/extensions/common/extensions.service";
import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { VSBuffer } from "@codingame/monaco-vscode-api/vscode/vs/base/common/buffer";
import { IMarkdownString } from "@codingame/monaco-vscode-api/vscode/vs/base/common/htmlContent";
import { IViewsService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/services/views/common/viewsService.service";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
export declare class MainThreadTreeViews extends Disposable implements MainThreadTreeViewsShape {
    private readonly viewsService;
    private readonly notificationService;
    private readonly extensionService;
    private readonly logService;
    private readonly telemetryService;
    private readonly _proxy;
    private readonly _dataProviders;
    private readonly _dndControllers;
    constructor(extHostContext: IExtHostContext, viewsService: IViewsService, notificationService: INotificationService, extensionService: IExtensionService, logService: ILogService, telemetryService: ITelemetryService);
    $registerTreeViewDataProvider(treeViewId: string, options: {
        showCollapseAll: boolean;
        canSelectMany: boolean;
        dropMimeTypes: string[];
        dragMimeTypes: string[];
        hasHandleDrag: boolean;
        hasHandleDrop: boolean;
        manuallyManageCheckboxes: boolean;
    }): Promise<void>;
    $reveal(treeViewId: string, itemInfo: {
        item: ITreeItem;
        parentChain: ITreeItem[];
    } | undefined, options: IRevealOptions): Promise<void>;
    $refresh(treeViewId: string, itemsToRefreshByHandle: {
        [treeItemHandle: string]: ITreeItem;
    }): Promise<void>;
    $setMessage(treeViewId: string, message: string | IMarkdownString): void;
    $setTitle(treeViewId: string, title: string, description: string | undefined): void;
    $setBadge(treeViewId: string, badge: IViewBadge | undefined): void;
    $resolveDropFileData(destinationViewId: string, requestId: number, dataItemId: string): Promise<VSBuffer>;
    $disposeTree(treeViewId: string): Promise<void>;
    $logResolveTreeNodeFailure(extensionId: string): void;
    private reveal;
    private registerListeners;
    private getTreeView;
    dispose(): void;
}
