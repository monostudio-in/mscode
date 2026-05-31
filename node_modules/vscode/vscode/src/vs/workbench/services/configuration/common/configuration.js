
import { ConfigurationScope } from '../../../../platform/configuration/common/configurationRegistry.js';

const FOLDER_CONFIG_FOLDER_NAME = '.vscode';
const FOLDER_SETTINGS_NAME = 'settings';
const FOLDER_SETTINGS_PATH = `${FOLDER_CONFIG_FOLDER_NAME}/${FOLDER_SETTINGS_NAME}.json`;
const defaultSettingsSchemaId = 'vscode://schemas/settings/default';
const userSettingsSchemaId = 'vscode://schemas/settings/user';
const profileSettingsSchemaId = 'vscode://schemas/settings/profile';
const machineSettingsSchemaId = 'vscode://schemas/settings/machine';
const workspaceSettingsSchemaId = 'vscode://schemas/settings/workspace';
const folderSettingsSchemaId = 'vscode://schemas/settings/folder';
const launchSchemaId = 'vscode://schemas/launch';
const tasksSchemaId = 'vscode://schemas/tasks';
const mcpSchemaId = 'vscode://schemas/mcp';
const APPLICATION_SCOPES = [ConfigurationScope.APPLICATION, ConfigurationScope.APPLICATION_MACHINE];
const PROFILE_SCOPES = [ConfigurationScope.MACHINE, ConfigurationScope.WINDOW, ConfigurationScope.RESOURCE, ConfigurationScope.LANGUAGE_OVERRIDABLE, ConfigurationScope.MACHINE_OVERRIDABLE];
const LOCAL_MACHINE_PROFILE_SCOPES = [ConfigurationScope.WINDOW, ConfigurationScope.RESOURCE, ConfigurationScope.LANGUAGE_OVERRIDABLE];
const LOCAL_MACHINE_SCOPES = [ConfigurationScope.APPLICATION, ...LOCAL_MACHINE_PROFILE_SCOPES];
const REMOTE_MACHINE_SCOPES = [ConfigurationScope.MACHINE, ConfigurationScope.APPLICATION_MACHINE, ConfigurationScope.WINDOW, ConfigurationScope.RESOURCE, ConfigurationScope.LANGUAGE_OVERRIDABLE, ConfigurationScope.MACHINE_OVERRIDABLE];
const WORKSPACE_SCOPES = [ConfigurationScope.WINDOW, ConfigurationScope.RESOURCE, ConfigurationScope.LANGUAGE_OVERRIDABLE, ConfigurationScope.MACHINE_OVERRIDABLE];
const FOLDER_SCOPES = [ConfigurationScope.RESOURCE, ConfigurationScope.LANGUAGE_OVERRIDABLE, ConfigurationScope.MACHINE_OVERRIDABLE];
const TASKS_CONFIGURATION_KEY = 'tasks';
const LAUNCH_CONFIGURATION_KEY = 'launch';
const MCP_CONFIGURATION_KEY = 'mcp';
const WORKSPACE_STANDALONE_CONFIGURATIONS = Object.create(null);
WORKSPACE_STANDALONE_CONFIGURATIONS[TASKS_CONFIGURATION_KEY] = `${FOLDER_CONFIG_FOLDER_NAME}/${TASKS_CONFIGURATION_KEY}.json`;
WORKSPACE_STANDALONE_CONFIGURATIONS[LAUNCH_CONFIGURATION_KEY] = `${FOLDER_CONFIG_FOLDER_NAME}/${LAUNCH_CONFIGURATION_KEY}.json`;
WORKSPACE_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY] = `${FOLDER_CONFIG_FOLDER_NAME}/${MCP_CONFIGURATION_KEY}.json`;
const USER_STANDALONE_CONFIGURATIONS = Object.create(null);
USER_STANDALONE_CONFIGURATIONS[TASKS_CONFIGURATION_KEY] = `${TASKS_CONFIGURATION_KEY}.json`;
USER_STANDALONE_CONFIGURATIONS[MCP_CONFIGURATION_KEY] = `${MCP_CONFIGURATION_KEY}.json`;
const TASKS_DEFAULT = '{\n\t\"version\": \"2.0.0\",\n\t\"tasks\": []\n}';
const APPLY_ALL_PROFILES_SETTING = 'workbench.settings.applyToAllProfiles';

export { APPLICATION_SCOPES, APPLY_ALL_PROFILES_SETTING, FOLDER_CONFIG_FOLDER_NAME, FOLDER_SCOPES, FOLDER_SETTINGS_NAME, FOLDER_SETTINGS_PATH, LAUNCH_CONFIGURATION_KEY, LOCAL_MACHINE_PROFILE_SCOPES, LOCAL_MACHINE_SCOPES, MCP_CONFIGURATION_KEY, PROFILE_SCOPES, REMOTE_MACHINE_SCOPES, TASKS_CONFIGURATION_KEY, TASKS_DEFAULT, USER_STANDALONE_CONFIGURATIONS, WORKSPACE_SCOPES, WORKSPACE_STANDALONE_CONFIGURATIONS, defaultSettingsSchemaId, folderSettingsSchemaId, launchSchemaId, machineSettingsSchemaId, mcpSchemaId, profileSettingsSchemaId, tasksSchemaId, userSettingsSchemaId, workspaceSettingsSchemaId };
