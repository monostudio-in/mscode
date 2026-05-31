import { API, SimpleTypedRpcConnection, MakeSideAsync } from "./rpc.js";
export declare function registerDebugChannel<T extends {
    channelId: string;
} & API>(channelId: T["channelId"], createClient: () => T["client"]): SimpleTypedRpcConnection<MakeSideAsync<T["host"]>>;
