

const INTERNAL_AUTH_PROVIDER_PREFIX = '__';
function isAuthenticationWwwAuthenticateRequest(obj) {
    return typeof obj === 'object'
        && obj !== null
        && 'wwwAuthenticate' in obj
        && (typeof obj.wwwAuthenticate === 'string');
}

export { INTERNAL_AUTH_PROVIDER_PREFIX, isAuthenticationWwwAuthenticateRequest };
