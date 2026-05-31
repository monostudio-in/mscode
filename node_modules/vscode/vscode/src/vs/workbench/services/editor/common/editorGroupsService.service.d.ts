import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { ContextKeyValue } from "../../../../platform/contextkey/common/contextkey.js";
import { IModalEditorPartOptions } from "../../../../platform/editor/common/editor.js";
import { type IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IRectangle } from "../../../../platform/window/common/window.js";
import { GroupIdentifier } from "../../../common/editor.js";
import { IEditorGroupsContainer, IAuxiliaryEditorPart, IEditorPart, IEditorGroup, IModalEditorPart, IEditorWorkingSet, IEditorWorkingSetOptions, IEditorGroupContextKeyProvider } from "./editorGroupsService.js";
export declare const IEditorGroupsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IEditorGroupsService>;
/**
* The main service to interact with editor groups across all opened editor parts.
*/
export interface IEditorGroupsService extends IEditorGroupsContainer {
    readonly _serviceBrand: undefined;
    /**
    * An event for when a new auxiliary editor part is created.
    */
    readonly onDidCreateAuxiliaryEditorPart: Event<IAuxiliaryEditorPart>;
    /**
    * Provides access to the main window editor part.
    */
    readonly mainPart: IEditorPart;
    /**
    * Provides access to all editor parts.
    */
    readonly parts: ReadonlyArray<IEditorPart>;
    /**
    * Get the editor part that contains the group with the provided identifier.
    */
    getPart(group: IEditorGroup | GroupIdentifier): IEditorPart;
    /**
    * Get the editor part that is rooted in the provided container.
    */
    getPart(container: unknown): IEditorPart;
    /**
    * Opens a new window with a full editor part instantiated
    * in there at the optional position and size on screen.
    */
    createAuxiliaryEditorPart(options?: {
        bounds?: Partial<IRectangle>;
        compact?: boolean;
        alwaysOnTop?: boolean;
    }): Promise<IAuxiliaryEditorPart>;
    /**
    * Creates a modal editor part that shows in a modal overlay
    * on top of the main workbench window.
    *
    * If a modal part already exists, it will be returned
    * instead of creating a new one.
    */
    createModalEditorPart(options?: IModalEditorPartOptions): Promise<IModalEditorPart>;
    /**
    * The currently active modal editor part, if any.
    */
    readonly activeModalEditorPart: IModalEditorPart | undefined;
    /**
    * Returns the instantiation service that is scoped to the
    * provided editor part. Use this method when building UI
    * that contributes to auxiliary editor parts to ensure the
    * UI is scoped to that part.
    */
    getScopedInstantiationService(part: IEditorPart): IInstantiationService;
    /**
    * Save a new editor working set from the currently opened
    * editors and group layout.
    */
    saveWorkingSet(name: string): IEditorWorkingSet;
    /**
    * Returns all known editor working sets.
    */
    getWorkingSets(): IEditorWorkingSet[];
    /**
    * Applies the working set. Use `empty` to apply an empty working set.
    *
    * @returns `true` when the working set as applied.
    */
    applyWorkingSet(workingSet: IEditorWorkingSet | "empty", options?: IEditorWorkingSetOptions): Promise<boolean>;
    /**
    * Deletes a working set.
    */
    deleteWorkingSet(workingSet: IEditorWorkingSet): void;
    /**
    * Registers a context key provider. This provider sets a context key for each scoped editor group context and the global context.
    *
    * @param provider - The context key provider to be registered.
    * @returns - A disposable object to unregister the provider.
    */
    registerContextKeyProvider<T extends ContextKeyValue>(provider: IEditorGroupContextKeyProvider<T>): IDisposable;
}
