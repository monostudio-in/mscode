import { ILogService } from "@codingame/monaco-vscode-api/vscode/vs/platform/log/common/log.service";
import { MainThreadTimelineShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { TimelineChangeEvent, TimelineProviderDescriptor } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/timeline/common/timeline";
import { ITimelineService } from "@codingame/monaco-vscode-api/vscode/vs/workbench/contrib/timeline/common/timeline.service";
export declare class MainThreadTimeline implements MainThreadTimelineShape {
    private readonly logService;
    private readonly _timelineService;
    private readonly _proxy;
    private readonly _providerEmitters;
    constructor(context: IExtHostContext, logService: ILogService, _timelineService: ITimelineService);
    $registerTimelineProvider(provider: TimelineProviderDescriptor): void;
    $unregisterTimelineProvider(id: string): void;
    $emitTimelineChangeEvent(e: TimelineChangeEvent): void;
    dispose(): void;
}
