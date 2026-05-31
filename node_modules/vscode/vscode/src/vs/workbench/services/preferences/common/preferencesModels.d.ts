import { IStringDictionary } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable, IReference } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { ITextModel } from "../../../../editor/common/model.js";
import { ITextEditorModel } from "@codingame/monaco-vscode-model-service-override/vscode/vs/editor/common/services/resolverService";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.service.js";
import { EditorModel } from "../../../common/editor/editorModel.js";
import { IFilterMetadata, IFilterResult, IGroupFilter, IKeybindingsEditorModel, ISearchResultGroup, ISetting, ISettingMatch, ISettingMatcher, ISettingsEditorModel, ISettingsGroup } from "./preferences.js";
export declare const nullRange: IRange;
/**
 * Strips VS Code's custom `#settingId#` link syntax from a markdown string so the setting key
 * remains as inline code (e.g. `` `settingId` ``). Useful for contexts that don't render markdown links.
 */
export declare function fixSettingLinks(text: string): string;
declare abstract class AbstractSettingsModel extends EditorModel {
    protected _currentResultGroups: Map<string, ISearchResultGroup>;
    updateResultGroup(id: string, resultGroup: ISearchResultGroup | undefined): IFilterResult | undefined;
    /**
     * Remove duplicates between result groups, preferring results in earlier groups
     */
    private removeDuplicateResults;
    filterSettings(filter: string, groupFilter: IGroupFilter, settingMatcher: ISettingMatcher): ISettingMatch[];
    getPreference(key: string): ISetting | undefined;
    protected collectMetadata(groups: ISearchResultGroup[]): IStringDictionary<IFilterMetadata> | null;
    protected get filterGroups(): ISettingsGroup[];
    abstract settingsGroups: ISettingsGroup[];
    protected abstract update(): IFilterResult | undefined;
}
export declare class SettingsEditorModel extends AbstractSettingsModel implements ISettingsEditorModel {
    private _configurationTarget;
    private _settingsGroups;
    protected settingsModel: ITextModel;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    constructor(reference: IReference<ITextEditorModel>, _configurationTarget: ConfigurationTarget);
    get uri(): URI;
    get configurationTarget(): ConfigurationTarget;
    get settingsGroups(): ISettingsGroup[];
    get content(): string;
    protected isSettingsProperty(property: string, previousParents: string[]): boolean;
    protected parse(): void;
    protected update(): IFilterResult | undefined;
}
export declare class Settings2EditorModel extends AbstractSettingsModel implements ISettingsEditorModel {
    private _defaultSettings;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    private additionalGroups;
    private dirty;
    constructor(_defaultSettings: DefaultSettings, configurationService: IConfigurationService);
    /** Doesn't include the "Commonly Used" group */
    protected get filterGroups(): ISettingsGroup[];
    get settingsGroups(): ISettingsGroup[];
    /** For programmatically added groups outside of registered configurations */
    setAdditionalGroups(groups: ISettingsGroup[]): void;
    protected update(): IFilterResult;
}
export declare class WorkspaceConfigurationEditorModel extends SettingsEditorModel {
    private _configurationGroups;
    get configurationGroups(): ISettingsGroup[];
    protected parse(): void;
    protected isSettingsProperty(property: string, previousParents: string[]): boolean;
}
export declare class DefaultSettings extends Disposable {
    private _mostCommonlyUsedSettingsKeys;
    readonly target: ConfigurationTarget;
    readonly configurationService: IConfigurationService;
    private _allSettingsGroups;
    private _content;
    private _contentWithoutMostCommonlyUsed;
    private _settingsByName;
    private readonly _onDidChange;
    readonly onDidChange: Event<void>;
    constructor(_mostCommonlyUsedSettingsKeys: string[], target: ConfigurationTarget, configurationService: IConfigurationService);
    getContent(forceUpdate?: boolean): string;
    getContentWithoutMostCommonlyUsed(forceUpdate?: boolean): string;
    getSettingsGroups(forceUpdate?: boolean): ISettingsGroup[];
    private initialize;
    private reset;
    private parse;
    getRegisteredGroups(): ISettingsGroup[];
    private sortGroups;
    private initAllSettingsMap;
    private getMostCommonlyUsedSettings;
    private parseProperties;
    private removeEmptySettingsGroups;
    private parseSetting;
    private parseOverrideSettings;
    private matchesScope;
    private compareGroups;
    private toContent;
}
export declare class DefaultSettingsEditorModel extends AbstractSettingsModel implements ISettingsEditorModel {
    private _uri;
    private readonly defaultSettings;
    private _model;
    private readonly _onDidChangeGroups;
    readonly onDidChangeGroups: Event<void>;
    constructor(_uri: URI, reference: IReference<ITextEditorModel>, defaultSettings: DefaultSettings);
    get uri(): URI;
    get target(): ConfigurationTarget;
    get settingsGroups(): ISettingsGroup[];
    protected get filterGroups(): ISettingsGroup[];
    protected update(): IFilterResult | undefined;
    /**
     * Translate the ISearchResultGroups to text, and write it to the editor model
     */
    private writeResultGroups;
    private writeSettingsGroupToBuilder;
    private copySetting;
    getPreference(key: string): ISetting | undefined;
    private getGroup;
}
export declare class DefaultRawSettingsEditorModel extends Disposable {
    private defaultSettings;
    private _content;
    private readonly _onDidContentChanged;
    readonly onDidContentChanged: Event<void>;
    constructor(defaultSettings: DefaultSettings);
    get content(): string;
}
export declare function defaultKeybindingsContents(keybindingService: IKeybindingService): string;
export declare class DefaultKeybindingsEditorModel implements IKeybindingsEditorModel<any> {
    private _uri;
    private readonly keybindingService;
    private _content;
    constructor(_uri: URI, keybindingService: IKeybindingService);
    get uri(): URI;
    get content(): string;
    getPreference(): any;
    dispose(): void;
}
export {};
