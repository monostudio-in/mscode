import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IEditorPane } from "../../../common/editor.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { IPreferencesEditorModel, ISetting, IOpenSettingsOptions, IOpenKeybindingsEditorOptions } from "./preferences.js";
import { Settings2EditorModel } from "./preferencesModels.js";
export declare const IPreferencesService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPreferencesService>;
export interface IPreferencesService {
    readonly _serviceBrand: undefined;
    readonly onDidDefaultSettingsContentChanged: Event<URI>;
    userSettingsResource: URI;
    workspaceSettingsResource: URI | null;
    getFolderSettingsResource(resource: URI): URI | null;
    createPreferencesEditorModel(uri: URI): Promise<IPreferencesEditorModel<ISetting> | null>;
    getDefaultSettingsContent(uri: URI): string | undefined;
    hasDefaultSettingsContent(uri: URI): boolean;
    createSettings2EditorModel(): Settings2EditorModel;
    openPreferences(): Promise<void>;
    openRawDefaultSettings(): Promise<IEditorPane | undefined>;
    openSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openApplicationSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openUserSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openRemoteSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openWorkspaceSettings(options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    openFolderSettings(options: IOpenSettingsOptions & {
        folderUri: IOpenSettingsOptions["folderUri"];
    }): Promise<IEditorPane | undefined>;
    openGlobalKeybindingSettings(textual: boolean, options?: IOpenKeybindingsEditorOptions): Promise<void>;
    openDefaultKeybindingsFile(): Promise<IEditorPane | undefined>;
    openLanguageSpecificSettings(languageId: string, options?: IOpenSettingsOptions): Promise<IEditorPane | undefined>;
    getEditableSettingsURI(configurationTarget: ConfigurationTarget, resource?: URI): Promise<URI | null>;
    getSetting(settingId: string): ISetting | undefined;
    createSplitJsonEditorInput(configurationTarget: ConfigurationTarget, resource: URI): EditorInput;
}
