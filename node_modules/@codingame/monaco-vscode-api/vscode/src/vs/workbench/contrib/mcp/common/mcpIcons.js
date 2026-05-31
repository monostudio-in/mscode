
import { getMediaMime } from '../../../../base/common/mime.js';
import { URI } from '../../../../base/common/uri.js';
import { McpServerTransportType } from './mcpTypes.js';

const mcpAllowableContentTypes = ["image/webp", "image/png", "image/jpeg", "image/jpg", "image/gif"];
var IconTheme;
(function(IconTheme) {
    IconTheme[IconTheme["Light"] = 0] = "Light";
    IconTheme[IconTheme["Dark"] = 1] = "Dark";
    IconTheme[IconTheme["Any"] = 2] = "Any";
})(IconTheme || (IconTheme = {}));
function validateIcon(icon, launch, logger) {
    const mimeType = icon.mimeType?.toLowerCase() || getMediaMime(icon.src);
    if (!mimeType || !mcpAllowableContentTypes.includes(mimeType)) {
        logger.debug(
            `Ignoring icon with unsupported mime type: ${icon.src} (${mimeType}), allowed: ${mcpAllowableContentTypes.join(", ")}`
        );
        return;
    }
    const uri = ( URI.parse(icon.src));
    if (uri.scheme === "data") {
        return uri;
    }
    if (uri.scheme === "https" || uri.scheme === "http") {
        if (launch.type !== McpServerTransportType.HTTP) {
            logger.debug(
                `Ignoring icon with HTTP/HTTPS URL: ${icon.src} as the MCP server is not launched with HTTP transport.`
            );
            return;
        }
        const expectedAuthority = launch.uri.authority.toLowerCase();
        if (uri.authority.toLowerCase() !== expectedAuthority) {
            logger.debug(
                `Ignoring icon with untrusted authority: ${icon.src}, expected authority: ${expectedAuthority}`
            );
            return;
        }
        return uri;
    }
    if (uri.scheme === "file") {
        if (launch.type !== McpServerTransportType.Stdio) {
            logger.debug(
                `Ignoring icon with file URL: ${icon.src} as the MCP server is not launched as a local process.`
            );
            return;
        }
        return uri;
    }
    logger.debug(
        `Ignoring icon with unsupported scheme: ${icon.src}. Allowed: data:, http:, https:, file:`
    );
    return;
}
function parseAndValidateMcpIcon(icons, launch, logger) {
    const result = [];
    for (const icon of icons.icons || []) {
        const uri = validateIcon(icon, launch, logger);
        if (!uri) {
            continue;
        }
        const sizesArr = typeof icon.sizes === "string" ? icon.sizes.split(" ") : Array.isArray(icon.sizes) ? icon.sizes : [];
        result.push({
            src: uri,
            theme: icon.theme === "light" ? IconTheme.Light : icon.theme === "dark" ? IconTheme.Dark : IconTheme.Any,
            sizes: ( sizesArr.map(size => {
                const [widthStr, heightStr] = size.toLowerCase().split("x");
                return {
                    width: Number(widthStr) || 0,
                    height: Number(heightStr) || 0
                };
            })).sort((a, b) => a.width - b.width)
        });
    }
    result.sort((a, b) => a.sizes[0]?.width - b.sizes[0]?.width);
    return result;
}
class McpIcons {
    static fromStored(icons) {
        return McpIcons.fromParsed(icons?.map(i => ({
            src: URI.revive(i.src),
            theme: i.theme,
            sizes: i.sizes
        })));
    }
    static fromParsed(icons) {
        return ( new McpIcons(icons || []));
    }
    constructor(_icons) {
        this._icons = _icons;
    }
    getUrl(size) {
        const dark = this.getSizeWithTheme(size, IconTheme.Dark);
        if (dark?.theme === IconTheme.Any) {
            return {
                dark: dark.src
            };
        }
        const light = this.getSizeWithTheme(size, IconTheme.Light);
        if (!light && !dark) {
            return undefined;
        }
        return {
            dark: (dark || light).src,
            light: light?.src
        };
    }
    getSizeWithTheme(size, theme) {
        let bestOfAnySize;
        for (const icon of this._icons) {
            if (icon.theme === theme || icon.theme === IconTheme.Any || icon.theme === undefined) {
                bestOfAnySize = icon;
                const matchingSize = icon.sizes.find(s => s.width >= size);
                if (matchingSize) {
                    return {
                        ...icon,
                        sizes: [matchingSize]
                    };
                }
            }
        }
        return bestOfAnySize;
    }
}

export { McpIcons, parseAndValidateMcpIcon };
