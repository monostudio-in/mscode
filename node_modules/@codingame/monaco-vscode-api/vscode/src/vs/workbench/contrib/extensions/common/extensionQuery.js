
import { FilterType, SortBy } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { EXTENSION_CATEGORIES } from '../../../../platform/extensions/common/extensions.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { Extensions } from '../../../services/extensionManagement/common/extensionFeatures.js';

class Query {
    constructor(value, sortBy) {
        this.value = value;
        this.sortBy = sortBy;
        this.value = value.trim();
    }
    static suggestions(query, galleryManifest) {
        const commands = ["installed", "updates", "enabled", "disabled", "builtin", "contribute"];
        if (galleryManifest?.capabilities.extensionQuery?.filtering?.some(c => c.name === FilterType.Featured)) {
            commands.push("featured");
        }
        commands.push(...[
            "mcp",
            "agentPlugins",
            "popular",
            "recommended",
            "recentlyPublished",
            "workspaceUnsupported",
            "deprecated",
            "sort"
        ]);
        const isCategoriesEnabled = galleryManifest?.capabilities.extensionQuery?.filtering?.some(c => c.name === FilterType.Category);
        if (isCategoriesEnabled) {
            commands.push("category");
        }
        commands.push(...["tag", "ext", "id", "outdated", "recentlyUpdated", "restartRequired"]);
        const sortCommands = [];
        if (galleryManifest?.capabilities.extensionQuery?.sorting?.some(c => c.name === SortBy.InstallCount)) {
            sortCommands.push("installs");
        }
        if (galleryManifest?.capabilities.extensionQuery?.sorting?.some(c => c.name === SortBy.WeightedRating)) {
            sortCommands.push("rating");
        }
        sortCommands.push("name", "publishedDate", "updateDate");
        const contributeCommands = [];
        for (const feature of ( Registry.as(Extensions.ExtensionFeaturesRegistry)).getExtensionFeatures()) {
            contributeCommands.push(feature.id);
        }
        const subcommands = {
            "sort": sortCommands,
            "category": isCategoriesEnabled ? ( EXTENSION_CATEGORIES.map(c => `"${c.toLowerCase()}"`)) : [],
            "tag": [""],
            "ext": [""],
            "id": [""],
            "contribute": contributeCommands
        };
        const queryContains = substr => query.indexOf(substr) > -1;
        const hasSort = ( subcommands.sort.some(subcommand => queryContains(`@sort:${subcommand}`)));
        const hasCategory = ( subcommands.category.some(subcommand => queryContains(`@category:${subcommand}`)));
        return commands.flatMap(command => {
            if (hasSort && command === "sort" || hasCategory && command === "category") {
                return [];
            }
            if (command in subcommands) {
                return ( subcommands[command].map(subcommand => `@${command}:${subcommand}${subcommand === "" ? "" : " "}`));
            } else {
                return queryContains(`@${command}`) ? [] : [`@${command} `];
            }
        });
    }
    static parse(value) {
        let sortBy = "";
        value = value.replace(/@sort:(\w+)(-\w*)?/g, (match, by, order) => {
            sortBy = by;
            return "";
        });
        return ( new Query(value, sortBy));
    }
    toString() {
        let result = this.value;
        if (this.sortBy) {
            result = `${result}${result ? " " : ""}@sort:${this.sortBy}`;
        }
        return result;
    }
    isValid() {
        return !/@outdated/.test(this.value);
    }
    equals(other) {
        return this.value === other.value && this.sortBy === other.sortBy;
    }
}

export { Query };
