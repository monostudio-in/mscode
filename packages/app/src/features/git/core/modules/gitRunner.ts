// src/features/git/core/modules/gitRunner.ts

import { taskManager }          from '@/core/extensionAPI/tasks/taskManager';
import { createTasksModule }    from '@/core/extensionAPI/modules/tasksModule';
import { useNotificationStore } from '@/store/notificationStore';
import { useOutputStore }       from '@/features/termis/components/output/store/outputStore';
import { useTermisStore }       from '@/features/termis/store/termisStore';
import { gitAccess }            from '../../gitAccess';
import { logGit, openGitPanel } from './gitLogger';

/** Cache flag checking if the Git binary has been verified on the system file tree. */
let isGitVerified  = false;

/** Mutex promise tracker to prevent concurrent background Git binary installations. */
let installPromise: Promise<void> | null = null;

/**
 * Ensures that the Git binary is installed within the underlying environment.
 * If Git is missing, it automatically creates a background installation task using APK, 
 * provisions a dedicated output channel, and handles global UI state updates.
 * * @returns {Promise<void>} Resolves when Git is verified or successfully provisioned.
 * @throws {Error} Rejects if background package installation fails.
 */
async function ensureGitInstalled(): Promise<void> {
  if (isGitVerified)  return;
  if (installPromise) return installPromise;

  installPromise = new Promise<void>(async (resolve, reject) => {
    try {
      const check = taskManager.execute('git --version', '/', () => {});
      const res = await check.result;
      if (res.exitCode === 0) {
        isGitVerified = true;
        return resolve();
      }

      useNotificationStore.getState().addNotification({
        type: 'info', title: 'Git Setup', source: 'Git',
        message: 'Git is not installed. Installing in the background…',
      });

      useOutputStore.getState().createChannel('Git Setup');
      useOutputStore.getState().setActiveChannel('Git Setup');
      useTermisStore.getState().setActiveView('output');

      const tasks   = createTasksModule('system');
      const install = tasks.runInBackground('apk update && apk add git', {
        cwd: '/', outputChannel: 'Git Setup',
      });
      
      const { exitCode: code } = await install.result;
      if (code === 0) {
        isGitVerified = true;
        useNotificationStore.getState().addNotification({
          type: 'success', title: 'Git Setup', source: 'Git',
          message: 'Git installed successfully!',
        });
        resolve();
      } else {
        useNotificationStore.getState().addNotification({
          type: 'error', title: 'Git Setup', source: 'Git',
          message: 'Failed to install Git. Check the Output panel.',
        });
        reject(new Error('Git installation failed.'));
      }
    } catch (e) {
      reject(e);
    } finally {
      installPromise = null;
    }
  });

  return installPromise;
}

// ─── Virtual Git Security (The Brains) ──────────────────────────────────────

/**
 * Sanitizes and establishes the "Virtual Git" layer for a given workspace.
 * Resolves critical Android Shared Storage/SDCard permission issues by migrating standard 
 * physical `.git` folders to an isolated, safe Linux storage layer (`/root/.mscode_git_repos`), 
 * leaving behind a standard Git reference pointer (`gitdir: <path>`).
 * * @param {string} cwd The current absolute directory path of the active project.
 * @returns {Promise<void>}
 */
