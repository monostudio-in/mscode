import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { LogLevel } from "../../../../platform/log/common/log.js";
import { IOutputViewFilters, IOutputChannel, IOutputChannelDescriptor } from "./output.js";
export declare const IOutputService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOutputService>;
/**
* The output service to manage output from the various processes running.
*/
export interface IOutputService {
    readonly _serviceBrand: undefined;
    /**
    *  Output view filters.
    */
    readonly filters: IOutputViewFilters;
    /**
    * Given the channel id returns the output channel instance.
    * Channel should be first registered via OutputChannelRegistry.
    */
    getChannel(id: string): IOutputChannel | undefined;
    /**
    * Given the channel id returns the registered output channel descriptor.
    */
    getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined;
    /**
    * Returns an array of all known output channels descriptors.
    */
    getChannelDescriptors(): IOutputChannelDescriptor[];
    /**
    * Returns the currently active channel.
    * Only one channel can be active at a given moment.
    */
    getActiveChannel(): IOutputChannel | undefined;
    /**
    * Show the channel with the passed id.
    */
    showChannel(id: string, preserveFocus?: boolean): Promise<void>;
    /**
    * Allows to register on active output channel change.
    */
    readonly onActiveOutputChannel: Event<string>;
    /**
    * Register a compound log channel with the given channels.
    */
    registerCompoundLogChannel(channels: IOutputChannelDescriptor[]): string;
    /**
    * Save the logs to a file.
    */
    saveOutputAs(outputPath?: URI, ...channels: IOutputChannelDescriptor[]): Promise<void>;
    /**
    * Checks if the log level can be set for the given channel.
    * @param channel
    */
    canSetLogLevel(channel: IOutputChannelDescriptor): boolean;
    /**
    * Returns the log level for the given channel.
    * @param channel
    */
    getLogLevel(channel: IOutputChannelDescriptor): LogLevel | undefined;
    /**
    * Sets the log level for the given channel.
    * @param channel
    * @param logLevel
    */
    setLogLevel(channel: IOutputChannelDescriptor, logLevel: LogLevel): void;
}
