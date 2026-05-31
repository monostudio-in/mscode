import { ITerminalService } from "../../terminal/browser/terminal.service.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { IDebugService } from "../../debug/common/debug.service.js";
export declare class UrlFinder extends Disposable {
    /**
     * Debounce time in ms before processing accumulated terminal data.
     */
    private static readonly dataDebounceTimeout;
    /**
     * Maximum amount of data to accumulate before skipping URL detection.
     * When data exceeds this threshold, it indicates high-throughput scenarios
     * (like games or animations) where URL detection is unlikely to find useful results.
     */
    private static readonly maxDataLength;
    /**
     * Local server url pattern matching following urls:
     * http://localhost:3000/ - commonly used across multiple frameworks
     * https://127.0.0.1:5001/ - ASP.NET
     * http://:8080 - Beego Golang
     * http://0.0.0.0:4000 - Elixir Phoenix
     */
    private static readonly localUrlRegex;
    private static readonly extractPortRegex;
    /**
     * https://github.com/microsoft/vscode-remote-release/issues/3949
     */
    private static readonly localPythonServerRegex;
    private static readonly excludeTerminals;
    private readonly _onDidMatchLocalUrl;
    readonly onDidMatchLocalUrl: import("../../../../base/common/event.js").Event<{
        host: string;
        port: number;
    }>;
    private readonly listeners;
    private readonly terminalDataWorkers;
    constructor(terminalService: ITerminalService, debugService: IDebugService);
    private registerTerminalInstance;
    private getOrCreateWorker;
    private processTerminalData;
    private replPositions;
    private processNewReplElements;
    dispose(): void;
    private processData;
}
