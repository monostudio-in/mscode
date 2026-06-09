// src/store/githubAuthStore.ts
import { create }               from 'zustand';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { App }                  from '@capacitor/app';
import { Browser }              from '@capacitor/browser';
import { useNotificationStore } from '@/store/notificationStore';
// import { usePaletteStore }      from '@/store/paletteStore';
import { taskManager }          from '@/core/extensionAPI/tasks/taskManager';
import { supabase }             from '@/core/server/supabaseClient'; 
import { msEvents } from '@/core/extensionAPI/events/EventManager';



App.addListener('appUrlOpen', async (event) => {
  if (event.url.includes('mscode://auth/callback')) {
    await Browser.close();
    const url = new URL(event.url);
    
    // Error Check
    const errorDesc = url.searchParams.get('error_description') || new URLSearchParams(url.hash.substring(1)).get('error_description');
    if (errorDesc) {
       useNotificationStore.getState().addNotification({ type: 'error', title: 'GitHub Auth Error', source: 'Auth', message: decodeURIComponent(errorDesc).replace(/\+/g, ' ') });
       useGithubAuthStore.setState({ isAuthenticating: false });
       return;
    }

    // Code Flow (PKCE)
    const code = url.searchParams.get('code');
    if (code) {
       const { data, error } = await supabase.auth.exchangeCodeForSession(code);
       if (error) {
          useNotificationStore.getState().addNotification({ type: 'error', title: 'Session Error', source: 'Auth', message: error.message });
          useGithubAuthStore.setState({ isAuthenticating: false });
          return;
       }
       if (data?.session?.provider_token) {
          useGithubAuthStore.getState().setSession(data.session.user, data.session.provider_token);
       }
       return;
    }

    // Hash Flow (Implicit)
    if (url.hash && url.hash.includes('access_token')) {
      
      // Supabase do it it's own job
      window.location.hash = url.hash; 

      // 1. token from hash
      const hashParams = new URLSearchParams(url.hash.substring(1));
      let providerToken = hashParams.get('provider_token');
      
      // 2. taken from session : fallback
      if (!providerToken) {
         console.log("⚠️ provider_token not in hash! Fetching from Supabase session...");
         const { data: sessionData } = await supabase.auth.getSession();
         providerToken = sessionData?.session?.provider_token || null;
      }

      if (providerToken) {
        console.log("✅ Successfully got GitHub Provider Token!");
        
        // token save
        const { data: { user } } = await supabase.auth.getUser();
        useGithubAuthStore.getState().setSession(user, providerToken);
        
        // success 
        useNotificationStore.getState().addNotification({
           type: 'success', title: 'Login Successful', source: 'Auth', 
           message: 'GitHub connected with Repository access!'
        });
      } else {
        console.error("❌ Logged in, but provider_token is completely missing!");
        useNotificationStore.getState().addNotification({
           type: 'error', title: 'Token Missing', source: 'Auth', 
           message: 'GitHub logged in, but no access token was provided. Please use PAT.'
        });
        useGithubAuthStore.setState({ isAuthenticating: false });
      }
      
    } else {
      useGithubAuthStore.setState({ isAuthenticating: false });
    }
    
    
  }
});

export interface GitHubUser {
  login:      string;
  name:       string;
  email:      string;   
  avatar_url: string;
}

// Extension Security Schema
export interface ExtensionAccess {
  id: string;
  name: string;
  granted: boolean;
}

interface GithubAuthState {
  token:            string | null; 
  user:             GitHubUser | null;
  isAuthenticated:  boolean;
  isAuthenticating: boolean;
  
  trustedExtensions: Record<string, ExtensionAccess>; // Gatekeeper Registry

  initAuth:         () => Promise<void>;
  signInWithGitHub: () => Promise<void>; 
  loginWithPAT:     (token: string, email: string) => Promise<boolean>; 
  logout:           () => Promise<void>;

  requestToken:          (extId: string, extName: string) => Promise<string | null>; // API
  toggleExtensionAccess: (extId: string) => Promise<void>; // API
  setSession: (user: any, token: string) => Promise<void>;
}

const AUTH_FILE = 'storage/user/github_auth.json';

async function applyGitConfig(name: string, email: string): Promise<void> {
  if (!name || !email) return;
  const run = (cmd: string) => new Promise<void>(res => {
      taskManager.execute(cmd, '/', () => {}).result.then(() => res()).catch(() => res());
  });
  await run(`git config --global user.name  "${name.replace(/"/g, '\\"')}"`);
  await run(`git config --global user.email "${email.replace(/"/g, '\\"')}"`);
}

