import { Event } from "../../../base/common/event.js";
import { IDataChannelService } from "./dataChannel.service.js";
export interface CoreDataChannel<T = unknown> {
    sendData(data: T): void;
}
export interface IDataChannelEvent<T = unknown> {
    channelId: string;
    data: T;
}
export declare class NullDataChannelService implements IDataChannelService {
    _serviceBrand: undefined;
    get onDidSendData(): Event<IDataChannelEvent<unknown>>;
    getDataChannel<T>(_channelId: string): CoreDataChannel<T>;
}
