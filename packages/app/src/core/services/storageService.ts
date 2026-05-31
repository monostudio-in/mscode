// src/core/services/storageService.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export const getWorkspaceHash = async (path: string | null): Promise<string> => {
  if (!path || path === '/') return 'default_workspace';
  const msgUint8 = new TextEncoder().encode(path);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

//  LAYER 1: USER SETTINGS (Global Configuration)
const USER_SETTINGS_FILE = 'storage/user/settings.json';

export const saveUserSettingsText = async (jsoncText: string) => {
  try {
    await Filesystem.writeFile({
      path: USER_SETTINGS_FILE, data: jsoncText, directory: Directory.Data,
      encoding: Encoding.UTF8, recursive: true
    });
  } catch (e) { console.error("Failed to save user settings:", e); }
};

export const loadUserSettingsText = async (): Promise<string | null> => {
  try {
    const contents = await Filesystem.readFile({ path: USER_SETTINGS_FILE, directory: Directory.Data, encoding: Encoding.UTF8 });
    return contents.data as string;
  } catch (e) { return null; }
};

// LAYER 2: USER KEYBINDINGS (Global Custom Shortcuts)
const USER_KEYBINDINGS_FILE = 'storage/user/keybindings.json';

export const saveUserKeybindingsText = async (jsoncText: string) => {
  try {
    await Filesystem.writeFile({
      path: USER_KEYBINDINGS_FILE, data: jsoncText, directory: Directory.Data,
      encoding: Encoding.UTF8, recursive: true
    });
  } catch (e) { console.error("Failed to save user keybindings:", e); }
};

export const loadUserKeybindingsText = async (): Promise<string | null> => {
  try {
    const contents = await Filesystem.readFile({ 
      path: USER_KEYBINDINGS_FILE, directory: Directory.Data, encoding: Encoding.UTF8 
    });
    return contents.data as string;
  } catch (e) { return null; }
};

//  LAYER 3: GLOBAL STATE (UI Layout, Sidebar, Active Panels)
const GLOBAL_STATE_FILE = 'storage/globalState.json';

export const saveGlobalState = async (data: any) => {
  try {
    await Filesystem.writeFile({
      path: GLOBAL_STATE_FILE, data: JSON.stringify(data, null, 2), directory: Directory.Data,
      encoding: Encoding.UTF8, recursive: true
    });
  } catch (e) { console.error("Failed to save global state:", e); }
};

export const loadGlobalState = async () => {
  try {
    const contents = await Filesystem.readFile({ path: GLOBAL_STATE_FILE, directory: Directory.Data, encoding: Encoding.UTF8 });
    return JSON.parse(contents.data as string);
  } catch (e) { return {}; }
};

// LAYER 4: WORKSPACE STATE (Open Tabs, Active Tab, LRU)
export const saveWorkspaceState = async (workspacePath: string | null, data: any) => {
  try {
    const hash = await getWorkspaceHash(workspacePath);
    const path = `storage/workspaces/${hash}/state.json`;
    
    await Filesystem.writeFile({
      path, data: JSON.stringify(data, null, 2), directory: Directory.Data,
      encoding: Encoding.UTF8, recursive: true
    });
  } catch (e) { console.error("Failed to save workspace state:", e); }
};

export const loadWorkspaceState = async (workspacePath: string | null) => {
  try {
    const hash = await getWorkspaceHash(workspacePath);
    const path = `storage/workspaces/${hash}/state.json`;

    const contents = await Filesystem.readFile({ path, directory: Directory.Data, encoding: Encoding.UTF8 });
    return JSON.parse(contents.data as string);
  } catch (e) { return null; }
};

// LAYER 5: EDITOR VIEW STATE (Cursor, Scroll, Folds per file)
export const saveEditorViewState = async (workspacePath: string | null, data: any) => {
  try {
    const hash = await getWorkspaceHash(workspacePath);
    const path = `storage/workspaces/${hash}/editorState.json`;
    
    await Filesystem.writeFile({
      path, data: JSON.stringify(data, null, 2), directory: Directory.Data,
      encoding: Encoding.UTF8, recursive: true
    });
  } catch (e) { console.error("Failed to save editor view state:", e); }
};

export const loadEditorViewState = async (workspacePath: string | null) => {
  try {
    const hash = await getWorkspaceHash(workspacePath);
    const path = `storage/workspaces/${hash}/editorState.json`;

    const contents = await Filesystem.readFile({ path, directory: Directory.Data, encoding: Encoding.UTF8 });
    return JSON.parse(contents.data as string);
  } catch (e) { return null; }
};



// LAYER 6: HOT EXIT / DIRTY FILES BACKUP SYSTEM
export const getFileSafeName = async (filePath: string): Promise<string> => {
  const msgUint8 = new TextEncoder().encode(filePath);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const saveFileBackup = async (workspacePath: string | null, filePath: string, content: string) => {
  try {
    const wHash = await getWorkspaceHash(workspacePath);
    const fName = await getFileSafeName(filePath);
    const path = `storage/workspaces/${wHash}/backups/${fName}.bak`;
    
    await Filesystem.writeFile({
      path, data: content, directory: Directory.Data,
      encoding: Encoding.UTF8, recursive: true
    });
  } catch (e) { console.error("[Backup] Failed to save hot-exit draft:", e); }
};

export const loadFileBackup = async (workspacePath: string | null, filePath: string): Promise<string | null> => {
  try {
    const wHash = await getWorkspaceHash(workspacePath);
    const fName = await getFileSafeName(filePath);
    const path = `storage/workspaces/${wHash}/backups/${fName}.bak`;
    
    const contents = await Filesystem.readFile({ path, directory: Directory.Data, encoding: Encoding.UTF8 });
    return contents.data as string;
  } catch (e) { return null; } 
};

export const deleteFileBackup = async (workspacePath: string | null, filePath: string) => {
  try {
    const wHash = await getWorkspaceHash(workspacePath);
    const fName = await getFileSafeName(filePath);
    const path = `storage/workspaces/${wHash}/backups/${fName}.bak`;
    
    await Filesystem.deleteFile({ path, directory: Directory.Data });
  } catch (e) {}
};

export const getBackupFilesList = async (workspacePath: string | null): Promise<string[]> => {
  try {
    const wHash = await getWorkspaceHash(workspacePath);
    const dirPath = `storage/workspaces/${wHash}/backups`;
    
    const result = await Filesystem.readdir({ path: dirPath, directory: Directory.Data });
    return result.files.map(f => f.name);
  } catch (e) { return []; }
};