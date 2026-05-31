export interface IAttachSessionEvent {
    sessionId: string;
    subId?: string;
    port: number;
}
export interface ITerminateSessionEvent {
    sessionId: string;
    subId?: string;
}
export interface IReloadSessionEvent {
    sessionId: string;
}
export interface ICloseSessionEvent {
    sessionId: string;
}
export interface IOpenExtensionWindowResult {
    rendererDebugAddr?: string;
    port?: number;
    success: boolean;
}
