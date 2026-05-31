
import { __decorate, __param } from '@codingame/monaco-vscode-api/external/tslib/tslib.es6';
import { Disposable } from '@codingame/monaco-vscode-api/vscode/vs/base/common/lifecycle';
import { IConfigurationService } from '@codingame/monaco-vscode-api/vscode/vs/platform/configuration/common/configuration.service';
import { IEnvironmentService } from '@codingame/monaco-vscode-api/vscode/vs/platform/environment/common/environment.service';
import { IProductService } from '@codingame/monaco-vscode-api/vscode/vs/platform/product/common/productService.service';
import { TELEMETRY_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TelemetryLevel } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry';
import { ITelemetryService } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetry.service';
import { supportsTelemetry } from '@codingame/monaco-vscode-api/vscode/vs/platform/telemetry/common/telemetryUtils';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '@codingame/monaco-vscode-api/vscode/vs/workbench/api/common/extHost.protocol';

var MainThreadTelemetry_1;
let MainThreadTelemetry = class MainThreadTelemetry extends Disposable {
    static {
        MainThreadTelemetry_1 = this;
    }
    static {
        this._name = "pluginHostTelemetry";
    }
    constructor(
        extHostContext,
        _telemetryService,
        _configurationService,
        _environmentService,
        _productService
    ) {
        super();
        this._telemetryService = _telemetryService;
        this._configurationService = _configurationService;
        this._environmentService = _environmentService;
        this._productService = _productService;
        this._proxy = ( extHostContext.getProxy(ExtHostContext.ExtHostTelemetry));
        if (supportsTelemetry(this._productService, this._environmentService)) {
            this._register(this._configurationService.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration(TELEMETRY_SETTING_ID) || e.affectsConfiguration(TELEMETRY_OLD_SETTING_ID)) {
                    this._proxy.$onDidChangeTelemetryLevel(this.telemetryLevel);
                }
            }));
        }
        this._proxy.$initializeTelemetryLevel(
            this.telemetryLevel,
            supportsTelemetry(this._productService, this._environmentService),
            this._productService.enabledTelemetryLevels
        );
    }
    get telemetryLevel() {
        if (!supportsTelemetry(this._productService, this._environmentService)) {
            return TelemetryLevel.NONE;
        }
        return this._telemetryService.telemetryLevel;
    }
    $publicLog(eventName, data = Object.create(null)) {
        data[MainThreadTelemetry_1._name] = true;
        this._telemetryService.publicLog(eventName, data);
    }
    $publicLog2(eventName, data) {
        this.$publicLog(eventName, data);
    }
};
MainThreadTelemetry = MainThreadTelemetry_1 = __decorate([extHostNamedCustomer(MainContext.MainThreadTelemetry), ( __param(1, ITelemetryService)), ( __param(2, IConfigurationService)), ( __param(3, IEnvironmentService)), ( __param(4, IProductService))], MainThreadTelemetry);

export { MainThreadTelemetry };
