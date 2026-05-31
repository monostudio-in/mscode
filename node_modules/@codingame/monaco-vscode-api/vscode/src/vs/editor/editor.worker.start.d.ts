import { IWorkerContext } from "./common/services/editorWebWorker.js";
/**
 * Used by `monaco-editor` to hook up web worker rpc.
 * @skipMangle
 * @internal
 */
export declare function start<THost extends object, TClient extends object>(createClient: (ctx: IWorkerContext<THost>) => TClient): TClient;
