import type { IWorkerContext } from "../vscode/src/vs/editor/common/services/editorWebWorker.js";
type CreateFunction<D, R extends object = object> = (ctx: IWorkerContext<object>, data: D) => R;
declare function initialize<D, R extends object>(createFn: CreateFunction<D, R>): void;
export { initialize };
