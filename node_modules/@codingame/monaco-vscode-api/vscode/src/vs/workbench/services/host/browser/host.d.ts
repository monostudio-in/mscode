export interface IToastOptions {
    readonly title: string;
    readonly body?: string;
    readonly actions?: readonly string[];
    readonly silent?: boolean;
}
export interface IToastResult {
    readonly supported: boolean;
    readonly clicked: boolean;
    readonly actionIndex?: number;
}
