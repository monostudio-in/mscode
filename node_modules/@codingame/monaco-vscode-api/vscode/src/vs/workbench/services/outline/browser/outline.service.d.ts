import { CancellationToken } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { IEditorPane } from "../../../common/editor.js";
import { OutlineTarget, IOutline, IOutlineCreator } from "./outline.js";
export declare const IOutlineService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOutlineService>;
export interface IOutlineService {
    _serviceBrand: undefined;
    readonly onDidChange: Event<void>;
    canCreateOutline(editor: IEditorPane): boolean;
    createOutline(editor: IEditorPane, target: OutlineTarget, token: CancellationToken): Promise<IOutline<any> | undefined>;
    registerOutlineCreator(creator: IOutlineCreator<any, any>): IDisposable;
}
