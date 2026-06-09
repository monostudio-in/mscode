import type { EnvVars, Service } from './types';
type Envs = {
    [key: string]: string | undefined;
};
interface FrameworkInfo {
    slug: string | null;
    envPrefix?: string;
}
export interface GetServiceUrlEnvVarsOptions {
    requestedEnv: EnvVars;
    consumerService?: Service;
    services: Service[];
    frameworkList: readonly FrameworkInfo[];
    currentEnv?: Envs;
    deploymentUrl?: string;
    origin?: string;
}
export interface GetExperimentalServiceUrlEnvVarsOptions {
    services: Service[];
    frameworkList: readonly FrameworkInfo[];
    currentEnv?: Envs;
    deploymentUrl?: string;
    origin?: string;
}
/**
 * Resolve a map of declared env-var refs into concrete URL values.
 *
 * By default the value is the absolute URL of the referenced web service,
 * while if a consumer's framework has an `envPrefix`
 * (e.g. `NEXT_PUBLIC_` or `VITE_`) and the declared name starts with that prefix
 * then the target's route prefix (e.g. `/api`) is used,
 * which useful for client bundles where same-origin requests avoid CORS.
 *
 * Environment variables that are already set in `currentEnv` will NOT be overwritten,
 * allowing user-defined values to take precedence.
 */
export declare function getServiceUrlEnvVars(options: GetServiceUrlEnvVarsOptions): Record<string, string>;
/**
 * Legacy implicit URL injection used for `experimentalServices` (and
 * auto-detected services that map to the experimentalServices shape).
 *
 * For each web service, generates:
 * 1. `{NAME}_URL` with the absolute URL (server-side use).
 * 2. `{PREFIX}{NAME}_URL` for every framework prefix in `frameworkList` that
 *    matches a service in the deployment, with the relative route prefix
 *    (client-side use; relative paths avoid CORS).
 *
 * Entries already present in `currentEnv` are not overwritten — user-defined
 * values win.
 *
 * The GA `services` field replaces this with explicit `env` declarations
 * handled by `getServiceUrlEnvVars`.
 */
export declare function getExperimentalServiceUrlEnvVars(options: GetExperimentalServiceUrlEnvVarsOptions): Record<string, string>;
export {};
