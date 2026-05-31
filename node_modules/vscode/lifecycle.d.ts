import { IInstantiationService, type ServicesAccessor } from "./vscode/src/vs/platform/instantiation/common/instantiation.js";
import { Barrier } from "./vscode/src/vs/base/common/async.js";
import { Emitter } from "./vscode/src/vs/base/common/event.js";
export declare const onLayout: import("./vscode/src/vs/base/common/event.js").Event<ServicesAccessor>;
export declare const onRenderWorkbench: import("./vscode/src/vs/base/common/event.js").Event<ServicesAccessor>;
export declare const serviceInitializedBarrier: Barrier;
export declare const serviceInitializedEmitter: Emitter<void>;
interface ServiceInitializeParticipant {
    (accessor: ServicesAccessor): Promise<void>;
}
export declare function registerServiceInitializePreParticipant(participant: ServiceInitializeParticipant): void;
export declare function registerServiceInitializeParticipant(participant: ServiceInitializeParticipant): void;
export declare function registerServiceInitializePostParticipant(participant: ServiceInitializeParticipant): void;
export declare function startup(instantiationService: IInstantiationService): Promise<void>;
export declare let servicesInitialized: boolean;
export declare function waitServicesReady(): Promise<void>;
export declare function checkServicesReady(): void;
export declare function checkServicesNotInitialized(): void;
export {};
