import type * as vscode from "vscode";
import { VSBuffer } from "../../../base/common/buffer.js";
import { CancellationToken } from "../../../base/common/cancellation.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { UriComponents } from "../../../base/common/uri.js";
import { ExtHostChatDebugShape, IChatDebugEventDto, IChatDebugResolvedEventContentDto } from "./extHost.protocol.js";
import { IExtHostRpcService } from "./extHostRpcService.js";
export declare class ExtHostChatDebug extends Disposable implements ExtHostChatDebugShape {
    _serviceBrand: undefined;
    private readonly _proxy;
    private _provider;
    private _nextHandle;
    /** Progress pipelines keyed by `${handle}:${sessionResource}` so multiple sessions can stream concurrently. */
    private readonly _activeProgress;
    private readonly _onDidAddCoreEvent;
    readonly onDidAddCoreEvent: import("../../../base/common/event.js").Event<vscode.ChatDebugEvent>;
    constructor(extHostRpc: IExtHostRpcService);
    private _progressKey;
    private _cleanupProgress;
    registerChatDebugLogProvider(provider: vscode.ChatDebugLogProvider): vscode.Disposable;
    $provideChatDebugLog(handle: number, sessionResource: UriComponents, token: CancellationToken): Promise<IChatDebugEventDto[] | undefined>;
    private _serializeEvent;
    $resolveChatDebugLogEvent(_handle: number, eventId: string, token: CancellationToken): Promise<IChatDebugResolvedEventContentDto | undefined>;
    private _deserializeEvent;
    $onCoreDebugEvent(dto: IChatDebugEventDto): void;
    $exportChatDebugLog(_handle: number, sessionResource: UriComponents, coreEventDtos: IChatDebugEventDto[], sessionTitle: string | undefined, token: CancellationToken): Promise<VSBuffer | undefined>;
    $importChatDebugLog(_handle: number, data: VSBuffer, token: CancellationToken): Promise<{
        uri: UriComponents;
        sessionTitle?: string;
    } | undefined>;
    $getAvailableDebugSessionResources(_handle: number, token: CancellationToken): Promise<{
        uri: UriComponents;
        title?: string;
    }[]>;
    dispose(): void;
}
