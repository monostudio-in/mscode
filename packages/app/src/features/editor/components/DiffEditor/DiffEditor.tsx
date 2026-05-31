// src/features/editor/components/DiffEditor/DiffEditor.tsx

import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useTabStore } from '@/store/tabStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useEditorViewStateStore } from '@/features/editor/store/editorViewStateStore';
import { buildMonacoOptions } from '../../monaco/monacoOptions';
import { fs } from '@/core/fileSystem';
import { useTouchScroll } from '../../hooks/useTouchScroll';

/**
 * Property model interface representing strict inputs allocated to the DiffEditor element.
 */
interface DiffEditorProps {
  /** Unique structural runtime identification token mapping directly to an allocated tracking session Tab layout. */
  tabId: string;
}

/**
 * Component Layer: Monaco Structural Source Code Comparisons View.
 * Splits viewport rendering blocks symmetrically to evaluate text drift configurations (`Original` vs `Modified`).
 * Hooks up custom touch interaction middleware for mobile device form factors and captures localized save inputs.
 * * ### Architecture Layout & Lifecycle Workflow
 * ```
 * [DiffData Input] ──> [Parse Language & Paths]
 * │
 * ├──> Build Left Pane  (git-original:// or baseline snapshot)
 * └──> Build Right Pane (file:// or uncommitted buffer payload)
 * │
 * └──> Injects Action: [Ctrl+S] ──> Flush File System ──> Refresh Git State
 * ```
 * * @component
 * @example
 * ```tsx
 * import { DiffEditor } from '@/features/editor/components/DiffEditor/DiffEditor';
 * * const CodeReviewContainer = () => {
 * return <DiffEditor tabId="session_tab_git_diff_main.ts" />;
 * };
 * ```
 */
