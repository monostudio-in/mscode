import { ErrorNoTelemetry } from "../../../../base/common/errors.js";
interface PromptStringInputInfo {
    id: string;
    type: "promptString";
    description: string;
    default?: string;
    password?: boolean;
}
interface PickStringInputInfo {
    id: string;
    type: "pickString";
    description: string;
    options: (string | {
        value: string;
        label?: string;
    })[];
    default?: string;
}
interface CommandInputInfo {
    id: string;
    type: "command";
    command: string;
    args?: any;
}
export type ConfiguredInput = PromptStringInputInfo | PickStringInputInfo | CommandInputInfo;
export declare enum VariableKind {
    Unknown = "unknown",
    Env = "env",
    Config = "config",
    Command = "command",
    Input = "input",
    ExtensionInstallFolder = "extensionInstallFolder",
    TaskVar = "taskVar",
    WorkspaceFolder = "workspaceFolder",
    Cwd = "cwd",
    WorkspaceFolderBasename = "workspaceFolderBasename",
    UserHome = "userHome",
    LineNumber = "lineNumber",
    ColumnNumber = "columnNumber",
    SelectedText = "selectedText",
    File = "file",
    FileWorkspaceFolder = "fileWorkspaceFolder",
    FileWorkspaceFolderBasename = "fileWorkspaceFolderBasename",
    RelativeFile = "relativeFile",
    RelativeFileDirname = "relativeFileDirname",
    FileDirname = "fileDirname",
    FileExtname = "fileExtname",
    FileBasename = "fileBasename",
    FileBasenameNoExtension = "fileBasenameNoExtension",
    FileDirnameBasename = "fileDirnameBasename",
    ExecPath = "execPath",
    ExecInstallFolder = "execInstallFolder",
    PathSeparator = "pathSeparator",
    PathSeparatorAlias = "/"
}
export declare const allVariableKinds: VariableKind[];
export declare class VariableError extends ErrorNoTelemetry {
    readonly variable: VariableKind;
    constructor(variable: VariableKind, message?: string);
}
export {};
