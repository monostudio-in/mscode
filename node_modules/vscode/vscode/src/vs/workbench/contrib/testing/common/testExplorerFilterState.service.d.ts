import { Event } from "../../../../base/common/event.js";
import { ISettableObservable } from "../../../../base/common/observable.js";
import { IObservableValue, MutableObservableValue } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/observableValue";
import { TestFilterTerm } from "@codingame/monaco-vscode-testing-service-override/vscode/vs/workbench/contrib/testing/common/testExplorerFilterState";
export interface ITestExplorerFilterState {
    _serviceBrand: undefined;
    /** Current filter text */
    readonly text: IObservableValue<string>;
    /** Test ID the user wants to reveal in the explorer */
    readonly reveal: ISettableObservable<string | undefined>;
    /** A test was selected in the explorer. */
    readonly onDidSelectTestInExplorer: Event<string | undefined>;
    /** Event that fires when {@link focusInput} is invoked. */
    readonly onDidRequestInputFocus: Event<void>;
    /**
    * Glob list to filter for based on the {@link text}
    */
    readonly globList: readonly {
        include: boolean;
        text: string;
    }[];
    /**
    * The user requested to filter including tags.
    */
    readonly includeTags: ReadonlySet<string>;
    /**
    * The user requested to filter excluding tags.
    */
    readonly excludeTags: ReadonlySet<string>;
    /**
    * Whether fuzzy searching is enabled.
    */
    readonly fuzzy: MutableObservableValue<boolean>;
    /**
    * Focuses the filter input in the test explorer view.
    */
    focusInput(): void;
    /**
    * Replaces the filter {@link text}.
    */
    setText(text: string): void;
    /**
    * Sets whether the {@link text} is filtering for a special term.
    */
    isFilteringFor(term: TestFilterTerm): boolean;
    /**
    * Sets whether the {@link text} includes a special filter term.
    */
    toggleFilteringFor(term: TestFilterTerm, shouldFilter?: boolean): void;
    /**
    * Called when a test in the test explorer is selected.
    */
    didSelectTestInExplorer(testId: string): void;
}
export declare const ITestExplorerFilterState: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITestExplorerFilterState>;
