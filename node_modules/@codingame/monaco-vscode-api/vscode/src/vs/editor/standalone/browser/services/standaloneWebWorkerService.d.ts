import { WebWorkerDescriptor } from "../../../../platform/webWorker/browser/webWorkerDescriptor.js";
import { WebWorkerService } from "../../../../platform/webWorker/browser/webWorkerServiceImpl.js";
export declare class StandaloneWebWorkerService extends WebWorkerService {
    protected _createWorker(descriptor: WebWorkerDescriptor): Promise<Worker>;
    protected _getWorkerLoadingFailedErrorMessage(descriptor: WebWorkerDescriptor): string | undefined;
    getWorkerUrl(descriptor: WebWorkerDescriptor): string;
    getWorkerOptions(descriptor: WebWorkerDescriptor): WorkerOptions | undefined;
}
