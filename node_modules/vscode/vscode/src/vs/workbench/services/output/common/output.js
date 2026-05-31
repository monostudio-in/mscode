
import { Emitter } from '../../../../base/common/event.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { Disposable } from '../../../../base/common/lifecycle.js';

const OUTPUT_MIME = "text/x-code-output";
const OUTPUT_MODE_ID = "Log";
const LOG_MIME = "text/x-code-log-output";
const LOG_MODE_ID = "log";
const OUTPUT_VIEW_ID = "workbench.panel.output";
const CONTEXT_IN_OUTPUT = ( new RawContextKey("inOutput", false));
const CONTEXT_ACTIVE_FILE_OUTPUT = ( new RawContextKey("activeLogOutput", false));
const CONTEXT_ACTIVE_LOG_FILE_OUTPUT = ( new RawContextKey("activeLogOutput.isLog", false));
const CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE = ( new RawContextKey("activeLogOutput.levelSettable", false));
const CONTEXT_ACTIVE_OUTPUT_LEVEL = ( new RawContextKey("activeLogOutput.level", ""));
const CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT = ( new RawContextKey("activeLogOutput.levelIsDefault", false));
const CONTEXT_OUTPUT_SCROLL_LOCK = ( new RawContextKey(`outputView.scrollLock`, false));
const ACTIVE_OUTPUT_CHANNEL_CONTEXT = ( new RawContextKey("activeOutputChannel", ""));
const SHOW_TRACE_FILTER_CONTEXT = ( new RawContextKey("output.filter.trace", true));
const SHOW_DEBUG_FILTER_CONTEXT = ( new RawContextKey("output.filter.debug", true));
const SHOW_INFO_FILTER_CONTEXT = ( new RawContextKey("output.filter.info", true));
const SHOW_WARNING_FILTER_CONTEXT = ( new RawContextKey("output.filter.warning", true));
const SHOW_ERROR_FILTER_CONTEXT = ( new RawContextKey("output.filter.error", true));
const OUTPUT_FILTER_FOCUS_CONTEXT = ( new RawContextKey("outputFilterFocus", false));
const HIDE_CATEGORY_FILTER_CONTEXT = ( new RawContextKey("output.filter.categories", ""));
var OutputChannelUpdateMode;
(function(OutputChannelUpdateMode) {
    OutputChannelUpdateMode[OutputChannelUpdateMode["Append"] = 1] = "Append";
    OutputChannelUpdateMode[OutputChannelUpdateMode["Replace"] = 2] = "Replace";
    OutputChannelUpdateMode[OutputChannelUpdateMode["Clear"] = 3] = "Clear";
})(OutputChannelUpdateMode || (OutputChannelUpdateMode = {}));
const Extensions = {
    OutputChannels: "workbench.contributions.outputChannels"
};
function isSingleSourceOutputChannelDescriptor(descriptor) {
    return !!descriptor.source && !Array.isArray(descriptor.source);
}
function isMultiSourceOutputChannelDescriptor(descriptor) {
    return Array.isArray(descriptor.source);
}
class OutputChannelRegistry extends Disposable {
    constructor() {
        super(...arguments);
        this.channels = ( new Map());
        this._onDidRegisterChannel = this._register(( new Emitter()));
        this.onDidRegisterChannel = this._onDidRegisterChannel.event;
        this._onDidRemoveChannel = this._register(( new Emitter()));
        this.onDidRemoveChannel = this._onDidRemoveChannel.event;
        this._onDidUpdateChannelFiles = this._register(( new Emitter()));
        this.onDidUpdateChannelSources = this._onDidUpdateChannelFiles.event;
    }
    registerChannel(descriptor) {
        if (!( this.channels.has(descriptor.id))) {
            this.channels.set(descriptor.id, descriptor);
            this._onDidRegisterChannel.fire(descriptor.id);
        }
    }
    getChannels() {
        const result = [];
        this.channels.forEach(value => result.push(value));
        return result;
    }
    getChannel(id) {
        return this.channels.get(id);
    }
    updateChannelSources(id, sources) {
        const channel = this.channels.get(id);
        if (channel && isMultiSourceOutputChannelDescriptor(channel)) {
            channel.source = sources;
            this._onDidUpdateChannelFiles.fire(channel);
        }
    }
    removeChannel(id) {
        const channel = this.channels.get(id);
        if (channel) {
            this.channels.delete(id);
            this._onDidRemoveChannel.fire(channel);
        }
    }
}
Registry.add(Extensions.OutputChannels, ( new OutputChannelRegistry()));

export { ACTIVE_OUTPUT_CHANNEL_CONTEXT, CONTEXT_ACTIVE_FILE_OUTPUT, CONTEXT_ACTIVE_LOG_FILE_OUTPUT, CONTEXT_ACTIVE_OUTPUT_LEVEL, CONTEXT_ACTIVE_OUTPUT_LEVEL_IS_DEFAULT, CONTEXT_ACTIVE_OUTPUT_LEVEL_SETTABLE, CONTEXT_IN_OUTPUT, CONTEXT_OUTPUT_SCROLL_LOCK, Extensions, HIDE_CATEGORY_FILTER_CONTEXT, LOG_MIME, LOG_MODE_ID, OUTPUT_FILTER_FOCUS_CONTEXT, OUTPUT_MIME, OUTPUT_MODE_ID, OUTPUT_VIEW_ID, OutputChannelUpdateMode, SHOW_DEBUG_FILTER_CONTEXT, SHOW_ERROR_FILTER_CONTEXT, SHOW_INFO_FILTER_CONTEXT, SHOW_TRACE_FILTER_CONTEXT, SHOW_WARNING_FILTER_CONTEXT, isMultiSourceOutputChannelDescriptor, isSingleSourceOutputChannelDescriptor };