async function setupVirtualGit(cwd: string): Promise<void> {
  const gitFilePath = `${cwd}/.git`;
  
  let existsOut = '';
  await taskManager.execute(`[ -e "${gitFilePath}" ] && echo "yes" || echo "no"`, '/', (data) => { existsOut += data; }).result;
  if (existsOut.trim() !== 'yes') return;

  let dirOut = '';
  await taskManager.execute(`[ -d "${gitFilePath}" ] && echo "dir" || echo "file"`, '/', (data) => { dirOut += data; }).result;
  const isDir = dirOut.trim() === 'dir';

  const linuxRepoBase = '/root/.mscode_git_repos';

  if (isDir) {
    await taskManager.execute(`mkdir -p "${linuxRepoBase}"`, '/', () => {}).result;
    const uniqueHash = `repo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const linuxRepoPath = `${linuxRepoBase}/${uniqueHash}`;

    await taskManager.execute(`mv "${gitFilePath}" "${linuxRepoPath}"`, '/', () => {}).result;
    await taskManager.execute(`echo "gitdir: ${linuxRepoPath}" > "${gitFilePath}"`, '/', () => {}).result;
    logGit('Virtual Git', `Migrated real .git folder to safe Linux storage: ${linuxRepoPath}`);
  } else {
    let contentOut = '';
    await taskManager.execute(`cat "${gitFilePath}"`, '/', (data) => { contentOut += data; }).result;
    const content = contentOut.trim();
    
    if (content.startsWith('gitdir: ')) {
      const targetPath = content.replace('gitdir: ', '').trim();
      
      let targetExistsOut = '';
      await taskManager.execute(`[ -d "${targetPath}" ] && echo "yes" || echo "no"`, '/', (data) => { targetExistsOut += data; }).result;
      
      if (targetExistsOut.trim() === 'no') {
        // If the target folder is deleted, wipe the broken virtual file to restore default directory state
        await taskManager.execute(`rm -f "${gitFilePath}"`, '/', () => {}).result;
        logGit('Virtual Git', `Removed broken virtual link pointing to missing folder: ${targetPath}`);
      }
    }
  }
}

/**
 * Handles error recovery for disconnected, missing, or corrupted virtual Git repositories.
 * Prompts the user via an active UI notification with interactive choices to force 
 * re-initialization of the backend separate git directory, or gracefully cancel.
 * * @param {string} cwd The current project directory working path.
 * @param {string} failedCommand The original raw Git command that threw the error.
 * @param {boolean} hideLog Disables terminal stream logger redirection if true.
 * @returns {Promise<string>} Resolves with the executed command output string upon successful recovery.
 */
async function handleBrokenRepoRecovery(cwd: string, failedCommand: string, hideLog: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const notif = useNotificationStore.getState();
    
    const warningId = notif.addNotification({
      type: 'warning', title: 'Repository Error', source: 'Git',
      message: 'The repository link is broken or corrupted.',
      actions: [
        {
          label: 'Force Re-Initialize', variant: 'type1',
          onClick: async () => {
            notif.removeNotification(warningId); // Dismiss warning
            
            // Track the loading state notification ID
            const loadingId = notif.addNotification({ type: 'loading', title: 'Repairing...', source: 'Git', message: 'Re-initializing repository link...' });
            
            try {
              await taskManager.execute(`rm -f "${cwd}/.git"`, '/', () => {}).result;
              const uniqueHash = `repo_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
              const linuxRepoPath = `/root/.mscode_git_repos/${uniqueHash}`;
              
              await taskManager.execute(`mkdir -p "${linuxRepoPath}"`, '/', () => {}).result;
              await taskManager.execute(`git init --separate-git-dir="${linuxRepoPath}"`, cwd, () => {}).result;
              
              const result = await run(failedCommand, cwd, hideLog);
              
              // Remove the loading notification and dispatch a success notice on operation complete
              notif.removeNotification(loadingId);
              notif.addNotification({ type: 'success', title: 'Repaired', source: 'Git', message: 'Repository linked successfully!' });
              
              resolve(result); 
            } catch (e: any) {
              // Clear the active loading notification interface if an error occurs
              notif.removeNotification(loadingId);
              notif.addNotification({ type: 'error', title: 'Repair Failed', source: 'Git', message: e.message });
              reject(e);
            }
          }
        },
        {
          label: 'Cancel', variant: 'type2',
          onClick: () => {
            notif.removeNotification(warningId);
            reject(new Error("fatal: not a git repository"));
          }
        }
      ]
    });
  });
}

// ─── Main Execution Ops ─────────────────────────────────────────────────────

