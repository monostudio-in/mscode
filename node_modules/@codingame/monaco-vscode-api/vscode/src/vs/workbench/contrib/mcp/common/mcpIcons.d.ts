import { URI } from "../../../../base/common/uri.js";
import { ILogger } from "../../../../platform/log/common/log.js";
import { Dto } from "../../../services/extensions/common/proxyIdentifier.js";
import { IMcpIcons, McpServerLaunch } from "./mcpTypes.js";
import { MCP } from "./modelContextProtocol.js";
declare enum IconTheme {
    Light = 0,
    Dark = 1,
    Any = 2
}
interface IIcon {
    /** URI the image can be loaded from */
    src: URI;
    /** Theme for this icon. */
    theme: IconTheme;
    /** Sizes of the icon in ascending order. */
    sizes: {
        width: number;
        height: number;
    }[];
}
export type ParsedMcpIcons = IIcon[];
export type StoredMcpIcons = Dto<IIcon>[];
export declare function parseAndValidateMcpIcon(icons: MCP.Icons, launch: McpServerLaunch, logger: ILogger): ParsedMcpIcons;
export declare class McpIcons implements IMcpIcons {
    private readonly _icons;
    static fromStored(icons: StoredMcpIcons | undefined): McpIcons;
    static fromParsed(icons: ParsedMcpIcons | undefined): McpIcons;
    protected constructor(_icons: IIcon[]);
    getUrl(size: number): {
        dark: URI;
        light?: URI;
    } | undefined;
    private getSizeWithTheme;
}
export {};
