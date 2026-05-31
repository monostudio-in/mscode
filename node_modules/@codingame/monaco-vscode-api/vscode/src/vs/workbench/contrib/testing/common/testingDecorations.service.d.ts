import { Event } from "../../../../base/common/event.js";
import { URI } from "../../../../base/common/uri.js";
import { Position } from "../../../../editor/common/core/position.js";
import { ITestDecoration } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/testingDecorations";
import { ITestMessage } from "./testTypes.js";
export declare const ITestingDecorationsService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestingDecorationsService>;
export interface ITestingDecorationsService {
    _serviceBrand: undefined;
    /**
    * Fires when something happened to change decorations in an editor.
    * Interested consumers should call {@link syncDecorations} to update them.
    */
    readonly onDidChange: Event<void>;
    /**
    * Signals the code underlying a test message has changed, and it should
    * no longer be decorated in the source.
    */
    invalidateResultMessage(message: ITestMessage): void;
    /**
    * Ensures decorations in the given document URI are up to date,
    * and returns them.
    */
    syncDecorations(resource: URI): Iterable<ITestDecoration> & {
        readonly size: number;
        getById(decorationId: string): ITestDecoration | undefined;
    };
    /**
    * Gets the range where a test ID is displayed, in the given URI.
    * Returns undefined if there's no such decoration.
    */
    getDecoratedTestPosition(resource: URI, testId: string): Position | undefined;
    /**
    * Sets that alternative actions are displayed on the model.
    */
    updateDecorationsAlternateAction(resource: URI, isAlt: boolean): void;
}
