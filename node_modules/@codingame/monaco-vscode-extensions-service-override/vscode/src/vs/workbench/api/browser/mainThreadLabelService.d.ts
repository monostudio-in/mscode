import { Disposable } from "@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle";
import { ResourceLabelFormatter } from "@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label";
import { ILabelService } from "@codingame/monaco-vscode-api/vscode/vs/platform/label/common/label.service";
import { MainThreadLabelServiceShape } from "@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
export declare class MainThreadLabelService extends Disposable implements MainThreadLabelServiceShape {
    private readonly _labelService;
    private readonly _resourceLabelFormatters;
    constructor(_: IExtHostContext, _labelService: ILabelService);
    $registerResourceLabelFormatter(handle: number, formatter: ResourceLabelFormatter): void;
    $unregisterResourceLabelFormatter(handle: number): void;
}
