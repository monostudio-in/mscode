import { IObservable, IObserver } from "../base.js";
interface IOptions {
    type: "dependencies" | "observers";
    debugNamePostProcessor?: (name: string) => string;
}
export declare function debugGetObservableGraph(obs: IObservable<any> | IObserver, options: IOptions): string;
export {};
