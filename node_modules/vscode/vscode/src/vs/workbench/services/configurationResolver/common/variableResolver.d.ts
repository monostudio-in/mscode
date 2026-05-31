import { IStringDictionary } from "../../../../base/common/collections.js";
import { IProcessEnvironment } from "../../../../base/common/platform.js";
import { URI as uri } from "../../../../base/common/uri.js";
import { ILabelService } from "../../../../platform/label/common/label.service.js";
import { IWorkspaceFolderData } from "../../../../platform/workspace/common/workspace.js";
import { IConfigurationResolverService } from "./configurationResolver.service.js";
import { ConfigurationResolverExpression, IResolvedValue, Replacement } from "./configurationResolverExpression.js";
interface IVariableResolveContext {
    getFolderUri(folderName: string): uri | undefined;
    getWorkspaceFolderCount(): number;
    getConfigurationValue(folderUri: uri | undefined, section: string): string | undefined;
    getAppRoot(): string | undefined;
    getExecPath(): string | undefined;
    getFilePath(): string | undefined;
    getWorkspaceFolderPathForFile?(): string | undefined;
    getSelectedText(): string | undefined;
    getLineNumber(): string | undefined;
    getColumnNumber(): string | undefined;
    getExtension(id: string): Promise<{
        readonly extensionLocation: uri;
    } | undefined>;
}
export declare abstract class AbstractVariableResolverService implements IConfigurationResolverService {
    readonly _serviceBrand: undefined;
    private _context;
    private _labelService?;
    private _envVariablesPromise?;
    private _userHomePromise?;
    protected _contributedVariables: Map<string, () => Promise<string | undefined>>;
    readonly resolvableVariables: Set<string>;
    constructor(_context: IVariableResolveContext, _labelService?: ILabelService, _userHomePromise?: Promise<string>, _envVariablesPromise?: Promise<IProcessEnvironment>);
    private prepareEnv;
    resolveWithEnvironment(environment: IProcessEnvironment, folder: IWorkspaceFolderData | undefined, value: string): Promise<string>;
    resolveAsync<T>(folder: IWorkspaceFolderData | undefined, config: T): Promise<T extends ConfigurationResolverExpression<infer R> ? R : T>;
    resolveWithInteractionReplace(folder: IWorkspaceFolderData | undefined, config: unknown): Promise<unknown>;
    resolveWithInteraction(folder: IWorkspaceFolderData | undefined, config: unknown): Promise<Map<string, string> | undefined>;
    contributeVariable(variable: string, resolution: () => Promise<string | undefined>): void;
    private fsPath;
    protected evaluateSingleVariable(replacement: Replacement, folderUri: uri | undefined, processEnvironment?: IProcessEnvironment, commandValueMapping?: IStringDictionary<IResolvedValue>): Promise<IResolvedValue | string | undefined>;
    private resolveFromMap;
}
export {};
