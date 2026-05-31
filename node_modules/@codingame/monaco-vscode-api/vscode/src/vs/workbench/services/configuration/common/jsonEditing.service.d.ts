import { URI } from "../../../../base/common/uri.js";
import { IJSONValue } from "./jsonEditing.js";
export declare const IJSONEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IJSONEditingService>;
export interface IJSONEditingService {
    readonly _serviceBrand: undefined;
    write(resource: URI, values: IJSONValue[], save: boolean): Promise<void>;
}
