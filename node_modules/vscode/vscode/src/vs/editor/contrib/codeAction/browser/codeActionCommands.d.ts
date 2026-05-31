import { TypeFromJsonSchema } from "../../../../base/common/jsonSchema.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorAction2, EditorCommand, ServicesAccessor } from "../../../browser/editorExtensions.js";
import { CodeActionAutoApply } from "../common/types.js";
declare const argsSchema: {
    readonly type: "object";
    readonly defaultSnippets: [
        {
            readonly body: {
                readonly kind: "";
            };
        }
    ];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
            readonly description: string;
        };
        readonly apply: {
            readonly type: "string";
            readonly description: string;
            readonly default: CodeActionAutoApply.IfSingle;
            readonly enum: [
                CodeActionAutoApply.First,
                CodeActionAutoApply.IfSingle,
                CodeActionAutoApply.Never
            ];
            readonly enumDescriptions: [
                string,
                string,
                string
            ];
        };
        readonly preferred: {
            readonly type: "boolean";
            readonly default: false;
            readonly description: string;
        };
    };
};
export declare class QuickFixAction extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class CodeActionCommand extends EditorCommand {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs?: TypeFromJsonSchema<typeof argsSchema>): void;
}
export declare class RefactorAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs?: TypeFromJsonSchema<typeof argsSchema>): void;
}
export declare class SourceAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs?: TypeFromJsonSchema<typeof argsSchema>): void;
}
export declare class OrganizeImportsAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class FixAllAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class AutoFixAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export {};
