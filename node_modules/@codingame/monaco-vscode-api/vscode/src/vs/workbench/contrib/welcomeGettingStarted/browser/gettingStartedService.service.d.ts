import { Event } from "../../../../base/common/event.js";
import { IResolvedWalkthrough, IResolvedWalkthroughStep, IWalkthroughLoose } from "@codingame/monaco-vscode-walkthrough-service-override/vscode/vs/workbench/contrib/welcomeGettingStarted/browser/gettingStartedService";
export declare const IWalkthroughsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWalkthroughsService>;
export interface IWalkthroughsService {
    _serviceBrand: undefined;
    readonly onDidAddWalkthrough: Event<IResolvedWalkthrough>;
    readonly onDidRemoveWalkthrough: Event<string>;
    readonly onDidChangeWalkthrough: Event<IResolvedWalkthrough>;
    readonly onDidProgressStep: Event<IResolvedWalkthroughStep>;
    getWalkthroughs(): IResolvedWalkthrough[];
    getWalkthrough(id: string): IResolvedWalkthrough;
    registerWalkthrough(descriptor: IWalkthroughLoose): void;
    progressByEvent(eventName: string): void;
    progressStep(id: string): void;
    deprogressStep(id: string): void;
    markWalkthroughOpened(id: string): void;
}
