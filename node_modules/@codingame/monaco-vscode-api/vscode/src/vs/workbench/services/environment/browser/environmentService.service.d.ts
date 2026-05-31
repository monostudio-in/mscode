import { IWorkbenchConstructionOptions } from "../../../browser/web.api.js";
import { IWorkbenchEnvironmentService } from "../common/environmentService.service.js";
export declare const IBrowserWorkbenchEnvironmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserWorkbenchEnvironmentService>;
/**
* A subclass of the `IWorkbenchEnvironmentService` to be used only environments
* where the web API is available (browsers, Electron).
*/
export interface IBrowserWorkbenchEnvironmentService extends IWorkbenchEnvironmentService {
    /**
    * Options used to configure the workbench.
    */
    readonly options?: IWorkbenchConstructionOptions;
    /**
    * Gets whether a resolver extension is expected for the environment.
    */
    readonly expectsResolverExtension: boolean;
}
