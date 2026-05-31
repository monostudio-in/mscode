import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { IConfigurationService } from "@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service";
import { IEnvironmentService } from "@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service";
import { IProductService } from "@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service";
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/gdprTypings";
import { ITelemetryData } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry";
import { ITelemetryService } from "@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { MainThreadTelemetryShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
export declare class MainThreadTelemetry extends Disposable implements MainThreadTelemetryShape {
    private readonly _telemetryService;
    private readonly _configurationService;
    private readonly _environmentService;
    private readonly _productService;
    private readonly _proxy;
    private static readonly _name;
    constructor(extHostContext: IExtHostContext, _telemetryService: ITelemetryService, _configurationService: IConfigurationService, _environmentService: IEnvironmentService, _productService: IProductService);
    private get telemetryLevel();
    $publicLog(eventName: string, data?: ITelemetryData): void;
    $publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(eventName: string, data?: StrictPropertyCheck<T, E>): void;
}
