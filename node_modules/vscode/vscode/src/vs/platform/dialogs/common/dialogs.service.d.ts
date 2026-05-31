import { Event } from "../../../base/common/event.js";
import { URI } from "../../../base/common/uri.js";
import { IConfirmation, IConfirmationResult, IPromptWithCustomCancel, IPromptResultWithCancel, IPromptWithDefaultCancel, IPromptResult, IPrompt, IInput, IInputResult, type ConfirmResult, type IOpenDialogOptions, type IPickAndOpenOptions, type ISaveDialogOptions } from "./dialogs.js";
export declare const IDialogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDialogService>;
/**
* A service to bring up modal dialogs.
*
* Note: use the `INotificationService.prompt()` method for a non-modal way to ask
* the user for input.
*/
export interface IDialogService {
    readonly _serviceBrand: undefined;
    /**
    * An event that fires when a dialog is about to show.
    */
    readonly onWillShowDialog: Event<void>;
    /**
    * An event that fires when a dialog did show (closed).
    */
    readonly onDidShowDialog: Event<void>;
    /**
    * Ask the user for confirmation with a modal dialog.
    */
    confirm(confirmation: IConfirmation): Promise<IConfirmationResult>;
    /**
    * Prompt the user with a modal dialog. Provides a bit
    * more control over the dialog compared to the simpler
    * `confirm` method. Specifically, allows to show more
    * than 2 buttons and makes it easier to just show a
    * message to the user.
    *
    * @returns a promise that resolves to the `T` result
    * from the provided `IPromptButton<T>` or `undefined`.
    */
    prompt<T>(prompt: IPromptWithCustomCancel<T>): Promise<IPromptResultWithCancel<T>>;
    prompt<T>(prompt: IPromptWithDefaultCancel<T>): Promise<IPromptResult<T>>;
    prompt<T>(prompt: IPrompt<T>): Promise<IPromptResult<T>>;
    /**
    * Present a modal dialog to the user asking for input.
    */
    input(input: IInput): Promise<IInputResult>;
    /**
    * Show a modal info dialog.
    */
    info(message: string, detail?: string): Promise<void>;
    /**
    * Show a modal warning dialog.
    */
    warn(message: string, detail?: string): Promise<void>;
    /**
    * Show a modal error dialog.
    */
    error(message: string, detail?: string): Promise<void>;
    /**
    * Present the about dialog to the user.
    */
    about(): Promise<void>;
}
export declare const IFileDialogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IFileDialogService>;
/**
* A service to bring up file dialogs.
*/
export interface IFileDialogService {
    readonly _serviceBrand: undefined;
    /**
    * The default path for a new file based on previously used files.
    * @param schemeFilter The scheme of the file path. If no filter given, the scheme of the current window is used.
    * Falls back to user home in the absence of enough information to find a better URI.
    */
    defaultFilePath(schemeFilter?: string): Promise<URI>;
    /**
    * The default path for a new folder based on previously used folders.
    * @param schemeFilter The scheme of the folder path. If no filter given, the scheme of the current window is used.
    * Falls back to user home in the absence of enough information to find a better URI.
    */
    defaultFolderPath(schemeFilter?: string): Promise<URI>;
    /**
    * The default path for a new workspace based on previously used workspaces.
    * @param schemeFilter The scheme of the workspace path. If no filter given, the scheme of the current window is used.
    * Falls back to user home in the absence of enough information to find a better URI.
    */
    defaultWorkspacePath(schemeFilter?: string): Promise<URI>;
    /**
    * Shows a file-folder selection dialog and opens the selected entry.
    */
    pickFileFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
    * Shows a file selection dialog and opens the selected entry.
    */
    pickFileAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
    * Shows a folder selection dialog and opens the selected entry.
    */
    pickFolderAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
    * Shows a workspace selection dialog and opens the selected entry.
    */
    pickWorkspaceAndOpen(options: IPickAndOpenOptions): Promise<void>;
    /**
    * Shows a save file dialog and save the file at the chosen file URI.
    */
    pickFileToSave(defaultUri: URI, availableFileSystems?: string[]): Promise<URI | undefined>;
    /**
    * The preferred folder path to open the dialog at.
    * @param schemeFilter The scheme of the file path. If no filter given, the scheme of the current window is used.
    * Falls back to user home in the absence of a setting.
    */
    preferredHome(schemeFilter?: string): Promise<URI>;
    /**
    * Shows a save file dialog and returns the chosen file URI.
    */
    showSaveDialog(options: ISaveDialogOptions): Promise<URI | undefined>;
    /**
    * Shows a confirm dialog for saving 1-N files.
    */
    showSaveConfirm(fileNamesOrResources: (string | URI)[]): Promise<ConfirmResult>;
    /**
    * Shows a open file dialog and returns the chosen file URI.
    */
    showOpenDialog(options: IOpenDialogOptions): Promise<URI[] | undefined>;
}
