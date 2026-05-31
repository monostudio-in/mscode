
import { DEFAULT_EDITOR_ASSOCIATION } from '../../../common/editor.js';

var SettingValueType;
(function (SettingValueType) {
    SettingValueType["Null"] = "null";
    SettingValueType["Enum"] = "enum";
    SettingValueType["String"] = "string";
    SettingValueType["MultilineString"] = "multiline-string";
    SettingValueType["Integer"] = "integer";
    SettingValueType["Number"] = "number";
    SettingValueType["Boolean"] = "boolean";
    SettingValueType["Array"] = "array";
    SettingValueType["Exclude"] = "exclude";
    SettingValueType["Include"] = "include";
    SettingValueType["Complex"] = "complex";
    SettingValueType["NullableInteger"] = "nullable-integer";
    SettingValueType["NullableNumber"] = "nullable-number";
    SettingValueType["Object"] = "object";
    SettingValueType["BooleanObject"] = "boolean-object";
    SettingValueType["LanguageTag"] = "language-tag";
    SettingValueType["ExtensionToggle"] = "extension-toggle";
    SettingValueType["ComplexObject"] = "complex-object";
})(SettingValueType || (SettingValueType = {}));
var SettingMatchType;
(function (SettingMatchType) {
    SettingMatchType[SettingMatchType["None"] = 0] = "None";
    SettingMatchType[SettingMatchType["LanguageTagSettingMatch"] = 1] = "LanguageTagSettingMatch";
    SettingMatchType[SettingMatchType["RemoteMatch"] = 2] = "RemoteMatch";
    SettingMatchType[SettingMatchType["NonContiguousQueryInSettingId"] = 4] = "NonContiguousQueryInSettingId";
    SettingMatchType[SettingMatchType["DescriptionOrValueMatch"] = 8] = "DescriptionOrValueMatch";
    SettingMatchType[SettingMatchType["NonContiguousWordsInSettingsLabel"] = 16] = "NonContiguousWordsInSettingsLabel";
    SettingMatchType[SettingMatchType["ContiguousWordsInSettingsLabel"] = 32] = "ContiguousWordsInSettingsLabel";
    SettingMatchType[SettingMatchType["ContiguousQueryInSettingId"] = 64] = "ContiguousQueryInSettingId";
    SettingMatchType[SettingMatchType["AllWordsInSettingsLabel"] = 128] = "AllWordsInSettingsLabel";
    SettingMatchType[SettingMatchType["ExactMatch"] = 256] = "ExactMatch";
})(SettingMatchType || (SettingMatchType = {}));
const SettingKeyMatchTypes = (SettingMatchType.AllWordsInSettingsLabel
    | SettingMatchType.ContiguousWordsInSettingsLabel
    | SettingMatchType.NonContiguousWordsInSettingsLabel
    | SettingMatchType.NonContiguousQueryInSettingId
    | SettingMatchType.ContiguousQueryInSettingId);
function validateSettingsEditorOptions(options) {
    return {
        ...options,
        override: DEFAULT_EDITOR_ASSOCIATION.id,
        pinned: true
    };
}
const DEFINE_KEYBINDING_EDITOR_CONTRIB_ID = 'editor.contrib.defineKeybinding';
const FOLDER_SETTINGS_PATH = '.vscode/settings.json';
const DEFAULT_SETTINGS_EDITOR_SETTING = 'workbench.settings.openDefaultSettings';
const USE_SPLIT_JSON_SETTING = 'workbench.settings.useSplitJSON';
const ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING = 'workbench.settings.alwaysShowAdvancedSettings';
const SETTINGS_AUTHORITY = 'settings';

export { ALWAYS_SHOW_ADVANCED_SETTINGS_SETTING, DEFAULT_SETTINGS_EDITOR_SETTING, DEFINE_KEYBINDING_EDITOR_CONTRIB_ID, FOLDER_SETTINGS_PATH, SETTINGS_AUTHORITY, SettingKeyMatchTypes, SettingMatchType, SettingValueType, USE_SPLIT_JSON_SETTING, validateSettingsEditorOptions };
