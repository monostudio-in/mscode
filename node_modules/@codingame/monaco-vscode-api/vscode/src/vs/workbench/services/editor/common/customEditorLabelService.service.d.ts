import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
export declare const ICustomEditorLabelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ICustomEditorLabelService>;
export interface ICustomEditorLabelService {
    readonly _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    getName(resource: URI): string | undefined;
}
