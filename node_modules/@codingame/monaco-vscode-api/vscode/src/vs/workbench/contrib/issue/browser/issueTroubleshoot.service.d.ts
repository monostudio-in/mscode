export declare const ITroubleshootIssueService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITroubleshootIssueService>;
export interface ITroubleshootIssueService {
    _serviceBrand: undefined;
    isActive(): boolean;
    start(): Promise<void>;
    resume(): Promise<void>;
    stop(): Promise<void>;
}