export const useGithubAuthStore = create<GithubAuthState>((set, get) => ({
  token:            null,
  user:             null,
  isAuthenticated:  false,
  isAuthenticating: false,
  trustedExtensions: {},

  initAuth: async () => {
    let activeUser: GitHubUser | null = null;
    let activeToken: string | null = null;
    let savedExtensions: Record<string, ExtensionAccess> = {};

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        activeUser = {
          login: session.user.user_metadata?.user_name || 'github-user',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.user_name || 'MSCode User',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || ''
        };
      }

      try {
        const contents = await Filesystem.readFile({ path: AUTH_FILE, directory: Directory.Data, encoding: Encoding.UTF8 });
        const data = JSON.parse(contents.data as string);
        if (data?.token) {
          activeToken = data.token;
          if (!activeUser && data.user) activeUser = data.user;
        }
        if (data?.trustedExtensions) savedExtensions = data.trustedExtensions; // Load trusted extensions
      } catch { /* No PAT saved yet */ }

      if (activeUser) {
        set({ token: activeToken, user: activeUser, isAuthenticated: true, trustedExtensions: savedExtensions });
        await applyGitConfig(activeUser.name || activeUser.login, activeUser.email);
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser: GitHubUser = {
          login: session.user.user_metadata?.user_name || 'github-user',
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.user_name || 'MSCode User',
          email: session.user.email || '',
          avatar_url: session.user.user_metadata?.avatar_url || ''
        };
        set({ user: newUser, isAuthenticated: true, isAuthenticating: false });
        await applyGitConfig(newUser.name, newUser.email);
      } else if (event === 'SIGNED_OUT') {
        if (!get().token) set({ user: null, isAuthenticated: false, trustedExtensions: {} });
      }
    });
  },

  signInWithGitHub: async () => {
    set({ isAuthenticating: true });
    
    await supabase.auth.signOut();
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github', options: { 
        redirectTo: 'mscode://auth/callback',
        skipBrowserRedirect: true ,
        scopes: 'repo read:user'
      }
    });

    if (error) {
      set({ isAuthenticating: false });
      useNotificationStore.getState().addNotification({ type: 'error', title: 'GitHub Sign In Failed', source: 'Auth', message: error.message });
      return;
    }
    if (data?.url) await Browser.open({ url: data.url });
    else set({ isAuthenticating: false });
  },

  loginWithPAT: async (token, email) => {
    set({ isAuthenticating: true });
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (!res.ok) throw new Error(res.status === 401 ? 'Invalid token.' : 'Token lacks required scopes.');
      
      const data = await res.json();
      const user: GitHubUser = { login: data.login, name: data.name || data.login, email, avatar_url: data.avatar_url ?? '' };
      const trustedExtensions = get().trustedExtensions;

      await Filesystem.writeFile({
        path: AUTH_FILE, data: JSON.stringify({ token, user, trustedExtensions }), directory: Directory.Data, encoding: Encoding.UTF8, recursive: true,
      });

      set({ token, user, isAuthenticated: true, isAuthenticating: false });
      await applyGitConfig(user.name, user.email);
      return true;
    } catch (e: any) {
      set({ isAuthenticating: false });
      return false;
    }
  },

  logout: async () => {
    set({ token: null, user: null, isAuthenticated: false, trustedExtensions: {} });
    await supabase.auth.signOut();
    try { await Filesystem.deleteFile({ path: AUTH_FILE, directory: Directory.Data }); } catch {}
  },

  // ─── GATEKEEPER LOGIC ───────────────────────────────────────────────────────
  requestToken: async (extId, extName) => {
    return new Promise((resolve) => {
      const state = get();
      
      if (!state.isAuthenticated) { return resolve(null); }
      
      if (state.trustedExtensions[extId]?.granted === true) {
        if (!state.token) {
          console.log(`[Gatekeeper] ⚠️ Permission is granted, but GitHub Token is missing!`);
          return resolve(null); 
        }
        return resolve(state.token); 
      }
      
      const isPreviouslyDenied = state.trustedExtensions[extId]?.granted === false;

      useNotificationStore.getState().addNotification({
        type: 'confirmation',
        title: isPreviouslyDenied ? 'Re-enable Access' : 'Extension Access Request',
        source: 'Gatekeeper',
        message: isPreviouslyDenied 
          ? `You previously disabled access for "${extName}". Do you want to allow it to access your GitHub account now?`
          : `The extension "${extName}" wants to access your GitHub account.`,
        actions: [
          {
            label: 'Allow', variant: 'type1', onClick: async () => {
              const newExts = { ...get().trustedExtensions, [extId]: { id: extId, name: extName, granted: true } };
              set({ trustedExtensions: newExts });
              await Filesystem.writeFile({ path: AUTH_FILE, data: JSON.stringify({ token: get().token, user: get().user, trustedExtensions: newExts }), directory: Directory.Data, encoding: Encoding.UTF8 });
              
              resolve(get().token || null); 
            }
          },
          {
            label: 'Deny', variant: 'type2', onClick: async () => {
              const newExts = { ...get().trustedExtensions, [extId]: { id: extId, name: extName, granted: false } };
              set({ trustedExtensions: newExts });
              await Filesystem.writeFile({ path: AUTH_FILE, data: JSON.stringify({ token: get().token, user: get().user, trustedExtensions: newExts }), directory: Directory.Data, encoding: Encoding.UTF8 });
              resolve(null);
            }
          }
        ]
      });
    });
  },
  
  // The setSession implementation
  setSession: async (user, token) => {
    set({ 
      isAuthenticated: true, 
      user: user, 
      token: token, 
      isAuthenticating: false 
    });

    // Save the new session to device storage so it persists after app restart
    try {
      const state = get();
      await Filesystem.writeFile({ 
        path: AUTH_FILE, 
        data: JSON.stringify({ 
          token: token, 
          user: user, 
          trustedExtensions: state.trustedExtensions 
        }), 
        directory: Directory.Data, 
        encoding: Encoding.UTF8 
      });
      console.log("[AuthStore] ✅ Session saved successfully!");
    } catch (e) {
      console.error("[AuthStore] ❌ Failed to save session to disk:", e);
    }
  },

  toggleExtensionAccess: async (extId) => {
    const exts = { ...get().trustedExtensions };
    if (exts[extId]) {
      exts[extId].granted = !exts[extId].granted;
      set({ trustedExtensions: exts });
      try { await Filesystem.writeFile({ path: AUTH_FILE, data: JSON.stringify({ token: get().token, user: get().user, trustedExtensions: exts }), directory: Directory.Data, encoding: Encoding.UTF8 }); } catch {}
    }
  } ,

  
}));

useGithubAuthStore.subscribe((state, prevState) => {
  if (
    state.isAuthenticated !== prevState.isAuthenticated || 
    state.trustedExtensions !== prevState.trustedExtensions
  ) {
    msEvents.emit('onDidChangeAuthSession');
  }
});
  