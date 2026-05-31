import { IWebWorkerServerRequestHandler, IWebWorkerServerRequestHandlerFactory, WebWorkerServer } from "./webWorker.js";
export declare function initialize<T extends IWebWorkerServerRequestHandler>(factory: IWebWorkerServerRequestHandlerFactory<T>): WebWorkerServer<T>;
export declare function bootstrapWebWorker(factory: IWebWorkerServerRequestHandlerFactory<any>): void;
