export declare class CodeActionKind {
    readonly value: string;
    private static readonly sep;
    static Empty: CodeActionKind;
    static QuickFix: CodeActionKind;
    static Refactor: CodeActionKind;
    static RefactorExtract: CodeActionKind;
    static RefactorInline: CodeActionKind;
    static RefactorMove: CodeActionKind;
    static RefactorRewrite: CodeActionKind;
    static Source: CodeActionKind;
    static SourceOrganizeImports: CodeActionKind;
    static SourceFixAll: CodeActionKind;
    static Notebook: CodeActionKind;
    constructor(value: string);
    append(parts: string): CodeActionKind;
    intersects(other: CodeActionKind): boolean;
    contains(other: CodeActionKind): boolean;
}
