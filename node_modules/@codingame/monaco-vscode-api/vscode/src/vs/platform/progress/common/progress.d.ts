import { IAction } from "../../../base/common/actions.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { INotificationSource, NotificationPriority } from "../../notification/common/notification.js";
import { IProgressService } from "./progress.service.js";
export interface IProgressIndicator {
    /**
     * Show progress customized with the provided flags.
     */
    show(infinite: true, delay?: number): IProgressRunner;
    show(total: number, delay?: number): IProgressRunner;
    /**
     * Indicate progress for the duration of the provided promise. Progress will stop in
     * any case of promise completion, error or cancellation.
     */
    showWhile(promise: Promise<unknown>, delay?: number): Promise<void>;
}
export declare enum ProgressLocation {
    Explorer = 1,
    Scm = 3,
    Extensions = 5,
    Window = 10,
    Notification = 15,
    Dialog = 20
}
export interface IProgressOptions {
    readonly location: ProgressLocation | string;
    readonly title?: string;
    readonly source?: string | INotificationSource;
    readonly total?: number;
    readonly cancellable?: boolean | string;
    readonly buttons?: string[];
}
export interface IProgressNotificationOptions extends IProgressOptions {
    readonly location: ProgressLocation.Notification;
    readonly primaryActions?: readonly IAction[];
    readonly secondaryActions?: readonly IAction[];
    readonly delay?: number;
    readonly priority?: NotificationPriority;
    readonly type?: "loading" | "syncing";
}
export interface IProgressDialogOptions extends IProgressOptions {
    readonly delay?: number;
    readonly detail?: string;
    readonly sticky?: boolean;
}
export interface IProgressWindowOptions extends IProgressOptions {
    readonly location: ProgressLocation.Window;
    readonly command?: string;
    readonly type?: "loading" | "syncing";
}
export interface IProgressCompositeOptions extends IProgressOptions {
    readonly location: ProgressLocation.Explorer | ProgressLocation.Extensions | ProgressLocation.Scm | string;
    readonly delay?: number;
}
export interface IProgressStep {
    message?: string;
    increment?: number;
    total?: number;
}
export interface IProgressRunner {
    total(value: number): void;
    worked(value: number): void;
    done(): void;
}
export declare const emptyProgressRunner: Readonly<IProgressRunner>;
export interface IProgress<T> {
    report(item: T): void;
}
export declare class Progress<T> implements IProgress<T> {
    private callback;
    static readonly None: Readonly<IProgress<unknown>>;
    private _value?;
    get value(): T | undefined;
    constructor(callback: (data: T) => unknown);
    report(item: T): void;
}
/**
 * A helper to show progress during a long running operation. If the operation
 * is started multiple times, only the last invocation will drive the progress.
 */
export interface IOperation {
    id: number;
    isCurrent: () => boolean;
    token: CancellationToken;
    stop(): void;
}
/**
 * RAII-style progress instance that allows imperative reporting and hides
 * once `dispose()` is called.
 */
export declare class UnmanagedProgress extends Disposable {
    private readonly deferred;
    private reporter?;
    private lastStep?;
    constructor(options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, progressService: IProgressService);
    report(step: IProgressStep): void;
}
export declare class LongRunningOperation extends Disposable {
    private progressIndicator;
    private currentOperationId;
    private readonly currentOperationDisposables;
    private currentProgressRunner;
    private currentProgressTimeout;
    constructor(progressIndicator: IProgressIndicator);
    start(progressDelay: number): IOperation;
    stop(): void;
    private doStop;
}
