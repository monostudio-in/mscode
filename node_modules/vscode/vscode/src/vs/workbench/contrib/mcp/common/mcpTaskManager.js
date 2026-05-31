
import { disposableTimeout } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable, DisposableMap, DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { McpError } from './mcpTypes.js';
import { MCP } from '../../../../platform/mcp/common/modelContextProtocol.js';

class McpTaskManager extends Disposable {
    constructor() {
        super(...arguments);
        this._serverTasks = this._register(( new DisposableMap()));
        this._clientTasks = this._register(( new DisposableMap()));
        this._onDidUpdateTask = this._register(( new Emitter()));
        this.onDidUpdateTask = this._onDidUpdateTask.event;
    }
    setHandler(handler) {
        for (const task of ( this._clientTasks.values())) {
            task.setHandler(handler);
        }
    }
    getClientTask(taskId) {
        return this._clientTasks.get(taskId);
    }
    adoptClientTask(task) {
        this._clientTasks.set(task.id, task);
    }
    abandonClientTask(taskId) {
        this._clientTasks.deleteAndDispose(taskId);
    }
    createTask(ttl, executor) {
        const taskId = generateUuid();
        const createdAt = ( new Date()).toISOString();
        const createdAtTime = Date.now();
        const task = {
            taskId,
            status: "working",
            createdAt,
            ttl,
            lastUpdatedAt: ( new Date()).toISOString(),
            pollInterval: 1000
        };
        const store = ( new DisposableStore());
        const cts = ( new CancellationTokenSource());
        store.add(toDisposable(() => cts.dispose(true)));
        const executionPromise = this._executeTask(taskId, executor, cts.token);
        if (ttl) {
            store.add(disposableTimeout(() => this._serverTasks.deleteAndDispose(taskId), ttl));
        } else {
            executionPromise.finally(() => {
                const timeout = this._register(disposableTimeout(() => {
                    this._serverTasks.deleteAndDispose(taskId);
                    this._store.delete(timeout);
                }, 60_000));
            });
        }
        this._serverTasks.set(taskId, {
            task,
            cts,
            dispose: () => store.dispose(),
            createdAtTime,
            executionPromise
        });
        return {
            task
        };
    }
    async _executeTask(taskId, executor, token) {
        try {
            const result = await executor(token);
            this._updateTaskStatus(taskId, "completed", undefined, result);
        } catch (error) {
            if (error instanceof CancellationError) {
                this._updateTaskStatus(taskId, "cancelled", "Task was cancelled by the client");
            } else if (error instanceof McpError) {
                this._updateTaskStatus(taskId, "failed", error.message, undefined, {
                    code: error.code,
                    message: error.message,
                    data: error.data
                });
            } else if (error instanceof Error) {
                this._updateTaskStatus(taskId, "failed", error.message, undefined, {
                    code: MCP.INTERNAL_ERROR,
                    message: error.message
                });
            } else {
                this._updateTaskStatus(taskId, "failed", "Unknown error", undefined, {
                    code: MCP.INTERNAL_ERROR,
                    message: "Unknown error"
                });
            }
        }
    }
    _updateTaskStatus(taskId, status, statusMessage, result, error) {
        const entry = this._serverTasks.get(taskId);
        if (!entry) {
            return;
        }
        entry.task.status = status;
        entry.task.lastUpdatedAt = ( new Date()).toISOString();
        if (statusMessage !== undefined) {
            entry.task.statusMessage = statusMessage;
        }
        if (result !== undefined) {
            entry.result = result;
        }
        if (error !== undefined) {
            entry.error = error;
        }
        this._onDidUpdateTask.fire({
            ...entry.task
        });
    }
    getTask(taskId) {
        const entry = this._serverTasks.get(taskId);
        if (!entry) {
            throw ( new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`));
        }
        return {
            ...entry.task
        };
    }
    async getTaskResult(taskId) {
        const entry = this._serverTasks.get(taskId);
        if (!entry) {
            throw ( new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`));
        }
        if (entry.task.status === "working" || entry.task.status === "input_required") {
            await entry.executionPromise;
        }
        const updatedEntry = this._serverTasks.get(taskId);
        if (!updatedEntry) {
            throw ( new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`));
        }
        if (updatedEntry.error) {
            throw ( new McpError(
                updatedEntry.error.code,
                updatedEntry.error.message,
                updatedEntry.error.data
            ));
        }
        if (!updatedEntry.result) {
            throw ( new McpError(MCP.INTERNAL_ERROR, "Task completed but no result available"));
        }
        return updatedEntry.result;
    }
    cancelTask(taskId) {
        const entry = this._serverTasks.get(taskId);
        if (!entry) {
            throw ( new McpError(MCP.INVALID_PARAMS, `Task not found: ${taskId}`));
        }
        if (entry.task.status === "completed" || entry.task.status === "failed" || entry.task.status === "cancelled") {
            throw ( new McpError(MCP.INVALID_PARAMS, `Cannot cancel task in ${entry.task.status} status`));
        }
        entry.task.status = "cancelled";
        entry.task.statusMessage = "Task was cancelled by the client";
        entry.cts.cancel();
        return {
            ...entry.task
        };
    }
    listTasks() {
        const tasks = [];
        for (const entry of ( this._serverTasks.values())) {
            tasks.push({
                ...entry.task
            });
        }
        return {
            tasks
        };
    }
}

export { McpTaskManager };
