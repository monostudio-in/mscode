import { Event } from "../../../base/common/event.js";
import { IDataChannelEvent, CoreDataChannel } from "./dataChannel.js";
export declare const IDataChannelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IDataChannelService>;
export interface IDataChannelService {
    readonly _serviceBrand: undefined;
    readonly onDidSendData: Event<IDataChannelEvent>;
    getDataChannel<T>(channelId: string): CoreDataChannel<T>;
}
