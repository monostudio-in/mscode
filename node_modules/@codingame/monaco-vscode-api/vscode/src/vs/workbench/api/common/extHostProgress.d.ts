import { ProgressOptions } from "vscode";
import { ExtHostProgressShape } from "./extHost.protocol.js";
import { Progress, IProgressStep } from "../../../platform/progress/common/progress.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { IExtensionDescription } from "../../../platform/extensions/common/extensions.js";
import { INotificationSource } from "../../../platform/notification/common/notification.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export interface IExtHostProgress extends ExtHostProgress {
}
export declare const IExtHostProgress: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostProgress>;
export declare class ExtHostProgress implements ExtHostProgressShape {
    readonly _serviceBrand: undefined;
    private _proxy;
    private _handles;
    private _mapHandleToCancellationSource;
    constructor(extHostRpc: IExtHostRpcService);
    withProgress<R>(extension: IExtensionDescription, options: ProgressOptions, task: (progress: Progress<IProgressStep>, token: CancellationToken) => Thenable<R>): Promise<R>;
    withProgressFromSource<R>(source: string | INotificationSource, options: ProgressOptions, task: (progress: Progress<IProgressStep>, token: CancellationToken) => Thenable<R>): Promise<R>;
    private _withProgress;
    $acceptProgressCanceled(handle: number): void;
}
