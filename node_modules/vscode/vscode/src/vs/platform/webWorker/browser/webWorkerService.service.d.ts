import { IWebWorkerClient } from "../../../base/common/worker/webWorker.js";
import { WebWorkerDescriptor } from "./webWorkerDescriptor.js";
export declare const IWebWorkerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWebWorkerService>;
export interface IWebWorkerService {
    readonly _serviceBrand: undefined;
    createWorkerClient<T extends object>(workerDescriptor: WebWorkerDescriptor | Worker | Promise<Worker>): IWebWorkerClient<T>;
    getWorkerUrl(descriptor: WebWorkerDescriptor): string;
    getWorkerOptions(descriptor: WebWorkerDescriptor): WorkerOptions | undefined;
}
