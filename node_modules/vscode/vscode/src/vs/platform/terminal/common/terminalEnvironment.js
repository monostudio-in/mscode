
import { OS, OperatingSystem } from '../../../base/common/platform.js';
import { GeneralShellType, PosixShellType, WindowsShellType } from './terminal.js';

function escapeNonWindowsPath(path, shellType) {
    let newPath = path;
    if (newPath.includes('\\')) {
        newPath = newPath.replace(/\\/g, '\\\\');
    }
    let escapeConfig;
    switch (shellType) {
        case PosixShellType.Bash:
        case PosixShellType.Sh:
        case PosixShellType.Zsh:
        case WindowsShellType.GitBash:
            escapeConfig = {
                bothQuotes: (path) => `$'${path.replace(/'/g, '\\\'')}'`,
                singleQuotes: (path) => `'${path.replace(/'/g, '\\\'')}'`,
                noSingleQuotes: (path) => `'${path}'`
            };
            break;
        case PosixShellType.Fish:
            escapeConfig = {
                bothQuotes: (path) => `"${path.replace(/"/g, '\\"')}"`,
                singleQuotes: (path) => `'${path.replace(/'/g, '\\\'')}'`,
                noSingleQuotes: (path) => `'${path}'`
            };
            break;
        case GeneralShellType.PowerShell:
            escapeConfig = {
                bothQuotes: (path) => `"${path.replace(/"/g, '`"')}"`,
                singleQuotes: (path) => `'${path.replace(/'/g, '\'\'')}'`,
                noSingleQuotes: (path) => `'${path}'`
            };
            break;
        default:
            escapeConfig = {
                bothQuotes: (path) => `$'${path.replace(/'/g, '\\\'')}'`,
                singleQuotes: (path) => `'${path.replace(/'/g, '\\\'')}'`,
                noSingleQuotes: (path) => `'${path}'`
            };
            break;
    }
    const bannedChars = /[\`\$\|\&\>\~\#\!\^\*\;\<]/g;
    newPath = newPath.replace(bannedChars, '');
    if (newPath.includes('\'') && newPath.includes('"')) {
        return escapeConfig.bothQuotes(newPath);
    }
    else if (newPath.includes('\'')) {
        return escapeConfig.singleQuotes(newPath);
    }
    else {
        return escapeConfig.noSingleQuotes(newPath);
    }
}
function collapseTildePath(path, userHome, separator) {
    if (!path) {
        return '';
    }
    if (!userHome) {
        return path;
    }
    if (userHome.match(/[\/\\]$/)) {
        userHome = userHome.slice(0, userHome.length - 1);
    }
    const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
    const normalizedUserHome = userHome.replace(/\\/g, '/').toLowerCase();
    if (!normalizedPath.includes(normalizedUserHome)) {
        return path;
    }
    return `~${separator}${path.slice(userHome.length + 1)}`;
}
function sanitizeCwd(cwd) {
    if (cwd.match(/^['"].*['"]$/)) {
        cwd = cwd.substring(1, cwd.length - 1);
    }
    if (OS === OperatingSystem.Windows && cwd && cwd[1] === ':') {
        return cwd[0].toUpperCase() + cwd.substring(1);
    }
    return cwd;
}
function shouldUseEnvironmentVariableCollection(slc) {
    return !slc.strictEnv;
}

export { collapseTildePath, escapeNonWindowsPath, sanitizeCwd, shouldUseEnvironmentVariableCollection };
