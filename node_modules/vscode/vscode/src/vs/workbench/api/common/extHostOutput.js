
import { __decorate, __param } from '../../../../../../external/tslib/tslib.es6.js';
import { MainContext } from './extHost.protocol.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { AbstractMessageLogger, log } from '../../../platform/log/common/log.js';
import { ILoggerService, ILogService } from '../../../platform/log/common/log.service.js';
import { OutputChannelUpdateMode } from '../../services/output/common/output.js';
import { IExtHostConsumerFileSystem } from './extHostFileSystemConsumer.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostFileSystemInfo } from './extHostFileSystemInfo.js';
import { toLocalISOString } from '../../../base/common/date.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { isString } from '../../../base/common/types.js';
import { toFileSystemProviderErrorCode, FileSystemProviderErrorCode } from '../../../platform/files/common/files.js';
import { Emitter } from '../../../base/common/event.js';
import { toDisposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { ResourceMap } from '../../../base/common/map.js';

class ExtHostOutputChannel extends AbstractMessageLogger {
    constructor(id, name, logger, proxy, extension) {
        super();
        this.id = id;
        this.name = name;
        this.logger = logger;
        this.proxy = proxy;
        this.extension = extension;
        this.offset = 0;
        this.visible = false;
        this.setLevel(logger.getLevel());
        this._register(logger.onDidChangeLogLevel(level => this.setLevel(level)));
        this._register(toDisposable(() => this.proxy.$dispose(this.id)));
    }
    get logLevel() {
        return this.getLevel();
    }
    appendLine(value) {
        this.append(value + "\n");
    }
    append(value) {
        this.info(value);
    }
    clear() {
        const till = this.offset;
        this.logger.flush();
        this.proxy.$update(this.id, OutputChannelUpdateMode.Clear, till);
    }
    replace(value) {
        const till = this.offset;
        this.info(value);
        this.proxy.$update(this.id, OutputChannelUpdateMode.Replace, till);
        if (this.visible) {
            this.logger.flush();
        }
    }
    show(columnOrPreserveFocus, preserveFocus) {
        this.logger.flush();
        this.proxy.$reveal(
            this.id,
            !!(typeof columnOrPreserveFocus === "boolean" ? columnOrPreserveFocus : preserveFocus)
        );
    }
    hide() {
        this.proxy.$close(this.id);
    }
    log(level, message) {
        this.offset += VSBuffer.fromString(message).byteLength;
        log(this.logger, level, message);
        if (this.visible) {
            this.logger.flush();
            this.proxy.$update(this.id, OutputChannelUpdateMode.Append);
        }
    }
}
class ExtHostLogOutputChannel extends ExtHostOutputChannel {
    appendLine(value) {
        this.append(value);
    }
}
let ExtHostOutputService = class ExtHostOutputService {
    constructor(
        extHostRpc,
        initData,
        extHostFileSystem,
        extHostFileSystemInfo,
        loggerService,
        logService
    ) {
        this.initData = initData;
        this.extHostFileSystem = extHostFileSystem;
        this.extHostFileSystemInfo = extHostFileSystemInfo;
        this.loggerService = loggerService;
        this.logService = logService;
        this.extensionLogDirectoryCreationPromise = ( new ResourceMap());
        this.logOutputChannels = ( new ResourceMap());
        this.namePool = 1;
        this.channels = ( new Map());
        this.visibleChannelId = null;
        this.proxy = ( extHostRpc.getProxy(MainContext.MainThreadOutputService));
        this.outputsLocation = this.extHostFileSystemInfo.extUri.joinPath(initData.logsLocation, `output_logging_${toLocalISOString(( new Date())).replace(/-|:|\.\d+Z$/g, "")}`);
    }
    $setVisibleChannel(visibleChannelId) {
        this.visibleChannelId = visibleChannelId;
        for (const [id, channel] of this.channels) {
            channel.visible = id === this.visibleChannelId;
        }
    }
    createOutputChannel(name, options, extension) {
        name = name.trim();
        if (!name) {
            throw ( new Error("illegal argument `name`. must not be falsy"));
        }
        const log = typeof options === "object" && options.log;
        const languageId = isString(options) ? options : undefined;
        if (isString(languageId) && !languageId.trim()) {
            throw ( new Error("illegal argument `languageId`. must not be empty"));
        }
        const channelDisposables = ( new DisposableStore());
        let extHostOutputChannelPromise;
        let logLevel = this.initData.environment.extensionLogLevel?.find(
            ([identifier]) => ExtensionIdentifier.equals(extension.identifier, identifier)
        )?.[1];
        let logFile;
        if (log) {
            const extensionLogDirectory = this.extHostFileSystemInfo.extUri.joinPath(this.initData.logsLocation, extension.identifier.value);
            logFile = this.extHostFileSystemInfo.extUri.joinPath(extensionLogDirectory, `${name.replace(/[\\/:\*\?"<>\|]/g, "")}.log`);
            const existingOutputChannel = this.logOutputChannels.get(logFile);
            if (existingOutputChannel) {
                return existingOutputChannel;
            }
            const registeredLogger = this.loggerService.getRegisteredLogger(logFile);
            if (registeredLogger?.logLevel !== undefined) {
                logLevel = registeredLogger.logLevel;
            }
            extHostOutputChannelPromise = this.doCreateLogOutputChannel(name, logFile, logLevel, extension, channelDisposables);
        } else {
            extHostOutputChannelPromise = this.doCreateOutputChannel(name, languageId, extension, channelDisposables);
        }
        extHostOutputChannelPromise.then(channel => {
            this.channels.set(channel.id, channel);
            channel.visible = channel.id === this.visibleChannelId;
            channelDisposables.add(toDisposable(() => {
                this.channels.delete(channel.id);
                if (logFile) {
                    this.logOutputChannels.delete(logFile);
                }
            }));
        });
        if (logFile) {
            const logOutputChannel = this.createExtHostLogOutputChannel(
                name,
                logLevel ?? this.logService.getLevel(),
                extHostOutputChannelPromise,
                channelDisposables
            );
            this.logOutputChannels.set(logFile, logOutputChannel);
            return logOutputChannel;
        }
        return this.createExtHostOutputChannel(name, extHostOutputChannelPromise, channelDisposables);
    }
    async doCreateOutputChannel(name, languageId, extension, channelDisposables) {
        if (!this.outputDirectoryPromise) {
            this.outputDirectoryPromise = this.extHostFileSystem.value.createDirectory(this.outputsLocation).then(() => this.outputsLocation);
        }
        const outputDir = await this.outputDirectoryPromise;
        const file = this.extHostFileSystemInfo.extUri.joinPath(
            outputDir,
            `${this.namePool++}-${name.replace(/[\\/:\*\?"<>\|]/g, "")}.log`
        );
        const logger = channelDisposables.add(this.loggerService.createLogger(file, {
            logLevel: "always",
            donotRotate: true,
            donotUseFormatters: true,
            hidden: true
        }));
        const id = await this.proxy.$register(name, file, languageId, extension.identifier.value);
        channelDisposables.add(toDisposable(() => this.loggerService.deregisterLogger(file)));
        return ( new ExtHostOutputChannel(id, name, logger, this.proxy, extension));
    }
    async doCreateLogOutputChannel(name, file, logLevel, extension, channelDisposables) {
        await this.createExtensionLogDirectory(file);
        const id = `${extension.identifier.value}.${this.extHostFileSystemInfo.extUri.basename(file)}`;
        const logger = channelDisposables.add(this.loggerService.createLogger(file, {
            id,
            name,
            logLevel,
            extensionId: extension.identifier.value
        }));
        channelDisposables.add(toDisposable(() => this.loggerService.deregisterLogger(file)));
        return ( new ExtHostLogOutputChannel(id, name, logger, this.proxy, extension));
    }
    createExtensionLogDirectory(file) {
        const extensionLogDirectory = this.extHostFileSystemInfo.extUri.dirname(file);
        let extensionLogDirectoryPromise = this.extensionLogDirectoryCreationPromise.get(extensionLogDirectory);
        if (!extensionLogDirectoryPromise) {
            this.extensionLogDirectoryCreationPromise.set(extensionLogDirectory, extensionLogDirectoryPromise = (async () => {
                try {
                    await this.extHostFileSystem.value.createDirectory(extensionLogDirectory);
                } catch (err) {
                    if (toFileSystemProviderErrorCode(err) !== FileSystemProviderErrorCode.FileExists) {
                        throw err;
                    }
                }
            })());
        }
        return extensionLogDirectoryPromise;
    }
    createExtHostOutputChannel(name, channelPromise, channelDisposables) {
        const validate = () => {
            if (channelDisposables.isDisposed) {
                throw ( new Error("Channel has been closed"));
            }
        };
        channelPromise.then(channel => channelDisposables.add(channel));
        return {
            get name() {
                return name;
            },
            append(value) {
                validate();
                channelPromise.then(channel => channel.append(value));
            },
            appendLine(value) {
                validate();
                channelPromise.then(channel => channel.appendLine(value));
            },
            clear() {
                validate();
                channelPromise.then(channel => channel.clear());
            },
            replace(value) {
                validate();
                channelPromise.then(channel => channel.replace(value));
            },
            show(columnOrPreserveFocus, preserveFocus) {
                validate();
                channelPromise.then(channel => channel.show(columnOrPreserveFocus, preserveFocus));
            },
            hide() {
                validate();
                channelPromise.then(channel => channel.hide());
            },
            dispose() {
                channelDisposables.dispose();
            }
        };
    }
    createExtHostLogOutputChannel(name, logLevel, channelPromise, channelDisposables) {
        const validate = () => {
            if (channelDisposables.isDisposed) {
                throw ( new Error("Channel has been closed"));
            }
        };
        const onDidChangeLogLevel = channelDisposables.add(( new Emitter()));
        function setLogLevel(newLogLevel) {
            logLevel = newLogLevel;
            onDidChangeLogLevel.fire(newLogLevel);
        }
        channelPromise.then(channel => {
            if (channel.logLevel !== logLevel) {
                setLogLevel(channel.logLevel);
            }
            channelDisposables.add(channel.onDidChangeLogLevel(e => setLogLevel(e)));
        });
        return {
            ...this.createExtHostOutputChannel(name, channelPromise, channelDisposables),
            get logLevel() {
                return logLevel;
            },
            onDidChangeLogLevel: onDidChangeLogLevel.event,
            trace(value, ...args) {
                validate();
                channelPromise.then(channel => channel.trace(value, ...args));
            },
            debug(value, ...args) {
                validate();
                channelPromise.then(channel => channel.debug(value, ...args));
            },
            info(value, ...args) {
                validate();
                channelPromise.then(channel => channel.info(value, ...args));
            },
            warn(value, ...args) {
                validate();
                channelPromise.then(channel => channel.warn(value, ...args));
            },
            error(value, ...args) {
                validate();
                channelPromise.then(channel => channel.error(value, ...args));
            }
        };
    }
};
ExtHostOutputService = ( __decorate([( __param(0, IExtHostRpcService)), ( __param(1, IExtHostInitDataService)), ( __param(2, IExtHostConsumerFileSystem)), ( __param(3, IExtHostFileSystemInfo)), ( __param(4, ILoggerService)), ( __param(5, ILogService))], ExtHostOutputService));
const IExtHostOutputService = ( createDecorator("IExtHostOutputService"));

export { ExtHostOutputService, IExtHostOutputService };
