// src/ui/components/ModalEditor/ModalEditor.tsx
//
// Professional JSON modal editor.
// • MemoryCodeEditor — full mobile touch support, teardrops, custom menu
// • Real-time JSON validation via Monaco markers
// • Status bar: valid / syntax error
// • Format button, Ctrl+S shortcut

import React, { useState, useEffect, useRef, useCallback, useId } from 'react';
import type * as Monaco from 'monaco-editor';

import { Modal }             from '@/ui/components/Modal/Modal';
import { Button }            from '@/ui/components/Button/Button';
import { Icon }              from '@/ui/components/Icon/IconRegistry';
import { MemoryCodeEditor }  from '@/features/editor/MemoryCodeEditor';

// ── Props ─────────────────────────────────────────────────────────────────────

export interface ModalEditorProps {
  isOpen:        boolean;
  title:         string;
  initialValue:  unknown;
  type?:         'object' | 'array';
  onClose:       () => void;
  onSave:        (parsedData: unknown) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatJSON = (val: unknown, fallback: string): string => {
  if (typeof val === 'string') {
    try { return JSON.stringify(JSON.parse(val), null, 2); } catch { return val; }
  }
  try { return JSON.stringify(val, null, 2); } catch { return fallback; }
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ModalEditor: React.FC<ModalEditorProps> = ({
  isOpen,
  title,
  initialValue,
  type = 'object',
  onClose,
  onSave,
}) => {
  const fallback = type === 'array' ? '[]' : '{}';

  // Stable instance id — stays the same for the lifetime of this modal instance.
  // useId() gives a React-unique string; strip the colon so it's URI-safe.
  const rawId = useId();
  const instanceId = `modal-${rawId.replace(/:/g, '')}`;

  const [text, setText]   = useState(() => formatJSON(initialValue, fallback));
  const [error, setError] = useState<string | null>(null);

  // Editor instance for imperative actions (format document)
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  // ── Re-init when modal opens ───────────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      const formatted = formatJSON(initialValue, fallback);
      setText(formatted);
      setError(null);
      // Push into Monaco model if already mounted
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model && model.getValue() !== formatted) {
          model.setValue(formatted);
        }
        setTimeout(() => editorRef.current?.layout(), 80);
      }
    }
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── onChange — optimistic parse ────────────────────────────────────────────
  const handleChange = useCallback((val: string) => {
    setText(val);
    try   { JSON.parse(val); setError(null); }
    catch (e: any) { setError(e.message); }
  }, []);

  // ── Monaco marker callback — use marker data for richer error message ──────
  const handleMarkersChange = useCallback((markers: Monaco.editor.IMarker[]) => {
    const errs = markers.filter(m => m.severity >= 8); // Error severity
    setError(errs.length > 0 ? errs[0].message : null);
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    try {
      const parsed = JSON.parse(text);
      onSave(parsed);
      onClose();
    } catch (e: any) {
      setError(e.message);
      // Jump to first error in editor
      editorRef.current?.trigger('', 'editor.action.marker.nextInFiles', {});
    }
  }, [text, onSave, onClose]);

  // ── Format ─────────────────────────────────────────────────────────────────
  const handleFormat = useCallback(() => {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
  }, []);

  // ── Ctrl+S shortcut ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, handleSave]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      title={title}
      iconName="code"
      onClose={onClose}
      footerActions={
        <>
          {/* Format — left side */}
          <button
            title="Format JSON (Shift+Alt+F)"
            onClick={handleFormat}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '5px',
              padding:      '5px 10px',
              border:       '1px solid var(--ms-border-light)',
              borderRadius: '3px',
              background:   'transparent',
              color:        'var(--ms-text-faded)',
              fontSize:     '12px',
              cursor:       'pointer',
              marginRight:  'auto',
            }}
          >
            <Icon name="symbol-color" size={14} />
            Format
          </button>

          <Button onClick={onClose} variant="type2">Cancel</Button>
          <Button onClick={handleSave} variant="type1" disabled={!!error}>
            Save Changes
          </Button>
        </>
      }
    >
      {/* ── Wrapper ── */}
      <div style={{
        display:         'flex',
        flexDirection:   'column',
        height:          '480px',
        width:           '100%',
        boxSizing:       'border-box',
        backgroundColor: 'var(--ms-bg-main)',
        overflow:        'hidden',
      }}>

        {/* ── Status bar ── */}
        <div style={{
          display:         'flex',
          alignItems:      'center',
          gap:             '8px',
          padding:         '5px 12px',
          borderBottom:    `1px solid ${error ? '#f48771' : 'var(--ms-border-light)'}`,
          backgroundColor: error ? 'rgba(244,135,113,0.08)' : 'var(--ms-bg-activity)',
          color:           error ? '#f48771' : 'var(--ms-text-faded)',
          fontSize:        '11.5px',
          flexShrink:      0,
          minHeight:       '28px',
          transition:      'background 0.15s, border-color 0.15s',
        }}>
          <Icon name={error ? 'error' : 'check'} size={13} />
          <span style={{
            fontFamily: error ? 'monospace' : 'inherit',
            wordBreak:  'break-all',
            lineHeight: 1.35,
          }}>
            {error
              ? `Syntax Error: ${error}`
              : `Valid JSON ${type}  ·  Ctrl+S to save  ·  Shift+Alt+F to format`}
          </span>
        </div>

        {/* ── Editor (full touch support via MemoryCodeEditor) ── */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <MemoryCodeEditor
            instanceId={instanceId}
            language="json"
            value={text}
            onChange={handleChange}
            onEditorMount={(ed) => { editorRef.current = ed; }}
            onMarkersChange={handleMarkersChange}
          />
        </div>
      </div>
    </Modal>
  );
};