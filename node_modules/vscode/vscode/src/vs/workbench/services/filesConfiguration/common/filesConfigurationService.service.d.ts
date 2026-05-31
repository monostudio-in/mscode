import { Event } from "../../../../base/common/event.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IBaseFileStat } from "../../../../platform/files/common/files.js";
import { SaveReason } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IAutoSaveConfiguration, IAutoSaveMode } from "./filesConfigurationService.js";
export declare const IFilesConfigurationService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IFilesConfigurationService>;
export interface IFilesConfigurationService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeAutoSaveConfiguration: Event<void>;
    readonly onDidChangeAutoSaveDisabled: Event<URI>;
    getAutoSaveConfiguration(resourceOrEditor: EditorInput | URI | undefined): IAutoSaveConfiguration;
    hasShortAutoSaveDelay(resourceOrEditor: EditorInput | URI | undefined): boolean;
    getAutoSaveMode(resourceOrEditor: EditorInput | URI | undefined, saveReason?: SaveReason): IAutoSaveMode;
    toggleAutoSave(): Promise<void>;
    enableAutoSaveAfterShortDelay(resourceOrEditor: EditorInput | URI): IDisposable;
    disableAutoSave(resourceOrEditor: EditorInput | URI): IDisposable;
    readonly onDidChangeReadonly: Event<void>;
    isReadonly(resource: URI, stat?: IBaseFileStat): boolean | IMarkdownString;
    updateReadonly(resource: URI, readonly: true | false | "toggle" | "reset"): Promise<void>;
    updateReadonly(resource: URI[], readonly: true | false | "reset"): Promise<void>;
    readonly onDidChangeFilesAssociation: Event<void>;
    readonly isHotExitEnabled: boolean;
    readonly hotExitConfiguration: string | undefined;
    preventSaveConflicts(resource: URI, language?: string): boolean;
}
