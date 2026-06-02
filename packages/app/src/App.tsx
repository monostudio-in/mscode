// src/App.tsx
import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app'; 
// import { Capacitor } from '@capacitor/core'; 
// import { snippets } from '@/core/extensionAPI/registry/snippetRegistry';

import type { PluginListenerHandle } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

import { MainLayout } from '@/ui/layouts/MainLayout';
import { FilePickerModal } from '@/ui/components/FilePicker/FilePickerModal'; 
import { RenameFileModal } from '@/ui/components/Modal/RenameFileModal';
import { GlobalModal } from '@/ui/components/Modal/GlobalModal';

import { useExplorerStore } from '@/features/explorer/store/exploreStore';
import { useTabStore } from '@/store/tabStore';
import { useSidebarStore }  from "@/store/sidebarStore";
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore'; 
import { EditorContextMenu } from '@/features/editor/components/EditorMenu/EditorMenu';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useExtensionStore } from '@/features/extensions/store/extensionStore';
import { CommandPalette } from '@/ui/components/CommandPalette/CommandPalette'; 

import { keybindingManager } from '@/core/keybindings/keybindingManager';
import { userKeybindingStore } from '@/core/keybindings/userKeybindingStore';

import { useBackButtonStore } from '@/store/backButtonStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';

import './core/bootstrap/actionsRegistration.ts';
import { bootstrapActivity } from  './core/bootstrap/activityRegistration.ts';
import { registerCoreMenus, registerEditorMenu } from './core/bootstrap/menuRegistration';

import { themeService } from '@/core/theme/service/themeService';
import { useThemeStore } from '@/core/theme/store/themeStore';
import { userSnippetsService } from '@/core/services/userSnippetsService';
import { setupAuthDeepLinkListener } from '@/core/server/gitLinker';

/**
 * Startup Lifecycle Phase: Preloads user-defined code snippets across all localized languages.
 * Scans the designated storage directory and registers the contents into memory.
 */
const preloadUserSnippets = async () => {
  const BASE_LANG_DIR = 'storage/user/languages';
  console.log(`[App] preloadUserSnippets: scanning '${BASE_LANG_DIR}'...`);

  try {
    const result = await Filesystem.readdir({
      path: BASE_LANG_DIR,
      directory: Directory.Data
    });

    const dirs = result.files.filter(f => f.type === 'directory');
    console.log(`[App] Found ${dirs.length} language snippet folder(s): [${dirs.map(d => d.name).join(', ')}]`);

    for (const entry of dirs) {
      await userSnippetsService.loadSnippetsForLanguage(entry.name);
    }

    console.log(`[App] preloadUserSnippets: done.`);
  } catch (e) {
    // A missing directory on first launch is expected behavioral state. Log and proceed safely.
    console.log(`[App] preloadUserSnippets: no language folder found yet, skipping.`);
  }
};

const App = () => {
  const initWorkspace = useExplorerStore(state => state.initWorkspace);
  const initTabs = useTabStore(state => state.initTabs); 
  // const initLayout = useLayoutStore(state => state.initLayout); 
  const initLayout = useSidebarStore(state => state.initSidebar); 
  const initSettings = useSettingsStore(state => state.initSettings); 
  const initViewStates = useEditorViewStateStore(state => state.initViewStates); 
  
  useEffect(() => {
    let backButtonListener: PluginListenerHandle | null = null;
    
    // xtension Lazy-Loader Listener
    const handleExtensionActivation = async (e: any) => {
      const activationEvent = e.detail; // e.g., 'onCommand:coderunner.run'
      // wake up extension whenever got signal 
      await useExtensionStore.getState().wakeUpByEvent(activationEvent);
    };

    const initializeApp = async () => {
      // 1. Core Configuration & Layout Bootstrapping
      await initSettings(); 
      await initLayout();

      // 2. State Restoral: Loads the last active workspace directory
      await initWorkspace();
      const workspacePath = useExplorerStore.getState().workspacePath;
      
      // Theme synchronization workflows
      await themeService.init();
      useThemeStore.getState().sync();

      // 3. Workspace Contextual Loading: Restores context-specific open tabs and editor view states
      await initTabs(workspacePath); 
      await initViewStates(workspacePath);
      
      // 4. Core Navigation Structures: Registers primary and inline action menus
      registerCoreMenus(); 
      registerEditorMenu();
      
      // 5. activityRegistration 
      bootstrapActivity();
      
    
      // // Environment Checks: Inject mock data fixtures when executing in browser runtime architectures
      // if (Capacitor.getPlatform() === 'web') {
      //   console.log('[Web Debug] Injecting Fake Snippets for UI Testing...');
        
      //   const fakeJsSnippets = {
      //     "Web Debug Log": {
      //       prefix: "logs",
      //       body: ["console.log('WEB DEBUG:', $1);", "$2"],
      //       description: "Fake console.log for testing"
      //     },
      //     "Web Debug For": {
      //       prefix: ["for", "forloop"],
      //       body: ["for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {", "\t$0", "}"],
      //       description: "Fake for loop for testing keyboard bounce"
      //     }
      //   };

      //   const fakePySnippets = {
      //     "Web Debug Print": {
      //       prefix: "logs",
      //       body: ["print(f' WEB DEBUG: {$1}')", "$2"],
      //       description: "Fake python print for testing"
      //     }
      //   };

      //   // Inject configuration payloads into runtime memory caches under the 'web-debug' namespace origin
      //   snippets.registerSnippets('javascript', fakeJsSnippets, 'web-debug');
      //   snippets.registerSnippets('typescript', fakeJsSnippets, 'web-debug');
      //   snippets.registerSnippets('python', fakePySnippets, 'web-debug');
      // }

      // 5. Preload all localized custom user-configured extensions or syntax descriptors
      await preloadUserSnippets();

      // 6. Native Back-Button Handling: Implements a Last-In, First-Out (LIFO) execution stack
      backButtonListener = await CapacitorApp.addListener('backButton', async () => {
        const handlers = useBackButtonStore.getState().handlers;
        
        // Traverse back-navigation listeners sequentially starting from top of stack
        for (let i = handlers.length - 1; i >= 0; i--) {
          const handled = await handlers[i].callback();
          if (handled) return;
        }

        // Default global application exit sequence trigger when interception stack is cleared
        commands.executeCommand('workbench.action.quit');
      });

      // 7. Event Interceptors: Mount subsystem layout keyboard shortcut managers
      keybindingManager.initialize();
      userKeybindingStore.initialize();
      
      // ≡≡≡ lazy load extensions ≡≡≡
      window.addEventListener('ms-trigger-activation', handleExtensionActivation);
      // ≡≡≡ lazy load extensions ≡≡≡
    };
    
    initializeApp();
    
    setupAuthDeepLinkListener();

    return () => {
      // Memory Management: Dispose of subsystem instances and drop listener hooks on unmount boundaries
      keybindingManager.dispose(); 
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [initWorkspace, initTabs, initLayout, initSettings, initViewStates]);

  
  return (
    <>
      <MainLayout />
      <CommandPalette />
      <EditorContextMenu /> 
      <GlobalModal />
      <RenameFileModal />
      <FilePickerModal />
    </>
  );
};

export default App;
