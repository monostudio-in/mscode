import { UriComponents } from "../../../base/common/uri.js";
import { ISerializableEnvironmentVariableCollection, ISerializableEnvironmentVariableCollections } from "@codingame/monaco-vscode-xterm-common/vscode/vs/platform/terminal/common/environmentVariable";
import { IFixedTerminalDimensions, IRawTerminalTabLayoutInfo, IReconnectionProperties, ITerminalEnvironment, ITerminalTabAction, ITerminalTabLayoutInfoById, TerminalIcon, TerminalType, TitleEventSource, WaitOnExitValue } from "./terminal.js";
export interface ISingleTerminalConfiguration<T> {
    userValue: T | undefined;
    value: T | undefined;
    defaultValue: T | undefined;
}
export interface ICompleteTerminalConfiguration {
    "terminal.integrated.env.windows": ISingleTerminalConfiguration<ITerminalEnvironment>;
    "terminal.integrated.env.osx": ISingleTerminalConfiguration<ITerminalEnvironment>;
    "terminal.integrated.env.linux": ISingleTerminalConfiguration<ITerminalEnvironment>;
    "terminal.integrated.cwd": string;
    "terminal.integrated.detectLocale": "auto" | "off" | "on";
}
export type ITerminalEnvironmentVariableCollections = [
    string,
    ISerializableEnvironmentVariableCollection
][];
export interface IWorkspaceFolderData {
    uri: UriComponents;
    name: string;
    index: number;
}
export interface ISetTerminalLayoutInfoArgs {
    workspaceId: string;
    tabs: ITerminalTabLayoutInfoById[];
    background: number[] | null;
}
export interface IGetTerminalLayoutInfoArgs {
    workspaceId: string;
}
export interface IProcessDetails {
    id: number;
    pid: number;
    title: string;
    titleSource: TitleEventSource;
    cwd: string;
    workspaceId: string;
    workspaceName: string;
    isOrphan: boolean;
    icon: TerminalIcon | undefined;
    color: string | undefined;
    fixedDimensions: IFixedTerminalDimensions | undefined;
    environmentVariableCollections: ISerializableEnvironmentVariableCollections | undefined;
    reconnectionProperties?: IReconnectionProperties;
    waitOnExit?: WaitOnExitValue;
    hideFromUser?: boolean;
    isFeatureTerminal?: boolean;
    type?: TerminalType;
    hasChildProcesses: boolean;
    shellIntegrationNonce: string;
    tabActions?: ITerminalTabAction[];
}
export type ITerminalTabLayoutInfoDto = IRawTerminalTabLayoutInfo<IProcessDetails>;
export interface ReplayEntry {
    cols: number;
    rows: number;
    data: string;
}