/**
 * Executes a custom raw Git subcommand within a virtual secure sandbox layer.
 * Automatically injects the runtime dynamic security configurations (`safe.directory="*"`) 
 * and handles symlink path normalization targets matching standard mobile storage parameters.
 * * @param {string} command The specific raw Git subcommand parameters (e.g. 'status', 'add .').
 * @param {string} cwd Absolute file system target destination path.
 * @param {boolean} [hideLog=false] Prevents streaming data piping to the logging output channel panel.
 * @returns {Promise<string>} Resolves with trimmed raw stdout string responses from the execution pipeline.
 */
export async function run(command: string, cwd: string, hideLog = false): Promise<string> {
  await ensureGitInstalled();
  await setupVirtualGit(cwd);

  return new Promise((resolve, reject) => {
    let output = '';
    const safeCommand = `-c safe.directory="*" ${command}`;
    const safeCwd     = cwd.replace('/storage/emulated/0', '/sdcard');

    const execution = taskManager.execute(`git ${safeCommand}`, safeCwd, (data) => {
      output += data;
    });

    execution.result
      .then(async ({ exitCode }) => {
        const clean = output
          .split('\n')
          .filter(l => !l.startsWith('warning:'))
          .join('\n')
          .trimEnd();

        if (!hideLog) logGit(command, clean);

        if (exitCode !== 0) {
          const errMessage = clean || `git ${command} failed (exit ${exitCode})`;
          
          if (errMessage.includes('fatal: not a git repository')) {
            // Check if the physical link reference file exists on storage
            let existsOut = '';
            await taskManager.execute(`[ -e "${safeCwd}/.git" ] && echo "yes" || echo "no"`, '/', (data) => { existsOut += data; }).result;
            
            if (existsOut.trim() === 'yes') {
              // File is physically present but git fails, indicating a broken or detached link. Fire recovery interceptor.
              handleBrokenRepoRecovery(cwd, command, hideLog).then(resolve).catch(reject);
            } else {
              // User intentionally removed the .git tracking metadata. Propagate standard reject to show 'Initialize' controls.
              reject(new Error(errMessage));
            }
          } else {
            reject(new Error(errMessage));
          }
        } else {
          resolve(clean);
        }
      })
      .catch(reject);
  });
}

/**
 * Runs a Git command and forces the visual bottom execution output logging dashboard panel to pop up open.
 * Useful for asynchronous streaming operations like tracking a network `git pull` or `git push`.
 * * @param {string} command The specific Git command string expression.
 * @param {string} cwd Absolute target path of the executing process directory context.
 * @returns {Promise<string>}
 */
export async function runVisible(command: string, cwd: string): Promise<string> {
  openGitPanel();
  return run(command, cwd, false);
}

/**
 * Securely requests active credential access tokens for GitHub from the remote sync provider context.
 * Generates an ephemeral runtime configuration override string passing token scopes via Base64 Basic auth headers.
 * * @returns {Promise<string>} Returns a complete inline git configuration header string (`-c http.extraHeader="..."`).
 * @throws {Error} Rejects if authentication request tokens are refused or missing permissions.
 */
export async function getAuthPrefix(): Promise<string> {
  const token = await gitAccess.requestToken();
  if (!token) throw new Error('GitHub Authentication required or access denied. Please grant permission.');
  return `-c http.extraHeader="Authorization: Basic ${window.btoa(`${token}:x-oauth-basic`)}"`;
}

/**
 * Maps a long absolute file system reference path down into a relative path node based off the running workspace directory.
 * Used to normalize file statuses when passing change indicators into list rendering engines.
 * * @param {string} cwd The running parent repository absolute base path context.
 * @param {string} fullPath The full absolute path targeting a specific altered script file.
 * @returns {string} Normalized relative path expression string.
 */
export function getRelativePath(cwd: string, fullPath: string): string {
  if (fullPath.startsWith(cwd)) {
    let rel = fullPath.substring(cwd.length);
    if (rel.startsWith('/')) rel = rel.substring(1);
    return rel;
  }
  return fullPath;
}
