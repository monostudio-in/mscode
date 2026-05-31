// src/core/bootstrap/activityRegistration.ts
//
// ─── HOW THIS WORKS ───────────────────────────────────────────────────────────
//
//  Option A — Use sidebarRegistry (recommended, SidebarEngine handles layout):
//    sidebarRegistry.registerPanel({ activityBarId: 'files', header: {...}, sections: [...] })
//
//  Option B — Direct sidebarComponent on ActivityBar item (legacy, still supported):
//    registerItem({ id: 'files', ..., sidebarComponent: Explorer })
//
//  Both work. Option A gives automatic Header, Collapsible, Resizer, Overflow.
// ─────────────────────────────────────────────────────────────────────────────


import { useActivityBarStore }  from '@/store/activityBarStore';
import { commands }             from '@/core/extensionAPI/registry/commandRegistry';
import { useMenuStore }         from '@/store/menuStore';
import { usePaletteStore }      from '@/store/paletteStore';
import { bootstrapExplorer }    from '@/features/explorer/Explorer.tsx';
import { SearchPanel }          from '@/features/search/SearchPanel';
import { bootstrapExtensions }  from '@/features/extensions/extensionsBootstrap';
import { bootstrapGit }         from '@/features/git/gitBootstrap';
import { useGithubAuthStore }   from '@/store/githubAuthStore';

export function bootstrapActivity() {
  const { registerItem } = useActivityBarStore.getState();

  bootstrapExplorer();
  
  registerItem({
    id: 'search', icon: 'search', label: 'Search',
    priority: 20, position: 'top', openSidebarContent: true, sidebarComponent: SearchPanel,
  });

  registerItem({
    id: 'git', icon: 'git-branch', label: 'Source Control',
    priority: 30, position: 'top', openSidebarContent: true,
  });
  bootstrapGit();

  registerItem({
    id: 'extensions', icon: 'extensions', label: 'Extensions',
    priority: 40, position: 'top', openSidebarContent: true, 
  });
  bootstrapExtensions();

  registerItem({
    id: 'github-account', icon: 'account', label: 'Accounts',
    priority: 10, position: 'bottom', openSidebarContent: false,
    onClick: (e?: MouseEvent) => _handleAccountClick(e),
  });

  registerItem({
    id: 'settings-btn', icon: 'settings', label: 'Settings',
    priority: 20, position: 'bottom', openSidebarContent: false,
    onClick: (e?: MouseEvent) => _handleSettingsClick(e),
  });
}

// ─── Account Handler (Context Menu) ──────────────────────────────────────────

function _handleAccountClick(e?: MouseEvent) {
  const x = e?.clientX ?? 60;
  const y = e?.clientY ?? window.innerHeight - 150;

  const { isAuthenticated, user, signInWithGitHub } = useGithubAuthStore.getState();
    
  if (isAuthenticated && user) {
    useMenuStore.getState().openMenu('activitybar/account', x, y, [
      { id: 'acc-user', label: `${user.login} (GitHub)`, icon: 'github', disabled: true },
      { type: 'separator', id: 'sep1' },
      { id: 'acc-manage', label: 'Manage Trusted Extensions', icon: 'shield', onClick: () => _manageTrustedExtensions() },
      { type: 'separator', id: 'sep2' },
      { id: 'acc-logout', label: 'Sign Out', icon: 'sign-out', onClick: () => commands.executeCommand('github.signOut') }
    ]);
  } else {
    useMenuStore.getState().openMenu('activitybar/account', x, y, [
      { id: 'acc-login', label: 'Sign in with GitHub to use MSCode Sync', icon: 'account', onClick: () => signInWithGitHub() }
    ]);
  }
}

// ─── Trusted Extensions Manager UI ────────────────────────────────────────────

function _manageTrustedExtensions() {
  const { trustedExtensions, toggleExtensionAccess } = useGithubAuthStore.getState();
  
  const exts = Object.values(trustedExtensions || {}) as Array<{
    id: string;
    name: string;
    granted: boolean;
  }>;

  if (exts.length === 0) {
    usePaletteStore.getState().openQuickPick('Manage Trusted Extensions', [
      { id: 'none', label: 'No extensions have requested access yet.', leftIcon: 'info', readonly: true }
    ], () => {});
    return;
  }

  const items = exts.map(ext => ({
    id: ext.id,
    label: ext.name,
    description: ext.granted ? 'Allowed (Click to Revoke)' : 'Denied (Click to Allow)',
    leftIcon: ext.granted ? 'check' : 'close',
    onSelect: () => {
      toggleExtensionAccess(ext.id);
      // Refresh UI
      setTimeout(() => _manageTrustedExtensions(), 100);
    }
  }));

  usePaletteStore.getState().openQuickPick('Toggle GitHub Access for Extensions', items, (selected) => {
    if (selected.onSelect) selected.onSelect();
  });
}

// ─── Settings Handler ─────────────────────────────────────────────────────────

function _handleSettingsClick(e?: MouseEvent) {
  const x = e?.clientX ?? 60;
  const y = e?.clientY ?? window.innerHeight - 150;
  useMenuStore.getState().openMenu('activitybar/settings', x, y, [
    { id: 's0', label: 'Command Palette',    icon: 'terminal', shortcut: 'Ctrl+Shift+P', onClick: () => commands.executeCommand('workbench.action.showCommands') },
    { id: 'sep1', type: 'separator' },
    { id: 's1', label: 'Settings',           icon: 'settings',   shortcut: 'Ctrl+,',         onClick: () => commands.executeCommand('workbench.action.openSettings')         },
    { id: 's2', label: 'Keyboard Shortcuts', icon: 'keyboard',   shortcut: 'Ctrl+K Ctrl+S',  onClick: () => commands.executeCommand('workbench.action.openGlobalKeybindings') },
    { id: 's3', label: 'User Snippets',      icon: 'json',                                    onClick: () => commands.executeCommand('workbench.action.openSnippets')          },
    {
      id: 's4', label: 'Themes', icon: 'symbol-color',
      children: [
        { id: 's4-1', label: 'Color Theme',     shortcut: 'Ctrl+K Ctrl+T', onClick: () => commands.executeCommand('workbench.action.selectTheme')     },
        { id: 's4-2', label: 'File Icon Theme',                             onClick: () => commands.executeCommand('workbench.action.selectIconTheme') },
      ],
    },
  ]);
}

// ─── Usage examples ───────────────────────────────────────────────────────────
//
// Add a section to Explorer from an extension:
//
//   sidebarRegistry.addSection('files', {
//     id:             'my-git-status',
//     title:          'Changed Files',
//     content:        MyGitStatusComponent,
//     defaultHeight:  200,
//     rightActions: [{ id: 'refresh', icon: 'refresh', onClick: () => refresh() }],
//   });
//
// Register a whole new panel:
//
//   registerItem({ id: 'my-panel', icon: 'beaker', label: 'My Panel', priority: 50, position: 'top', openSidebarContent: true });
//   sidebarRegistry.registerPanel({
//     activityBarId: 'my-panel',
//     header: { title: 'My Extension', rightActions: [...] },
//     sections: [{ id: 'main', title: 'Data', content: MyComponent, fillHeight: true }],
//   });


// sidebarRegistry.addSection('files', {
//         id: 'my-npm-scripts',
//         title: 'NPM SCRIPTS',
//         content: "hello", 
//         defaultExpanded: true,
//       });