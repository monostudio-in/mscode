import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Disposable, IDisposable } from "../../../../base/common/lifecycle.js";
import type { McpServerRequestHandler } from "@codingame/monaco-vscode-mcp-service-override/vscode/vs/workbench/contrib/mcp/common/mcpServerRequestHandler";
import { MCP } from "./modelContextProtocol.js";
export interface IMcpTaskInternal extends IDisposable {
    readonly id: string;
    onDidUpdateState(task: MCP.Task): void;
    setHandler(handler: McpServerRequestHandler | undefined): void;
}
/**
 * Manages in-memory task state for server-side MCP tasks (sampling and elicitation).
 * Also tracks client-side tasks to survive handler reconnections.
 * Lifecycle is tied to the McpServer instance.
 */
export declare class McpTaskManager extends Disposable {
    private readonly _serverTasks;
    private readonly _clientTasks;
    private readonly _onDidUpdateTask;
    readonly onDidUpdateTask: import("../../../../base/common/event.js").Event<MCP.Task>;
    /**
     * Attach a new handler to this task manager.
     * Updates all client tasks to use the new handler.
     */
    setHandler(handler: McpServerRequestHandler | undefined): void;
    /**
     * Get a client task by ID for status notification handling.
     */
    getClientTask(taskId: string): IMcpTaskInternal | undefined;
    /**
     * Track a new client task.
     */
    adoptClientTask(task: IMcpTaskInternal): void;
    /**
     * Untracks a client task.
     */
    abandonClientTask(taskId: string): void;
    /**
     * Create a new task and execute it asynchronously.
     * Returns the task immediately while execution continues in the background.
     */
    createTask<TResult extends MCP.Result>(ttl: number | null, executor: (token: CancellationToken) => Promise<TResult>): MCP.CreateTaskResult;
    /**
     * Execute a task asynchronously and update its state.
     */
    private _executeTask;
    /**
     * Update task status and optionally store result or error.
     */
    private _updateTaskStatus;
    /**
     * Get the current state of a task.
     * Returns an error if the task doesn't exist or has expired.
     */
    getTask(taskId: string): MCP.GetTaskResult;
    /**
     * Get the result of a completed task.
     * Blocks until the task completes if it's still in progress.
     */
    getTaskResult(taskId: string): Promise<MCP.GetTaskPayloadResult>;
    /**
     * Cancel a task.
     */
    cancelTask(taskId: string): MCP.CancelTaskResult;
    /**
     * List all tasks.
     */
    listTasks(): MCP.ListTasksResult;
}
