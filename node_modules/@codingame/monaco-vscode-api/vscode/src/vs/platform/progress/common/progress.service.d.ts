import { IProgressOptions, IProgressDialogOptions, IProgressNotificationOptions, IProgressWindowOptions, IProgressCompositeOptions, IProgress, IProgressStep, type IProgressIndicator } from "./progress.js";
export declare const IProgressService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IProgressService>;
/**
* A progress service that can be used to report progress to various locations of the UI.
*/
export interface IProgressService {
    readonly _serviceBrand: undefined;
    withProgress<R>(options: IProgressOptions | IProgressDialogOptions | IProgressNotificationOptions | IProgressWindowOptions | IProgressCompositeOptions, task: (progress: IProgress<IProgressStep>) => Promise<R>, onDidCancel?: (choice?: number) => void): Promise<R>;
}
export declare const IEditorProgressService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEditorProgressService>;
/**
* A progress service that will report progress local to the editor triggered from.
*/
export interface IEditorProgressService extends IProgressIndicator {
    readonly _serviceBrand: undefined;
}
