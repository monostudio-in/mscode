import type * as vscode from "vscode";
export declare enum NotebookCellKind {
    Markup = 1,
    Code = 2
}
export declare class NotebookRange {
    static isNotebookRange(thing: unknown): thing is vscode.NotebookRange;
    private _start;
    private _end;
    get start(): number;
    get end(): number;
    get isEmpty(): boolean;
    constructor(start: number, end: number);
    with(change: {
        start?: number;
        end?: number;
    }): NotebookRange;
}
export declare class NotebookCellData {
    static validate(data: NotebookCellData): void;
    static isNotebookCellDataArray(value: unknown): value is vscode.NotebookCellData[];
    static isNotebookCellData(value: unknown): value is vscode.NotebookCellData;
    kind: NotebookCellKind;
    value: string;
    languageId: string;
    mime?: string;
    outputs?: vscode.NotebookCellOutput[];
    metadata?: Record<string, unknown>;
    executionSummary?: vscode.NotebookCellExecutionSummary;
    constructor(kind: NotebookCellKind, value: string, languageId: string, mime?: string, outputs?: vscode.NotebookCellOutput[], metadata?: Record<string, unknown>, executionSummary?: vscode.NotebookCellExecutionSummary);
}
export declare class NotebookData {
    cells: NotebookCellData[];
    metadata?: {
        [key: string]: unknown;
    };
    constructor(cells: NotebookCellData[]);
}
export declare class NotebookEdit implements vscode.NotebookEdit {
    static isNotebookCellEdit(thing: unknown): thing is NotebookEdit;
    static replaceCells(range: NotebookRange, newCells: NotebookCellData[]): NotebookEdit;
    static insertCells(index: number, newCells: vscode.NotebookCellData[]): vscode.NotebookEdit;
    static deleteCells(range: NotebookRange): NotebookEdit;
    static updateCellMetadata(index: number, newMetadata: {
        [key: string]: unknown;
    }): NotebookEdit;
    static updateNotebookMetadata(newMetadata: {
        [key: string]: unknown;
    }): NotebookEdit;
    range: NotebookRange;
    newCells: NotebookCellData[];
    newCellMetadata?: {
        [key: string]: unknown;
    };
    newNotebookMetadata?: {
        [key: string]: unknown;
    };
    constructor(range: NotebookRange, newCells: NotebookCellData[]);
}
export declare class NotebookCellOutputItem {
    #private;
    data: Uint8Array;
    mime: string;
    static isNotebookCellOutputItem(obj: unknown): obj is vscode.NotebookCellOutputItem;
    static error(err: Error | {
        name: string;
        message?: string;
        stack?: string;
    }): NotebookCellOutputItem;
    static stdout(value: string): NotebookCellOutputItem;
    static stderr(value: string): NotebookCellOutputItem;
    static bytes(value: Uint8Array, mime?: string): NotebookCellOutputItem;
    static text(value: string, mime?: string): NotebookCellOutputItem;
    static json(value: unknown, mime?: string): NotebookCellOutputItem;
    constructor(data: Uint8Array, mime: string);
}
export declare class NotebookCellOutput {
    static isNotebookCellOutput(candidate: unknown): candidate is vscode.NotebookCellOutput;
    static ensureUniqueMimeTypes(items: NotebookCellOutputItem[], warn?: boolean): NotebookCellOutputItem[];
    id: string;
    items: NotebookCellOutputItem[];
    metadata?: Record<string, unknown>;
    constructor(items: NotebookCellOutputItem[], idOrMetadata?: string | Record<string, unknown>, metadata?: Record<string, unknown>);
}
