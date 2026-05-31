
import { __decorate, __param } from '../../../../../../../external/tslib/tslib.es6.js';
import { equals as equals$1 } from '../../../../base/common/arrays.js';
import '../../../../base/common/errors.js';
import { Throttler } from '../../../../base/common/async.js';
import { parse } from '../../../../base/common/glob.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { equals } from '../../../../base/common/objects.js';
import '../../../../base/common/observableInternal/index.js';
import '../../../../nls.js';
import '../../../../platform/instantiation/common/instantiation.js';
import { FileSystemProviderCapabilities } from '../../../../platform/files/common/files.js';
import { IFileService } from '../../../../platform/files/common/files.service.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.service.js';
import { IMcpRegistry } from './mcpRegistryTypes.service.js';
import './mcpTypes.js';
import { autorun, autorunDelta } from '../../../../base/common/observableInternal/reactions/autorun.js';
import { derivedOpts } from '../../../../base/common/observableInternal/observables/derived.js';

let McpDevModeServerAttache = class McpDevModeServerAttache extends Disposable {
    constructor(server, fwdRef, registry, fileService, workspaceContextService) {
        super();
        const workspaceFolder = ( server.readDefinitions().map((
            {
                collection
            }
        ) => collection?.presentation?.origin && workspaceContextService.getWorkspaceFolder(collection.presentation?.origin)?.uri));
        const restart = async () => {
            const lastDebugged = fwdRef.lastModeDebugged;
            await server.stop();
            await server.start({
                debug: lastDebugged
            });
        };
        let didAutoStart = false;
        this._register(autorun(reader => {
            const defs = server.readDefinitions().read(reader);
            if (!defs.collection || !defs.server || !defs.server.devMode) {
                didAutoStart = false;
                return;
            }
            if (didAutoStart) {
                return;
            }
            const delegates = registry.delegates.read(reader);
            if (!( delegates.some(d => d.canStart(defs.collection, defs.server)))) {
                return;
            }
            server.start();
            didAutoStart = true;
        }));
        const debugMode = ( server.readDefinitions().map(d => !!d.server?.devMode?.debug));
        this._register(autorunDelta(debugMode, (
            {
                lastValue,
                newValue
            }
        ) => {
            if (!!newValue && !equals(lastValue, newValue)) {
                restart();
            }
        }));
        const watchObs = derivedOpts({
            equalsFn: equals$1
        }, reader => {
            const def = server.readDefinitions().read(reader);
            const watch = def.server?.devMode?.watch;
            return typeof watch === "string" ? [watch] : watch;
        });
        const restartScheduler = this._register(( new Throttler()));
        this._register(autorun(reader => {
            const pattern = watchObs.read(reader);
            const wf = workspaceFolder.read(reader);
            if (!pattern || !wf) {
                return;
            }
            const includes = pattern.filter(p => !p.startsWith("!"));
            const excludes = ( pattern.filter(p => p.startsWith("!")).map(p => p.slice(1)));
            reader.store.add(fileService.watch(wf, {
                includes,
                excludes,
                recursive: true
            }));
            const ignoreCase = !fileService.hasCapability(wf, FileSystemProviderCapabilities.PathCaseSensitive);
            const includeParse = ( includes.map(p => parse({
                base: wf.fsPath,
                pattern: p
            }, {
                ignoreCase
            })));
            const excludeParse = ( excludes.map(p => parse({
                base: wf.fsPath,
                pattern: p
            }, {
                ignoreCase
            })));
            reader.store.add(fileService.onDidFilesChange(e => {
                for (const change of [e.rawAdded, e.rawDeleted, e.rawUpdated]) {
                    for (const uri of change) {
                        if (( includeParse.some(i => i(uri.fsPath))) && !( excludeParse.some(e => e(uri.fsPath)))) {
                            restartScheduler.queue(restart);
                            break;
                        }
                    }
                }
            }));
        }));
    }
};
McpDevModeServerAttache = ( __decorate([( __param(2, IMcpRegistry)), ( __param(3, IFileService)), ( __param(4, IWorkspaceContextService))], McpDevModeServerAttache));

export { McpDevModeServerAttache };
