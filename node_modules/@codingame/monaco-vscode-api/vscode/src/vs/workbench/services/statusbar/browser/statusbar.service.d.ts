import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { type IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IStatusbarEntryContainer, IAuxiliaryStatusbarPart } from "@codingame/monaco-vscode-view-status-bar-service-override/vscode/vs/workbench/browser/parts/statusbar/statusbarPart";
export declare const IStatusbarService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IStatusbarService>;
export interface IStatusbarService extends IStatusbarEntryContainer {
    readonly _serviceBrand: undefined;
    /**
    * Get the status bar part that is rooted in the provided container.
    */
    getPart(container: HTMLElement): IStatusbarEntryContainer;
    /**
    * Creates a new auxililary status bar part in the provided container.
    */
    createAuxiliaryStatusbarPart(container: HTMLElement, instantiationService: IInstantiationService): IAuxiliaryStatusbarPart;
    /**
    * Create a scoped status bar service that only operates on the provided
    * status entry container.
    */
    createScoped(statusbarEntryContainer: IStatusbarEntryContainer, disposables: DisposableStore): IStatusbarService;
}
