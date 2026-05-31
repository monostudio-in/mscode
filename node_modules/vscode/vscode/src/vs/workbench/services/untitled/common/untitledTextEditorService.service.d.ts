import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { IUntitledTextEditorModel } from "./untitledTextEditorModel.js";
import { IUntitledTextEditorModelSaveEvent, INewUntitledTextEditorOptions, INewUntitledTextEditorWithAssociatedResourceOptions, IExistingUntitledTextEditorOptions } from "@codingame/monaco-vscode-view-common-service-override/vscode/vs/workbench/services/untitled/common/untitledTextEditorService";
export declare const IUntitledTextEditorService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IUntitledTextEditorService>;
export interface IUntitledTextEditorService {
    readonly _serviceBrand: undefined;
    /**
    * An event for when an untitled editor model was saved to disk.
    * At the point the event fires, the untitled editor model is
    * disposed.
    */
    readonly onDidSave: Event<IUntitledTextEditorModelSaveEvent>;
    /**
    * Events for when untitled text editors change (e.g. getting dirty, saved or reverted).
    */
    readonly onDidChangeDirty: Event<IUntitledTextEditorModel>;
    /**
    * Events for when untitled text editor encodings change.
    */
    readonly onDidChangeEncoding: Event<IUntitledTextEditorModel>;
    /**
    * Events for when untitled text editor labels change.
    */
    readonly onDidChangeLabel: Event<IUntitledTextEditorModel>;
    /**
    * Events for when untitled text editor models are created.
    */
    readonly onDidCreate: Event<IUntitledTextEditorModel>;
    /**
    * Events for when untitled text editors are about to be disposed.
    */
    readonly onWillDispose: Event<IUntitledTextEditorModel>;
    /**
    * Creates a new untitled editor model with the provided options. If the `untitledResource`
    * property is provided and the untitled editor exists, it will return that existing
    * instance instead of creating a new one.
    */
    create(options?: INewUntitledTextEditorOptions): IUntitledTextEditorModel;
    create(options?: INewUntitledTextEditorWithAssociatedResourceOptions): IUntitledTextEditorModel;
    create(options?: IExistingUntitledTextEditorOptions): IUntitledTextEditorModel;
    /**
    * Returns an existing untitled editor model if already created before.
    */
    get(resource: URI): IUntitledTextEditorModel | undefined;
    /**
    * Returns the value of the untitled editor, undefined if none exists
    * @param resource The URI of the untitled file
    * @returns The content, or undefined
    */
    getValue(resource: URI): string | undefined;
    /**
    * Resolves an untitled editor model from the provided options. If the `untitledResource`
    * property is provided and the untitled editor exists, it will return that existing
    * instance instead of creating a new one.
    */
    resolve(options?: INewUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: INewUntitledTextEditorWithAssociatedResourceOptions): Promise<IUntitledTextEditorModel>;
    resolve(options?: IExistingUntitledTextEditorOptions): Promise<IUntitledTextEditorModel>;
    /**
    * Figures out if the given resource has an associated resource or not.
    */
    isUntitledWithAssociatedResource(resource: URI): boolean;
    /**
    * Waits for the model to be ready to be disposed. There may be conditions
    * under which the model cannot be disposed, e.g. when it is dirty. Once the
    * promise is settled, it is safe to dispose the model.
    */
    canDispose(model: IUntitledTextEditorModel): true | Promise<true>;
}
