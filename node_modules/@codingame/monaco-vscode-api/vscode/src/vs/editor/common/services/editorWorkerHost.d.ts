import { IWebWorkerServer, IWebWorkerClient } from "../../../base/common/worker/webWorker.js";
export declare abstract class EditorWorkerHost {
    static CHANNEL_NAME: string;
    static getChannel(workerServer: IWebWorkerServer): EditorWorkerHost;
    static setChannel(workerClient: IWebWorkerClient<unknown>, obj: EditorWorkerHost): void;
    abstract $fhr(method: string, args: unknown[]): Promise<unknown>;
}
