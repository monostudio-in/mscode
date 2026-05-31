import { Disposable } from "../../../../base/common/lifecycle.js";
import { IWorkspaceTrustManagementService } from "../../../../platform/workspace/common/workspaceTrust.service.js";
import { IWorkspaceTrustEnablementService } from "../../../../platform/workspace/common/workspaceTrust.service.js";
import { IWorkbenchContribution } from "../../../common/contributions.js";
import { IWorkbenchEnvironmentService } from "../../../services/environment/common/environmentService.service.js";
import { IWorkbenchExtensionEnablementService } from "../../../services/extensionManagement/common/extensionManagement.service.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.service.js";
import { IHostService } from "../../../services/host/browser/host.service.js";
export declare class ExtensionEnablementWorkspaceTrustTransitionParticipant extends Disposable implements IWorkbenchContribution {
    constructor(extensionService: IExtensionService, hostService: IHostService, environmentService: IWorkbenchEnvironmentService, extensionEnablementService: IWorkbenchExtensionEnablementService, workspaceTrustEnablementService: IWorkspaceTrustEnablementService, workspaceTrustManagementService: IWorkspaceTrustManagementService);
}