export const DiffEditor: React.FC<DiffEditorProps> = ({ tabId }) => {
  /** Root reference window capturing container bounds to mount Monaco DOM injections cleanly. */
  const containerRef = useRef<HTMLDivElement>(null);

  /** Core reference tracking the generated Monaco Split Diff-Editor component engine object instance. */
  const editorRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  
  /** Hydrates layout states reactively from the global active Workspace Tab tracker. */
  const tab = useTabStore(s => s.tabs.find(t => t.id === tabId));

  /** Pulls global user configuration dictionaries to construct text rendering behaviors. */
  const settings = useSettingsStore(s => s.settings);

  // ─── Touch Scroll Refs ──────────────────────────────────────────────────────
  
  /** Low-level proxy link targeting the readonly Original code rendering layer (Left layout frame). */
  const originalEditorRef = useRef<any>(null);

  /** Low-level proxy link targeting the editable Modified runtime text framework layer (Right layout frame). */
  const modifiedEditorRef = useRef<any>(null);
  
  /** Mutable lock flag stopping pointer acceleration noise across panning layers. */
  const isDraggingRef     = useRef(false);

  /** Structural boundary coordinate indicator intercepting layout drift changes. */
  const isScrollingRef    = useRef(false);

  /** Thread-safe synchronization gate preventing bubble events inside virtual DOM frames. */
  const isPointerBlockRef = useRef(false);

  /** Global listener blocking window layout shifting when processing native text buffers. */
  const globalScrollRef   = useRef(false);

  /** Evaluates explicit user interaction states against platform micro-task triggers. */
  const userScrollingRef  = useRef(false);

  /** Attaches tactile swipe gestures to sync line views on touch screens for the Left panel. */
  const { attachTouchListeners: attachOriginalTouch } = useTouchScroll({
    editorRef: originalEditorRef,
    isDraggingRef, isScrollingRef, isPointerBlockRef, globalScrollRef, userScrollingRef,
    updateTeardrops: () => {}, setTeardropsOn: () => {},
  });

  /** Attaches tactile swipe gestures to sync line views on touch screens for the Right panel. */
  const { attachTouchListeners: attachModifiedTouch } = useTouchScroll({
    editorRef: modifiedEditorRef,
    isDraggingRef, isScrollingRef, isPointerBlockRef, globalScrollRef, userScrollingRef,
    updateTeardrops: () => {}, setTeardropsOn: () => {},
  });

  useEffect(() => {
    // Guards block initializing processes if requirements fail to satisfy preconditions
    if (!containerRef.current || !tab || !tab.diffData) {
      console.warn(`[DiffEditor] ⚠️ Missing initialization requirements for tab: ${tabId}`);
      return;
    }
    const diffData = tab.diffData;

    // console.log(`\n[DiffEditor] 🚀 Mounting DiffEditor View for tab: ${tabId}`);

    /** Mount token status tracking layout disposal states safely across micro-task queues. */
    let isMounted = true;

    // Extrapolate configuration arrays from global workspace setup schemes
    const options = buildMonacoOptions(settings);
    
    // Instantiate split rendering layer pipelines using localized dimensions constraints
    const diffEditor = monaco.editor.createDiffEditor(containerRef.current, {
      ...options,
      readOnly: diffData.readOnly, 
      originalEditable: false,     
      automaticLayout: true,
      renderSideBySide: window.innerWidth > 768,
      ignoreTrimWhitespace: true, 
    });
    
    editorRef.current = diffEditor;
    originalEditorRef.current = diffEditor.getOriginalEditor();
    modifiedEditorRef.current = diffEditor.getModifiedEditor();

    /** Lifecycle wrapper container handling Left-panel tactile touch listeners teardown routines. */
    let origTouchDisp: { dispose: () => void } | undefined;

    /** Lifecycle wrapper container handling Right-panel tactile touch listeners teardown routines. */
    let modTouchDisp: { dispose: () => void } | undefined;

    /**
     * Isolated asynchronous file ingest worker processing text stream decoding parameters.
     * Maps virtual Uri identifiers and sets up event listener pipelines.
     */
    const loadDiff = async () => {
      const { originalContent, modifiedContent, filePath } = diffData;
      
      // Parse file formats to load correct language color tokenizers
      const ext = filePath.split('.').pop() || 'plaintext';
      const language = ext === 'js' ? 'javascript' : ext === 'ts' ? 'typescript' : ext;
      
      // Normalize carriage returns down to single newline configurations safely
      const cleanOriginal = (originalContent || '').replace(/\r\n/g, '\n');
      let cleanModified = '';

      if (modifiedContent !== null) {
        cleanModified = modifiedContent.replace(/\r\n/g, '\n');
      } else if (filePath) {
        try {
          // Ingest structural byte blocks from localized device workspace storage arrays
          const raw = await fs.readFile(filePath);
          if (!isMounted) return; 

          let rawStr = '';
          if (typeof raw === 'string') {
            rawStr = raw;
          } else if (raw && typeof (raw as any).byteLength === 'number') {
            rawStr = new TextDecoder().decode(raw as any);
          } else if (raw && typeof raw === 'object' && 'data' in raw) {
            rawStr = String((raw as any).data);
          } else {
            rawStr = String(raw);
          }
          cleanModified = rawStr.replace(/\r\n/g, '\n');
        } catch (err) {
          console.error("[DiffEditor] ❌ Failed to read local file:", err);
          cleanModified = '';
        }
      }

      if (!isMounted) return;

      // ── Original Model Configuration Layer (Left Screen Grid) ──
      const originalUri = monaco.Uri.parse(`git-original://${tab.id}`);
      let originalModel = monaco.editor.getModel(originalUri);
      if (!originalModel) {
        originalModel = monaco.editor.createModel(cleanOriginal, language, originalUri);
      } else {
        originalModel.setValue(cleanOriginal);
      }

      // ── Modified Model Configuration Layer (Right Screen Grid) ──
      const modifiedUri = modifiedContent !== null 
          ? monaco.Uri.parse(`git-modified://${tab.id}`) 
          : monaco.Uri.parse(`file://${filePath}`);

      let modifiedModel = monaco.editor.getModel(modifiedUri);
      
      if (!modifiedModel) {
        modifiedModel = monaco.editor.createModel(cleanModified, language, modifiedUri);
      } else if (modifiedContent !== null) {
        modifiedModel.setValue(cleanModified);
      }

      // WORKFLOW RESOLUTION: Bind File Persistence and Auto-Telemetry loops inside active comparison grid
      if (modifiedContent === null && filePath) {
          
          // 1. Mark target session Tabs as 'dirty' immediately when modifications cascade
          modifiedModel.onDidChangeContent(() => {
            useEditorViewStateStore.getState().setTabDirty(filePath, true);
          });

          // 2. Map Ctrl+S intercept keys to invoke asynchronous storage flush routines and sync Git states
          diffEditor.getModifiedEditor().addAction({
            id: 'editor.action.save',
            label: 'Save File',
            keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
            run: async () => {
               if (!isMounted) return;
               const currentVal = modifiedModel.getValue();
               
               // Write mutations back to hardware blocks securely
               await fs.writeFile(filePath, currentVal);
               
               // Expunge 'dirty' interface styling parameters
               useEditorViewStateStore.getState().setTabDirty(filePath, false);
              // console.log(`[DiffEditor] File saved from Diff view: ${filePath}`);
               
               // Trigger lazy asynchronous dependency resolutions to force Git sidebar diagnostics pass
               import('@/features/git/store/gitStore').then(({ useGitStore }) => {
                 useGitStore.getState().refresh();
               });
            }
          });
      }

      // Commit model parameters into active Monaco viewport controller
      diffEditor.setModel({ original: originalModel, modified: modifiedModel });

      // Enforce subtle timing delays allowing the browser rendering engine to safely allocate layout frames
      setTimeout(() => {
         if (!isMounted) return; 
         const origNode = diffEditor.getOriginalEditor().getDomNode();
         const modNode  = diffEditor.getModifiedEditor().getDomNode();
         
         if (origNode) origTouchDisp = attachOriginalTouch(origNode);
         if (modNode)  modTouchDisp  = attachModifiedTouch(modNode);
      }, 100);
    };

    loadDiff();

    // ── Structural Lifecycle Teardown Routines ─────────────────────────────
    return () => {
      isMounted = false; 
      
      if (origTouchDisp) origTouchDisp.dispose();
      if (modTouchDisp)  modTouchDisp.dispose();
      diffEditor.dispose();
      
      // Clean up standalone models from global Monaco Registry memory trees to shield against leak constraints
      monaco.editor.getModel(monaco.Uri.parse(`git-original://${tab.id}`))?.dispose();
      if (diffData.modifiedContent !== null) {
        monaco.editor.getModel(monaco.Uri.parse(`git-modified://${tab.id}`))?.dispose();
      }
    };
  }, [tabId, settings, tab]); 

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};