import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { Event } from "../../../../base/common/event.js";
import { IDisposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { type TimelineProvidersChangeEvent, type TimelineChangeEvent, type TimelineProvider, type TimelineSource, type TimelineOptions, type TimelineRequest } from "./timeline.js";
export declare const ITimelineService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITimelineService>;
export interface ITimelineService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeProviders: Event<TimelineProvidersChangeEvent>;
    readonly onDidChangeTimeline: Event<TimelineChangeEvent>;
    readonly onDidChangeUri: Event<URI>;
    registerTimelineProvider(provider: TimelineProvider): IDisposable;
    unregisterTimelineProvider(id: string): void;
    getSources(): TimelineSource[];
    getTimeline(id: string, uri: URI, options: TimelineOptions, tokenSource: CancellationTokenSource): TimelineRequest | undefined;
    setUri(uri: URI): void;
}
