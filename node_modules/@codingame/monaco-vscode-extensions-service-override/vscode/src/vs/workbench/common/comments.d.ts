import { MarshalledId } from "@codingame/monaco-vscode-api/vscode/vs/base/common/marshallingIds";
import { CommentThread } from "@codingame/monaco-vscode-api/vscode/vs/editor/common/languages";
export interface MarshalledCommentThread {
    $mid: MarshalledId.CommentThread;
    commentControlHandle: number;
    commentThreadHandle: number;
}
export interface MarshalledCommentThreadInternal extends MarshalledCommentThread {
    thread: CommentThread;
}
