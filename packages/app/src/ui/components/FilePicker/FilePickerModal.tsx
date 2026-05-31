// src/ui/components/FilePicker/FilePickerModal.tsx
import React, { useState, useEffect } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Modal } from '../Modal/Modal';
import { useFilePickerStore } from '@/store/filePickerStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
import { useMenuStore } from '@/store/menuStore'; 
import { useRecentStore } from '@/store/recentStore';
import { useBackButtonStore } from '@/store/backButtonStore';
import { fs } from '@/core/fileSystem';
import type { FileStat } from '@/core/fileSystem/IFileSystem';
import { Icon } from '../Icon/IconRegistry'; 

import { FilePickerToolbar } from './FilePickerToolbar';
import { FilePickerList, type InlineEditState } from './FilePickerList';
import { FilePickerFooter } from './FilePickerFooter';
import './FilePicker.css';

export const FilePickerModal: React.FC = () => {
  const { isOpen, options, closePicker } = useFilePickerStore();
  const openMode = useSettingsStore(s => s.settings['workbench.explorer.openMode']) ?? 'singleClick';
  const { openMenu } = useMenuStore(); 
  
  //  BOOKMARKS & RECENT STATE
  const { bookmarks, recentWorkspaces } = useRecentStore(); 

  // State
  const [currentPath, setCurrentPath] = useState<string>('ROOT');
  const [rootView, setRootView] = useState<'storage' | 'recent'>('storage'); //  Home Page Tab State
  const [allItems, setAllItems] = useState<FileStat[]>([]);
  const [rootStorages, setRootStorages] = useState<FileStat[]>([]);
  const [selectedPaths, setSelectedPaths] = useState<Set<string>>(new Set());
  
  // Advanced Features
  const [fileNameInput, setFileNameInput] = useState('');
  const [activeFilterIndex, setActiveFilterIndex] = useState(0);
  const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
  const [clipboard, setClipboard] = useState<{ path: string, name: string, isCut: boolean } | null>(null);

  // ── 1. Init & Reset ──
  useEffect(() => {
    if (isOpen && options) {
      setCurrentPath(options.defaultPath || 'ROOT');
      setFileNameInput(options.defaultName || '');
      setSelectedPaths(new Set());
      setActiveFilterIndex(0);
      setInlineEdit(null);
      setRootView('storage'); // Reset tab to storage
    }
  }, [isOpen, options]);

  // ── 2. Load Roots ──
  useEffect(() => {
    const loadRoots = async () => {
      const roots: FileStat[] = [{ name: 'Internal Storage', path: '/storage/emulated/0', isDirectory: true }];
      try {
        const uriRes = await Filesystem.getUri({ directory: Directory.Data, path: '' });
        const dataPath = uriRes.uri.replace('file://', '');
        const projectsPath = dataPath + '/projects'; 
        try { await Filesystem.stat({ path: projectsPath }); } catch { await Filesystem.mkdir({ path: projectsPath, recursive: true }); }
        roots.push({ name: 'MS Projects', path: projectsPath, isDirectory: true });
        roots.push({ name: 'MS System (Data)', path: dataPath, isDirectory: true });
      } catch (e) {
        roots.push({ name: 'MS Projects', path: '/data/data/com.editor.mscode/files/projects', isDirectory: true });
      }
      try {
        const termuxPath = '/data/data/com.termux/files/home';
        await fs.readDir(termuxPath);
        roots.push({ name: 'Termux (Home)', path: termuxPath, isDirectory: true });
      } catch (e) {}
      setRootStorages(roots);
    };
    if (isOpen) loadRoots();
  }, [isOpen]);

  // ── 3. Read Files & Manage Root View ──
  const refreshFiles = () => {
    if (currentPath !== 'ROOT') {
      fs.readDir(currentPath).then(res => setAllItems(res || []));
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    if (currentPath === 'ROOT') {
      if (rootView === 'storage') {
        setAllItems(rootStorages);
      } else {
        const recentItems = recentWorkspaces.map(w => ({ name: w.name, path: w.path, isDirectory: true } as FileStat));
        setAllItems(recentItems);
      }
      setSelectedPaths(new Set());
    } else {
      refreshFiles();
    }
  }, [currentPath, isOpen, rootStorages, rootView, recentWorkspaces]);

  // ── 4. Filtering Logic ──
  const visibleItems = allItems.filter(item => {
    if (!options) return false;
    if (options.showHidden === false && item.name.startsWith('.')) return false;
    if (item.isDirectory) return true; 

    if (options.filters && options.filters.length > 0) {
      const filter = options.filters[activeFilterIndex];
      if (filter && filter.extensions.length > 0) {
        const ext = item.name.split('.').pop() || '';
        return filter.extensions.includes(ext);
      }
    }
    return true;
  });

  // ── 5. Navigation Handlers ──
  const handleGoUp = () => {
    if (currentPath === 'ROOT') return;
    if (rootStorages.some(r => r.path === currentPath)) return setCurrentPath('ROOT');
    if (recentWorkspaces.some(r => r.path === currentPath)) return setCurrentPath('ROOT'); // Recent থেকেও ব্যাক করলে ROOT-এ আসবে

    const parts = currentPath.split('/').filter(Boolean);
    parts.pop(); 
    setCurrentPath('/' + parts.join('/'));
  };

  const handleItemClick = (item: FileStat) => {
    if (options!.mode === 'multiFile') {
      const newSet = new Set(selectedPaths);
      if (newSet.has(item.path)) newSet.delete(item.path);
      else newSet.add(item.path);
      setSelectedPaths(newSet);
    } else {
      setSelectedPaths(new Set([item.path]));
      if (options!.mode === 'saveAs' && !item.isDirectory) {
        setFileNameInput(item.name);
      }
    }

    if (openMode === 'singleClick') {
      if (item.isDirectory) {
        setCurrentPath(item.path);
        setSelectedPaths(new Set());
      } else if (options!.mode === 'file') {
        closePicker(item.path); 
      }
    }
  };

  const handleItemDoubleClick = (item: FileStat) => {
    if (openMode === 'doubleClick') {
      if (item.isDirectory) {
        setCurrentPath(item.path);
        setSelectedPaths(new Set());
      } else if (options!.mode === 'file') {
        closePicker(item.path);
      }
    }
  };

  // ── 6. Inline Edit Handlers ──
  const handleInlineSubmit = async (newName: string) => {
    if (!inlineEdit || !newName.trim()) return setInlineEdit(null);
    try {
      if (inlineEdit.isNew) {
        const target = `${inlineEdit.targetPath}/${newName.trim()}`;
        if (inlineEdit.isFolder) await fs.mkdir(target);
        else await fs.writeFile(target, '');
      } else {
        const parentPath = inlineEdit.targetPath.substring(0, inlineEdit.targetPath.lastIndexOf('/'));
        const newPath = `${parentPath}/${newName.trim()}`;
        await fs.rename(inlineEdit.targetPath, newPath);
      }
    } catch (e) {
      console.error("FS Error", e);
    }
    setInlineEdit(null);
    refreshFiles();
  };

  // ── 7. Context Menu ──
  const handleContextMenu = (e: React.MouseEvent, item?: FileStat) => {
    e.preventDefault();
    if (currentPath === 'ROOT') return; 

    if (!item) {
      openMenu('filepicker/bg', e.clientX, e.clientY, [
        { id: 'nf', label: 'New File', icon: 'new-file', onClick: () => setInlineEdit({ isNew: true, isFolder: false, initialName: 'NewFile.txt', targetPath: currentPath }) },
        { id: 'nd', label: 'New Folder', icon: 'new-folder', onClick: () => setInlineEdit({ isNew: true, isFolder: true, initialName: 'NewFolder', targetPath: currentPath }) },
        { type: 'separator', id: 's1' },
        { id: 'p', label: 'Paste', icon: 'folder', disabled: !clipboard, onClick: () => doPaste(currentPath) }
      ]);
    } else {
      const itemsMenu: any[] = [];
      if (item.isDirectory) {
        itemsMenu.push({ id: 'o', label: 'Open Folder', icon: 'folder', onClick: () => setCurrentPath(item.path) });
        itemsMenu.push({ id: 'pi', label: 'Paste inside', icon: 'folder', disabled: !clipboard, onClick: () => doPaste(item.path) });
        itemsMenu.push({ type: 'separator', id: 's1' });

        const { addBookmark, removeBookmark } = useRecentStore.getState();
        const isBookmarked = bookmarks.some(b => b.path === item.path);

        if (isBookmarked) {
          itemsMenu.push({ id: 'remove-bm', label: 'Remove Bookmark', icon: 'close', onClick: () => removeBookmark(item.path) });
        } else {
          itemsMenu.push({ id: 'add-bm', label: 'Add to Bookmarks', icon: 'star', onClick: () => addBookmark(item.name, item.path) });
        }
      }
      itemsMenu.push(
        { id: 'c', label: 'Copy', icon: 'files', onClick: () => setClipboard({ path: item.path, name: item.name, isCut: false }) },
        { id: 'x', label: 'Cut', icon: 'close', onClick: () => setClipboard({ path: item.path, name: item.name, isCut: true }) },
        { type: 'separator', id: 's2' },
        { id: 'r', label: 'Rename', icon: 'edit', onClick: () => setInlineEdit({ isNew: false, isFolder: item.isDirectory, initialName: item.name, targetPath: item.path }) },
        { id: 'd', label: 'Delete', icon: 'trash', onClick: async () => { if(confirm(`Delete ${item.name}?`)) { await fs.delete(item.path); refreshFiles(); } } }
      );
      openMenu('filepicker/item', e.clientX, e.clientY, itemsMenu);
    }
  };

  const doPaste = async (targetFolder: string) => {
    if (!clipboard) return;
    const newPath = `${targetFolder}/${clipboard.name}`;
    try {
      if (clipboard.isCut) { 
        await fs.rename(clipboard.path, newPath); 
        setClipboard(null); 
      } else { 
        await (fs as any).copy(clipboard.path, newPath); 
      }
      refreshFiles();
    } catch (e) { alert("Paste failed!"); }
  };

  // ── 8. MAGIC: Auto Swap Extension ──
  useEffect(() => {
    if (options?.mode === 'saveAs' && fileNameInput) {
      const filter = options.filters?.[activeFilterIndex];
      if (filter && filter.extensions.length > 0) {
        const newExt = filter.extensions[0];
        const parts = fileNameInput.split('.');
        if (parts.length > 1) {
          parts.pop(); 
          setFileNameInput(`${parts.join('.')}.${newExt}`);
        } else {
          setFileNameInput(`${fileNameInput}.${newExt}`); 
        }
      }
    }
  }, [activeFilterIndex]);

  // ── 9. Footer Confirmation Logic ──
  const handleConfirm = () => {
    if (options!.mode === 'saveAs') {
      let finalName = fileNameInput.trim();
      const activeFilter = options!.filters?.[activeFilterIndex];
      if (activeFilter && activeFilter.extensions.length > 0) {
        const hasExt = activeFilter.extensions.some(ext => finalName.endsWith(`.${ext}`));
        if (!hasExt) finalName += `.${activeFilter.extensions[0]}`;
      }
      closePicker(`${currentPath}/${finalName}`);
    } 
    else if (options!.mode === 'multiFile') {
      closePicker(Array.from(selectedPaths));
    } 
    else if (options!.mode === 'folder') {
      const sel = Array.from(selectedPaths)[0];
      closePicker(sel ? sel : currentPath);
    } 
    else {
      closePicker(Array.from(selectedPaths)[0]);
    }
  };

  // ── 10. Hardware Back Button Handling ──
  useEffect(() => {
    if (isOpen) {
      useBackButtonStore.getState().push('ms-file-picker', () => {
        if (inlineEdit) setInlineEdit(null);
        else if (currentPath === 'ROOT') closePicker(null);
        else handleGoUp();
        return true; 
      });
    }
    return () => {
      useBackButtonStore.getState().remove('ms-file-picker');
    };
  }, [isOpen, currentPath, rootStorages, inlineEdit]);


  if (!isOpen || !options) return null;

  let isConfirmDisabled = false;
  if (options.mode === 'saveAs') isConfirmDisabled = !fileNameInput.trim();
  else if (options.mode === 'multiFile') isConfirmDisabled = selectedPaths.size === 0;
  else if (options.mode === 'file') isConfirmDisabled = selectedPaths.size === 0;
  else if (options.mode === 'folder' && options.requiredFiles?.length) {
    const hasRequired = allItems.some(i => !i.isDirectory && options.requiredFiles!.includes(i.name));
    isConfirmDisabled = !hasRequired;
  }

  return (
    <Modal 
      isOpen={isOpen} 
      title={options.title || (options.mode === 'saveAs' ? 'Save As...' : 'Select File')} 
      iconName={options.icon || 'folder'}
      onClose={() => closePicker(null)}
    >
      <div className="ms-filepicker-layout">
        
        {/* TOP TOOLBAR */}
        <FilePickerToolbar 
          currentPath={currentPath}
          allowCreate={options.allowCreate !== false}
          onGoUp={handleGoUp}
          onRefresh={refreshFiles}
          onCreateFile={() => setInlineEdit({ isNew: true, isFolder: false, initialName: 'NewFile.txt', targetPath: currentPath })}
          onCreateFolder={() => setInlineEdit({ isNew: true, isFolder: true, initialName: 'NewFolder', targetPath: currentPath })}
        />

        {/*  BOOKMARKS BAR */}
        {bookmarks.length > 0 && (
          <div style={{ 
            display: 'flex', alignItems: 'center', overflowX: 'auto', gap: '6px', 
            padding: '0', backgroundColor: 'var(--ms-bg-base)', borderBottom: '1px solid var(--ms-border-light)'
          }}>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }}>
              <style>{`.ms-filepicker-bookmarks::-webkit-scrollbar { display: none; }`}</style>
              <div className="ms-filepicker-bookmarks" style={{ display: 'flex', gap: '6px' }}>
                {bookmarks.map((bm, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setCurrentPath(bm.path)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', padding: '0px 8px',
                      backgroundColor: currentPath === bm.path ? 'var(--ms-bg-active)' : 'var(--ms-bg-main)',
                      border: '1px solid var(--ms-border-light)', borderRadius: '1px',
                      cursor: 'pointer', fontSize: '11px', whiteSpace: 'nowrap', userSelect: 'none',
                      color: currentPath === bm.path ? 'var(--ms-text-bright)' : 'var(--ms-text-main)',
                      transition: 'background 0.2s'
                    }}
                    title={bm.path}
                  >
                    <Icon name="star" size={12} color="#dcb67a" />
                    {bm.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HOME ROOT TABS (Storage | Recent) */}
        {currentPath === 'ROOT' && (
          <div style={{ 
            display: 'flex', background: 'var(--ms-bg-side)', borderBottom: '1px solid var(--ms-border-light)', padding: '0 8px' 
          }}>
            <div 
              onClick={() => setRootView('storage')}
              style={{
                padding: '2px 12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', cursor: 'pointer',
                color: rootView === 'storage' ? 'var(--ms-text-bright)' : 'var(--ms-text-faded)',
                borderBottom: rootView === 'storage' ? '2px solid var(--ms-accent-color)' : '2px solid transparent'
              }}
            >
              Storage Locations
            </div>
            <div 
              onClick={() => setRootView('recent')}
              style={{
                padding: '2px 12px', fontSize: '11px', textTransform: 'uppercase', fontWeight: 'bold', cursor: 'pointer',
                color: rootView === 'recent' ? 'var(--ms-text-bright)' : 'var(--ms-text-faded)',
                borderBottom: rootView === 'recent' ? '2px solid var(--ms-accent-color)' : '2px solid transparent'
              }}
            >
              Recent Workspaces
            </div>
          </div>
        )}

        {/* MAIN LIST */}
        <FilePickerList 
          items={visibleItems}
          currentPath={currentPath}
          mode={options.mode}
          selectedPaths={selectedPaths}
          inlineEdit={inlineEdit}
          onItemClick={handleItemClick}
          onItemDoubleClick={handleItemDoubleClick}
          onContextMenu={handleContextMenu}
          onInlineEditSubmit={handleInlineSubmit}
          onInlineEditCancel={() => setInlineEdit(null)}
        />

        {/* FOOTER */}
        <FilePickerFooter 
          options={options}
          fileName={fileNameInput}
          setFileName={setFileNameInput}
          activeFilterIndex={activeFilterIndex}
          setActiveFilterIndex={setActiveFilterIndex}
          onCancel={() => closePicker(null)}
          onConfirm={handleConfirm}
          isConfirmDisabled={isConfirmDisabled}
        />
      </div>
    </Modal>
  );
};