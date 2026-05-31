import { Event } from "../../../../../base/common/event.js";
import { URI } from "../../../../../base/common/uri.js";
import { IChatTodo } from "@codingame/monaco-vscode-chat-service-override/vscode/vs/workbench/contrib/chat/common/tools/chatTodoListService";
export declare const IChatTodoListService: import("../../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IChatTodoListService>;
export interface IChatTodoListService {
    readonly _serviceBrand: undefined;
    readonly onDidUpdateTodos: Event<URI>;
    getTodos(sessionResource: URI): IChatTodo[];
    setTodos(sessionResource: URI, todos: IChatTodo[]): void;
    migrateTodos(oldSessionResource: URI, newSessionResource: URI): void;
}
