
import { SyncDescriptor } from '../../../platform/instantiation/common/descriptors.js';
import { registerSingleton, InstantiationType } from '../../../platform/instantiation/common/extensions.js';
import { IExtHostAuthentication, ExtHostAuthentication } from '../common/extHostAuthentication.js';
import { IExtHostExtensionService } from '../common/extHostExtensionService.js';
import { IExtensionStoragePaths, ExtensionStoragePaths } from '../common/extHostStoragePaths.js';
import { IExtHostTelemetry, ExtHostTelemetry } from '../common/extHostTelemetry.js';
import { ExtHostExtensionService } from './extHostExtensionService.js';

registerSingleton(IExtHostAuthentication, ExtHostAuthentication, InstantiationType.Eager);
registerSingleton(IExtHostExtensionService, ExtHostExtensionService, InstantiationType.Eager);
registerSingleton(IExtensionStoragePaths, ExtensionStoragePaths, InstantiationType.Eager);
registerSingleton(IExtHostTelemetry, ( new SyncDescriptor(ExtHostTelemetry, [true], true)));
