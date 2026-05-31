import { SerializedError } from "../errors.js";
import { Event } from "../event.js";
import { Disposable, IDisposable } from "../lifecycle.js";
export interface IWebWorker extends IDisposable {
    getId(): number;
    readonly onMessage: Event<Message>;
    readonly onError: Event<unknown>;
    postMessage(message: Message, transfer: ArrayBuffer[]): void;
}
export declare function logOnceWebWorkerWarning(err: unknown): void;
declare enum MessageType {
    Request = 0,
    Reply = 1,
    SubscribeEvent = 2,
    Event = 3,
    UnsubscribeEvent = 4
}
declare class RequestMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly channel: string;
    readonly method: string;
    readonly args: unknown[];
    readonly type = MessageType.Request;
    constructor(vsWorker: number, req: string, channel: string, method: string, args: unknown[]);
}
declare class ReplyMessage {
    readonly vsWorker: number;
    readonly seq: string;
    readonly res: unknown;
    readonly err: unknown | SerializedError;
    readonly type = MessageType.Reply;
    constructor(vsWorker: number, seq: string, res: unknown, err: unknown | SerializedError);
}
declare class SubscribeEventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly channel: string;
    readonly eventName: string;
    readonly arg: unknown;
    readonly type = MessageType.SubscribeEvent;
    constructor(vsWorker: number, req: string, channel: string, eventName: string, arg: unknown);
}
declare class EventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly event: unknown;
    readonly type = MessageType.Event;
    constructor(vsWorker: number, req: string, event: unknown);
}
declare class UnsubscribeEventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly type = MessageType.UnsubscribeEvent;
    constructor(vsWorker: number, req: string);
}
export type Message = RequestMessage | ReplyMessage | SubscribeEventMessage | EventMessage | UnsubscribeEventMessage;
type ProxiedMethodName = (`$${string}` | `on${string}`);
export type Proxied<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (K extends ProxiedMethodName ? (...args: A) => Promise<Awaited<R>> : never) : never;
};
export interface IWebWorkerClient<TProxy> {
    proxy: Proxied<TProxy>;
    dispose(): void;
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
}
export interface IWebWorkerServer {
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
}
/**
 * Main thread side
 */
export declare class WebWorkerClient<W extends object> extends Disposable implements IWebWorkerClient<W> {
    private readonly _worker;
    private readonly _onModuleLoaded;
    private readonly _protocol;
    readonly proxy: Proxied<W>;
    private readonly _localChannels;
    private readonly _remoteChannels;
    constructor(worker: IWebWorker);
    private _handleMessage;
    private _handleEvent;
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
    private _onError;
}
export interface IWebWorkerServerRequestHandler {
    _requestHandlerBrand: void;
    [prop: string]: any;
}
export interface IWebWorkerServerRequestHandlerFactory<T extends IWebWorkerServerRequestHandler> {
    (workerServer: IWebWorkerServer): T;
}
/**
 * Worker side
 */
export declare class WebWorkerServer<T extends IWebWorkerServerRequestHandler> implements IWebWorkerServer {
    readonly requestHandler: T;
    private _protocol;
    private readonly _localChannels;
    private readonly _remoteChannels;
    constructor(postMessage: (msg: Message, transfer?: ArrayBuffer[]) => void, requestHandlerFactory: IWebWorkerServerRequestHandlerFactory<T>);
    onmessage(msg: unknown): void;
    private _handleMessage;
    private _handleEvent;
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
    private initialize;
}
export {};
