import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IMarkActiveOptions } from "@codingame/monaco-vscode-base-service-override/vscode/vs/workbench/services/userActivity/common/userActivityService";
export declare const IUserActivityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUserActivityService>;
/**
* Service that observes user activity in the window.
*/
export interface IUserActivityService {
    _serviceBrand: undefined;
    /**
    * Whether the user is currently active.
    */
    readonly isActive: boolean;
    /**
    * Fires when the activity state changes.
    */
    readonly onDidChangeIsActive: Event<boolean>;
    /**
    * Marks the user as being active until the Disposable is disposed of.
    * Multiple consumers call this method; the user will only be considered
    * inactive once all consumers have disposed of their Disposables.
    */
    markActive(opts?: IMarkActiveOptions): IDisposable;
}
