import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.service.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.service.js";
import { IFilesConfiguration, IBaseFileStat } from "../../../../platform/files/common/files.js";
import { IFileService } from "../../../../platform/files/common/files.service.js";
import { URI } from "../../../../base/common/uri.js";
import { IWorkspaceContextService } from "../../../../platform/workspace/common/workspace.service.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.service.js";
import { IEnvironmentService } from "../../../../platform/environment/common/environment.service.js";
import { IMarkdownString } from "../../../../base/common/htmlContent.js";
import { EditorInput } from "../../../common/editor/editorInput.js";
import { SaveReason } from "../../../common/editor.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.service.js";
import { ITextResourceConfigurationService } from "../../../../editor/common/services/textResourceConfiguration.service.js";
import { IFilesConfigurationService } from "./filesConfigurationService.service.js";
export declare const AutoSaveAfterShortDelayContext: RawContextKey<boolean>;
export interface IAutoSaveConfiguration {
    autoSave?: "afterDelay" | "onFocusChange" | "onWindowChange";
    autoSaveDelay?: number;
    autoSaveWorkspaceFilesOnly?: boolean;
    autoSaveWhenNoErrors?: boolean;
}
interface ICachedAutoSaveConfiguration extends IAutoSaveConfiguration {
    isOutOfWorkspace?: boolean;
    isShortAutoSaveDelay?: boolean;
}
export declare enum AutoSaveMode {
    OFF = 0,
    AFTER_SHORT_DELAY = 1,
    AFTER_LONG_DELAY = 2,
    ON_FOCUS_CHANGE = 3,
    ON_WINDOW_CHANGE = 4
}
export declare enum AutoSaveDisabledReason {
    SETTINGS = 1,
    OUT_OF_WORKSPACE = 2,
    ERRORS = 3,
    DISABLED = 4
}
export type IAutoSaveMode = IEnabledAutoSaveMode | IDisabledAutoSaveMode;
export interface IEnabledAutoSaveMode {
    readonly mode: AutoSaveMode.AFTER_SHORT_DELAY | AutoSaveMode.AFTER_LONG_DELAY | AutoSaveMode.ON_FOCUS_CHANGE | AutoSaveMode.ON_WINDOW_CHANGE;
}
export interface IDisabledAutoSaveMode {
    readonly mode: AutoSaveMode.OFF;
    readonly reason: AutoSaveDisabledReason;
}
export declare class FilesConfigurationService extends Disposable implements IFilesConfigurationService {
    private readonly configurationService;
    private readonly contextService;
    private readonly environmentService;
    private readonly uriIdentityService;
    private readonly fileService;
    private readonly markerService;
    private readonly textResourceConfigurationService;
    readonly _serviceBrand: undefined;
    private static readonly DEFAULT_AUTO_SAVE_MODE;
    private static readonly DEFAULT_AUTO_SAVE_DELAY;
    private static readonly READONLY_MESSAGES;
    private readonly _onDidChangeAutoSaveConfiguration;
    readonly onDidChangeAutoSaveConfiguration: import("../../../../base/common/event.js").Event<void>;
    private readonly _onDidChangeAutoSaveDisabled;
    readonly onDidChangeAutoSaveDisabled: import("../../../../base/common/event.js").Event<URI>;
    private readonly _onDidChangeFilesAssociation;
    readonly onDidChangeFilesAssociation: import("../../../../base/common/event.js").Event<void>;
    private readonly _onDidChangeReadonly;
    readonly onDidChangeReadonly: import("../../../../base/common/event.js").Event<void>;
    private currentGlobalAutoSaveConfiguration;
    private currentFilesAssociationConfiguration;
    private currentHotExitConfiguration;
    private readonly autoSaveConfigurationCache;
    private readonly autoSaveAfterShortDelayOverrides;
    private readonly autoSaveDisabledOverrides;
    private readonly autoSaveAfterShortDelayContext;
    private readonly readonlyIncludeMatcher;
    private readonly readonlyExcludeMatcher;
    private configuredReadonlyFromPermissions;
    private readonly sessionReadonlyOverrides;
    constructor(contextKeyService: IContextKeyService, configurationService: IConfigurationService, contextService: IWorkspaceContextService, environmentService: IEnvironmentService, uriIdentityService: IUriIdentityService, fileService: IFileService, markerService: IMarkerService, textResourceConfigurationService: ITextResourceConfigurationService);
    private createReadonlyMatcher;
    isReadonly(resource: URI, stat?: IBaseFileStat): boolean | IMarkdownString;
    updateReadonly(resource: URI | URI[], readonly: true | false | "toggle" | "reset"): Promise<void>;
    private applyReadonly;
    private registerListeners;
    protected onFilesConfigurationChange(configuration: IFilesConfiguration, fromEvent: boolean): void;
    getAutoSaveConfiguration(resourceOrEditor: EditorInput | URI | undefined): ICachedAutoSaveConfiguration;
    private computeAutoSaveConfiguration;
    private toResource;
    hasShortAutoSaveDelay(resourceOrEditor: EditorInput | URI | undefined): boolean;
    getAutoSaveMode(resourceOrEditor: EditorInput | URI | undefined, saveReason?: SaveReason): IAutoSaveMode;
    toggleAutoSave(): Promise<void>;
    enableAutoSaveAfterShortDelay(resourceOrEditor: EditorInput | URI): IDisposable;
    disableAutoSave(resourceOrEditor: EditorInput | URI): IDisposable;
    get isHotExitEnabled(): boolean;
    get hotExitConfiguration(): string;
    preventSaveConflicts(resource: URI, language?: string): boolean;
}
export {};
