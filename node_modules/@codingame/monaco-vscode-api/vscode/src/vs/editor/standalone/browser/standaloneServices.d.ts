import { Event } from "../../../base/common/event.js";
import { Keybinding, ResolvedKeybinding } from "../../../base/common/keybindings.js";
import { IDisposable } from "../../../base/common/lifecycle.js";
import Severity from "../../../base/common/severity.js";
import { ICommandEvent, ICommandHandler } from "../../../platform/commands/common/commands.js";
import { ICommandService } from "../../../platform/commands/common/commands.service.js";
import { IConfigurationChangeEvent, IConfigurationData, IConfigurationOverrides, IConfigurationValue } from "../../../platform/configuration/common/configuration.js";
import { IConfigurationService } from "../../../platform/configuration/common/configuration.service.js";
import { ContextKeyExpression } from "../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../platform/contextkey/common/contextkey.service.js";
import { IInstantiationService, ServiceIdentifier } from "../../../platform/instantiation/common/instantiation.js";
import { AbstractKeybindingService } from "../../../platform/keybinding/common/abstractKeybindingService.js";
import { IKeyboardEvent, KeybindingsSchemaContribution } from "../../../platform/keybinding/common/keybinding.js";
import { KeybindingResolver } from "../../../platform/keybinding/common/keybindingResolver.js";
import { ResolvedKeybindingItem } from "../../../platform/keybinding/common/resolvedKeybindingItem.js";
import { ILogService } from "../../../platform/log/common/log.service.js";
import { INotification, INotificationHandle, INotificationSource, INotificationSourceFilter, IPromptChoice, IPromptOptions, IStatusHandle, IStatusMessageOptions, NotificationsFilter } from "../../../platform/notification/common/notification.js";
import { INotificationService } from "../../../platform/notification/common/notification.service.js";
import { ITelemetryService } from "../../../platform/telemetry/common/telemetry.service.js";
import { ICodeEditorService } from "../../browser/services/codeEditorService.service.js";
export declare class StandaloneNotificationService implements INotificationService {
    readonly onDidChangeFilter: Event<void>;
    _serviceBrand: undefined;
    private static readonly NO_OP;
    info(message: string): INotificationHandle;
    warn(message: string): INotificationHandle;
    error(error: string | Error): INotificationHandle;
    notify(notification: INotification): INotificationHandle;
    prompt(severity: Severity, message: string, choices: IPromptChoice[], options?: IPromptOptions): INotificationHandle;
    status(message: string | Error, options?: IStatusMessageOptions): IStatusHandle;
    setFilter(filter: NotificationsFilter | INotificationSourceFilter): void;
    getFilter(source?: INotificationSource): NotificationsFilter;
    getFilters(): INotificationSourceFilter[];
    removeFilter(sourceId: string): void;
}
export declare class StandaloneCommandService implements ICommandService {
    readonly _serviceBrand: undefined;
    private readonly _instantiationService;
    private readonly _onWillExecuteCommand;
    private readonly _onDidExecuteCommand;
    readonly onWillExecuteCommand: Event<ICommandEvent>;
    readonly onDidExecuteCommand: Event<ICommandEvent>;
    constructor(instantiationService: IInstantiationService);
    executeCommand<T>(id: string, ...args: unknown[]): Promise<T>;
}
export interface IKeybindingRule {
    keybinding: number;
    command?: string | null;
    commandArgs?: unknown;
    when?: ContextKeyExpression | null;
}
export declare class StandaloneKeybindingService extends AbstractKeybindingService {
    private _cachedResolver;
    private _dynamicKeybindings;
    private readonly _domNodeListeners;
    constructor(contextKeyService: IContextKeyService, commandService: ICommandService, telemetryService: ITelemetryService, notificationService: INotificationService, logService: ILogService, codeEditorService: ICodeEditorService);
    registerContainer(container: HTMLElement): IDisposable;
    addDynamicKeybinding(command: string, keybinding: number, handler: ICommandHandler, when: ContextKeyExpression | undefined): IDisposable;
    addDynamicKeybindings(rules: IKeybindingRule[]): IDisposable;
    protected updateResolver(): void;
    protected getUserKeybindingItems(): ResolvedKeybindingItem[];
    protected _getResolver(): KeybindingResolver;
    protected _documentHasFocus(): boolean;
    private _toNormalizedKeybindingItems;
    resolveKeybinding(keybinding: Keybinding): ResolvedKeybinding[];
    resolveKeyboardEvent(keyboardEvent: IKeyboardEvent): ResolvedKeybinding;
    resolveUserBinding(userBinding: string): ResolvedKeybinding[];
    _dumpDebugInfo(): string;
    _dumpDebugInfoJSON(): string;
    registerSchemaContribution(contribution: KeybindingsSchemaContribution): IDisposable;
    /**
     * not yet supported
     */
    enableKeybindingHoldMode(commandId: string): Promise<void> | undefined;
}
export declare class StandaloneConfigurationService implements IConfigurationService {
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeConfiguration;
    readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
    private readonly _configuration;
    constructor(logService: ILogService);
    getValue<T>(): T;
    getValue<T>(section: string): T;
    getValue<T>(overrides: IConfigurationOverrides): T;
    getValue<T>(section: string, overrides: IConfigurationOverrides): T;
    updateValues(values: [
        string,
        unknown
    ][]): Promise<void>;
    updateValue(key: string, value: unknown, arg3?: unknown, arg4?: unknown): Promise<void>;
    inspect<C>(key: string, options?: IConfigurationOverrides): IConfigurationValue<C>;
    keys(): {
        default: string[];
        policy: string[];
        user: string[];
        workspace: string[];
        workspaceFolder: string[];
    };
    reloadConfiguration(): Promise<void>;
    getConfigurationData(): IConfigurationData | null;
}
export declare function updateConfigurationService(configurationService: IConfigurationService, source: any, isDiffEditor: boolean): void;
export type IEditorOverrideServices = import("monaco-editor").editor.IEditorOverrideServices;
/**
 * We don't want to eagerly instantiate services because embedders get a one time chance
 * to override services when they create the first editor.
 */
export declare namespace StandaloneServices {
    function get<T>(serviceId: ServiceIdentifier<T>): T;
    function initialize(overrides: IEditorOverrideServices): IInstantiationService;
    /**
     * Executes callback once services are initialized.
     */
    function withServices(callback: () => IDisposable): IDisposable;
}
