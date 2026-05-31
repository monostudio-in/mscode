import { IEditorOptions } from "../../common/config/editorOptions.js";
export interface ISettingsReader {
    (key: string): unknown;
}
export interface ISettingsWriter {
    (key: string, value: unknown): void;
}
export declare class EditorSettingMigration {
    readonly key: string;
    readonly migrate: (value: unknown, read: ISettingsReader, write: ISettingsWriter) => void;
    static items: EditorSettingMigration[];
    constructor(key: string, migrate: (value: unknown, read: ISettingsReader, write: ISettingsWriter) => void);
    apply(options: unknown): void;
    private static _read;
    private static _write;
}
/**
 * Compatibility with old options
 */
export declare function migrateOptions(options: IEditorOptions): void;
