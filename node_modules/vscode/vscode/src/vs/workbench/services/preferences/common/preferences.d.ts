import { IStringDictionary } from "../../../../base/common/collections.js";
import { Event } from "../../../../base/common/event.js";
import { IMatch } from "../../../../base/common/filters.js";
import { IJSONSchema, IJSONSchemaMap } from "../../../../base/common/jsonSchema.js";
import { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import { URI } from "../../../../base/common/uri.js";
import { IRange } from "../../../../editor/common/core/range.js";
import { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { ConfigurationTarget } from "../../../../platform/configuration/common/configuration.js";
import { ConfigurationDefaultValueSource, ConfigurationScope, EditPresentationTypes, IExtensionInfo } from "../../../../platform/configuration/common/configurationRegistry.js";
import { IEditorOptions } from "../../../../platform/editor/common/editor.js";
import { IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import { ResolvedKeybindingItem } from "../../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { IEditorPane } from "../../../common/editor.js";
export declare enum SettingValueType {
    Null = "null",
    Enum = "enum",
    String = "string",
    MultilineString = "multiline-string",
    Integer = "integer",
    Number = "number",
    Boolean = "boolean",
    Array = "array",
    Exclude = "exclude",
    Include = "include",
    Complex = "complex",
    NullableInteger = "nullable-integer",
    NullableNumber = "nullable-number",
    Object = "object",
    BooleanObject = "boolean-object",
    LanguageTag = "language-tag",
    ExtensionToggle = "extension-toggle",
    ComplexObject = "complex-object"
}
export interface ISettingsGroup {
    id: string;
    range: IRange;
    title: string;
    titleRange: IRange;
    sections: ISettingsSection[];
    order?: number;
    extensionInfo?: IExtensionInfo;
}
export interface ISettingsSection {
    title?: string;
    settings: ISetting[];
}
export interface ISetting {
    range: IRange;
    key: string;
    keyRange: IRange;
    value: any;
    valueRange: IRange;
    description: string[];
    keywords?: string[];
    descriptionIsMarkdown?: boolean;
    descriptionRanges: IRange[];
    overrides?: ISetting[];
    overrideOf?: ISetting;
    deprecationMessage?: string;
    deprecationMessageIsMarkdown?: boolean;
    scope?: ConfigurationScope;
    type?: string | string[];
    order?: number;
    arrayItemType?: string;
    objectProperties?: IJSONSchemaMap;
    objectPatternProperties?: IJSONSchemaMap;
    objectAdditionalProperties?: boolean | IJSONSchema;
    propertyNames?: IJSONSchema;
    enum?: string[];
    enumDescriptions?: string[];
    enumDescriptionsAreMarkdown?: boolean;
    uniqueItems?: boolean;
    tags?: string[];
    disallowSyncIgnore?: boolean;
    restricted?: boolean;
    extensionInfo?: IExtensionInfo;
    validator?: (value: any) => string | null;
    enumItemLabels?: string[];
    editPresentation?: EditPresentationTypes;
    nonLanguageSpecificDefaultValueSource?: ConfigurationDefaultValueSource;
    isLanguageTagSetting?: boolean;
    categoryLabel?: string;
    allKeysAreBoolean?: boolean;
    displayExtensionId?: string;
    title?: string;
    extensionGroupTitle?: string;
    internalOrder?: number;
}
export interface IExtensionSetting extends ISetting {
    extensionName?: string;
    extensionPublisher?: string;
}
export interface ISearchResult {
    filterMatches: ISettingMatch[];
    exactMatch: boolean;
    metadata?: IFilterMetadata;
}
export interface ISearchResultGroup {
    id: string;
    label: string;
    result: ISearchResult;
    order: number;
}
export interface IFilterResult {
    query?: string;
    filteredGroups: ISettingsGroup[];
    allGroups: ISettingsGroup[];
    matches: IRange[];
    metadata?: IStringDictionary<IFilterMetadata>;
    exactMatch?: boolean;
}
/**
 * The ways a setting could match a query,
 * sorted in increasing order of relevance.
 */
export declare enum SettingMatchType {
    None = 0,
    LanguageTagSettingMatch = 1,
    RemoteMatch = 2,
    NonContiguousQueryInSettingId = 4,
    DescriptionOrValueMatch = 8,
    NonContiguousWordsInSettingsLabel = 16,
    ContiguousWordsInSettingsLabel = 32,
    ContiguousQueryInSettingId = 64,
    AllWordsInSettingsLabel = 128,
    ExactMatch = 256
}
export declare const SettingKeyMatchTypes: number;
export interface ISettingMatch {
    setting: ISetting;
    matches: IRange[] | null;
    matchType: SettingMatchType;
    keyMatchScore: number;
    score: number;
    providerName?: string;
}
export interface IScoredResults {
    [key: string]: IRemoteSetting;
}
export interface IRemoteSetting {
    score: number;
    key: string;
    id: string;
    defaultValue: string;
    description: string;
    packageId: string;
    extensionName?: string;
    extensionPublisher?: string;
}
export interface IFilterMetadata {
    requestUrl: string;
    requestBody: string;
    timestamp: number;
    duration: number;
    scoredResults: IScoredResults;
    /** The number of requests made, since requests are split by number of filters */
    requestCount?: number;
    /** The name of the server that actually served the request */
    context: string;
}
export interface IPreferencesEditorModel<T> {
    uri?: URI;
    getPreference(key: string): T | undefined;
    dispose(): void;
}
export type IGroupFilter = (group: ISettingsGroup) => boolean | null;
export type ISettingMatcher = (setting: ISetting, group: ISettingsGroup) => {
    matches: IRange[];
    matchType: SettingMatchType;
    keyMatchScore: number;
    score: number;
} | null;
export interface ISettingsEditorModel extends IPreferencesEditorModel<ISetting> {
    readonly onDidChangeGroups: Event<void>;
    settingsGroups: ISettingsGroup[];
    filterSettings(filter: string, groupFilter: IGroupFilter, settingMatcher: ISettingMatcher): ISettingMatch[];
    updateResultGroup(id: string, resultGroup: ISearchResultGroup | undefined): IFilterResult | undefined;
}
export interface ISettingsEditorOptions extends IEditorOptions {
    target?: ConfigurationTarget;
    folderUri?: URI;
    query?: string;
    /**
     * Only works when opening the json settings file. Use `query` for settings editor.
     */
    revealSetting?: {
        key: string;
        edit?: boolean;
    };
    focusSearch?: boolean;
}
export interface IOpenSettingsOptions extends ISettingsEditorOptions {
    jsonEditor?: boolean;
    openToSide?: boolean;
    groupId?: number;
}
export declare function validateSettingsEditorOptions(options: ISettingsEditorOptions): ISettingsEditorOptions;
export interface IKeybindingsEditorModel<T> extends IPreferencesEditorModel<T> {
}
export interface IKeybindingsEditorOptions extends IEditorOptions {
    query?: string;
}
export interface IOpenKeybindingsEditorOptions extends IKeybindingsEditorOptions {
    groupId?: number;
}
export interface KeybindingMatch {
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    metaKey?: boolean;
    keyCode?: boolean;
}
export interface KeybindingMatches {
    firstPart: KeybindingMatch;
    chordPart: KeybindingMatch;
}
export interface IKeybindingItemEntry {
    id: string;
    templateId: string;
    keybindingItem: IKeybindingItem;
    commandIdMatches?: IMatch[];
    commandLabelMatches?: IMatch[];
    commandDefaultLabelMatches?: IMatch[];
    sourceMatches?: IMatch[];
    extensionIdMatches?: IMatch[];
    extensionLabelMatches?: IMatch[];
    whenMatches?: IMatch[];
    keybindingMatches?: KeybindingMatches;
}
export interface IKeybindingItem {
    keybinding: ResolvedKeybinding;
    keybindingItem: ResolvedKeybindingItem;
    commandLabel: string;
    commandDefaultLabel: string;
    command: string;
    source: string | IExtensionDescription;
    when: string;
}
export interface IKeybindingsEditorPane extends IEditorPane {
    readonly activeKeybindingEntry: IKeybindingItemEntry | null;
    readonly onDefineWhenExpression: Event<IKeybindingItemEntry>;
    readonly onLayout: Event<void>;
    search(filter: string): void;
    focusSearch(): void;
    clearSearchResults(): void;
    focusKeybindings(): void;
    recordSearchKeys(): void;
    toggleSortByPrecedence(): void;
    selectKeybinding(keybindingEntry: IKeybindingItemEntry): void;
    defineKeybinding(keybindingEntry: IKeybindingItemEntry, add: boolean): Promise<void>;
    defineWhenExpression(keybindingEntry: IKeybindingItemEntry): void;
    updateKeybinding(keybindingEntry: IKeybindingItemEntry, key: string, when: string | undefined): Promise<any>;
    removeKeybinding(keybindingEntry: IKeybindingItemEntry): Promise<any>;
    resetKeybinding(keybindingEntry: IKeybindingItemEntry): Promise<any>;
    copyKeybinding(keybindingEntry: IKeybindingItemEntry): Promise<void>;
    copyKeybindingCommand(keybindingEntry: IKeybindingItemEntry): Promise<void>;
    showSimilarKeybindings(keybindingEntry: IKeybindingItemEntry): void;
}
export declare const DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = "editor.contrib.defineKeybinding";
export interface IDefineKeybindingEditorContribution extends IEditorContribution {
    showDefineKeybindingWidget(): void;
}
export declare const FOLDER_SETTINGS_PATH = ".vscode/settings.json";
export declare const DEFAULT_SETTINGS_EDITOR_SETTING = "workbench.settings.openDefaultSettings";
export declare const USE_SPLIT_JSON_SETTING = "workbench.settings.useSplitJSON";
export declare const ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING = "workbench.settings.alwaysShowAdvancedSettings";
export declare const SETTINGS_AUTHORITY = "settings";
