import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IProgressService } from "../../../../platform/progress/common/progress.service.js";
import { ILogService } from "../../../../platform/log/common/log.service.js";
export declare class ExtensionActivationProgress implements IWorkbenchContribution {
    private readonly _listener;
    constructor(extensionService: IExtensionService, progressService: IProgressService, logService: ILogService);
    dispose(): void;
}
