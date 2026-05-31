import { CancellationToken } from "../../../../base/common/cancellation.js";
import { IReference, IDisposable } from "../../../../base/common/lifecycle.js";
import { IExpression, IDebugSession, IDebugVisualizationTreeItem } from "./debug.js";
import { VisualizedExpression } from "./debugModel.js";
import { DebugVisualizer, VisualizerHandle, VisualizerTreeHandle } from "@codingame/monaco-vscode-debug-service-override/vscode/vs/workbench/contrib/debug/common/debugVisualizers";
export declare const IDebugVisualizerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDebugVisualizerService>;
export interface IDebugVisualizerService {
    _serviceBrand: undefined;
    /**
    * Gets visualizers applicable for the given Expression.
    */
    getApplicableFor(expression: IExpression, token: CancellationToken): Promise<IReference<DebugVisualizer[]>>;
    /**
    * Registers a new visualizer (called from the main thread debug service)
    */
    register(handle: VisualizerHandle): IDisposable;
    /**
    * Registers a new visualizer tree.
    */
    registerTree(treeId: string, handle: VisualizerTreeHandle): IDisposable;
    /**
    * Sets that a certa tree should be used for the visualized node
    */
    getVisualizedNodeFor(treeId: string, expr: IExpression): Promise<VisualizedExpression | undefined>;
    /**
    * Gets children for a visualized tree node.
    */
    getVisualizedChildren(session: IDebugSession | undefined, treeId: string, treeElementId: number): Promise<IExpression[]>;
    /**
    * Gets children for a visualized tree node.
    */
    editTreeItem(treeId: string, item: IDebugVisualizationTreeItem, newValue: string): Promise<void>;
}
