
import { createDecorator } from '../../instantiation/common/instantiation.js';

const ITelemetryService = ( createDecorator("telemetryService"));
const ICustomEndpointTelemetryService = ( createDecorator("customEndpointTelemetryService"));

export { ICustomEndpointTelemetryService, ITelemetryService };
