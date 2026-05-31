import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { LogLevel } from "../../../../platform/log/common/log.js";
import { Range } from "../../../../editor/common/core/range.js";
/**
 * Mime type used by the output editor.
 */
export declare const OUTPUT_MIME = "text/x-code-output";
/**
 * Id used by the output editor.
 */
export declare const OUTPUT_MODE_ID = "Log";
/**
 * Mime type used by the log output editor.
 */
export declare const LOG_MIME = "text/x-code-log-output";
/**
 * Id used by the log output editor.
 */
export declare const LOG_MODE_ID = "log";
/**
 * Output view id
 */
export declare const OUTPUT_VIEW_ID = "workbench.panel.output";
export declare const CONTEXT_IN_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_FILE_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_LOG_FILE_OUTPUT: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE: RawContextKey<boolean>;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL: RawContextKey<string>;
export declare const CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT: RawContextKey<boolean>;
export declare const CONTEXT_OUTPUT_SCROLL_LOCK: RawContextKey<boolean>;
export declare const ACTIVE_OUTPUT_CHANNEL_CONTEXT: RawContextKey<string>;
export declare const SHOW_TRACE_FILTER_CONTEXT: RawContextKey<boolean>;
export declare const SHOW_DEBUG_FILTER_CONTEXT: RawContextKey<boolean>;
export declare const SHOW_INFO_FILTER_CONTEXT: RawContextKey<boolean>;
export declare const SHOW_WARNING_FILTER_CONTEXT: RawContextKey<boolean>;
export declare const SHOW_ERROR_FILTER_CONTEXT: RawContextKey<boolean>;
export declare const OUTPUT_FILTER_FOCUS_CONTEXT: RawContextKey<boolean>;
export declare const HIDE_CATEGORY_FILTER_CONTEXT: RawContextKey<string>;
export interface IOutputViewFilters {
    readonly onDidChange: Event<void>;
    text: string;
    readonly includePatterns: string[];
    readonly excludePatterns: string[];
    trace: boolean;
    debug: boolean;
    info: boolean;
    warning: boolean;
    error: boolean;
    categories: string;
    toggleCategory(category: string): void;
    hasCategory(category: string): boolean;
}
export declare enum OutputChannelUpdateMode {
    Append = 1,
    Replace = 2,
    Clear = 3
}
export interface ILogEntry {
    readonly range: Range;
    readonly timestamp: number;
    readonly timestampRange: Range;
    readonly logLevel: LogLevel;
    readonly logLevelRange: Range;
    readonly category: string | undefined;
}
export interface IOutputChannel {
    /**
     * Identifier of the output channel.
     */
    readonly id: string;
    /**
     * Label of the output channel to be displayed to the user.
     */
    readonly label: string;
    /**
     * URI of the output channel.
     */
    readonly uri: URI;
    /**
     * Log entries of the output channel.
     */
    getLogEntries(): readonly ILogEntry[];
    /**
     * Appends output to the channel.
     */
    append(output: string): void;
    /**
     * Clears all received output for this channel.
     */
    clear(): void;
    /**
     * Replaces the content of the channel with given output
     */
    replace(output: string): void;
    /**
     * Update the channel.
     */
    update(mode: OutputChannelUpdateMode.Append): void;
    update(mode: OutputChannelUpdateMode, till: number): void;
    /**
     * Disposes the output channel.
     */
    dispose(): void;
}
export declare const Extensions: {
    OutputChannels: string;
};
export interface IOutputChannelDescriptor {
    id: string;
    label: string;
    log: boolean;
    languageId?: string;
    source?: IOutputContentSource | ReadonlyArray<IOutputContentSource>;
    extensionId?: string;
    user?: boolean;
}
export interface ISingleSourceOutputChannelDescriptor extends IOutputChannelDescriptor {
    source: IOutputContentSource;
}
export interface IMultiSourceOutputChannelDescriptor extends IOutputChannelDescriptor {
    source: ReadonlyArray<IOutputContentSource>;
}
export declare function isSingleSourceOutputChannelDescriptor(descriptor: IOutputChannelDescriptor): descriptor is ISingleSourceOutputChannelDescriptor;
export declare function isMultiSourceOutputChannelDescriptor(descriptor: IOutputChannelDescriptor): descriptor is IMultiSourceOutputChannelDescriptor;
export interface IOutputContentSource {
    readonly name?: string;
    readonly resource: URI;
}
export interface IOutputChannelRegistry {
    readonly onDidRegisterChannel: Event<string>;
    readonly onDidRemoveChannel: Event<IOutputChannelDescriptor>;
    readonly onDidUpdateChannelSources: Event<IMultiSourceOutputChannelDescriptor>;
    /**
     * Make an output channel known to the output world.
     */
    registerChannel(descriptor: IOutputChannelDescriptor): void;
    /**
     * Update the files for the given output channel.
     */
    updateChannelSources(id: string, sources: IOutputContentSource[]): void;
    /**
     * Returns the list of channels known to the output world.
     */
    getChannels(): IOutputChannelDescriptor[];
    /**
     * Returns the channel with the passed id.
     */
    getChannel(id: string): IOutputChannelDescriptor | undefined;
    /**
     * Remove the output channel with the passed id.
     */
    removeChannel(id: string): void;
}
