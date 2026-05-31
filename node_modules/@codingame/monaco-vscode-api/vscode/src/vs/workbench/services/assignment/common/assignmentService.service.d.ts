import { IAssignmentService } from "@codingame/monaco-vscode-update-service-override/vscode/vs/platform/assignment/common/assignment";
import { IAssignmentFilter } from "./assignmentService.js";
export declare const IWorkbenchAssignmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchAssignmentService>;
export interface IWorkbenchAssignmentService extends IAssignmentService {
    getCurrentExperiments(): Promise<string[] | undefined>;
    addTelemetryAssignmentFilter(filter: IAssignmentFilter): void;
}
