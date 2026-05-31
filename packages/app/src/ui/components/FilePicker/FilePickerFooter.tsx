// src/ui/components/FilePicker/FilePickerFooter.tsx
import React from 'react';
import { InputBox } from '../InputBox/InputBox';
import { Select } from '../Select/Select';
import { Button } from '../Button/Button';
import type { PickerOptions } from '@/store/filePickerStore';

interface FooterProps {
  options: PickerOptions;
  fileName: string;
  setFileName: (val: string) => void;
  activeFilterIndex: number;
  setActiveFilterIndex: (idx: number) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isConfirmDisabled: boolean;
}

export const FilePickerFooter: React.FC<FooterProps> = ({
  options, fileName, setFileName, activeFilterIndex, setActiveFilterIndex, onCancel, onConfirm, isConfirmDisabled
}) => {
  const isSaveAs = options.mode === 'saveAs';
  const hasFilters = options.filters && options.filters.length > 0;

  const selectOptions = options.filters?.map((f, i) => ({
    value: String(i),
    label: f.label + (f.extensions.length ? ` (*.${f.extensions.join(', *.')})` : ' (*.*)')
  })) || [];

  return (
    <div className="ms-filepicker-footer">
      
      {/* ── Optional Input/Select Panel ── */}
      {(isSaveAs || hasFilters) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {isSaveAs && (
            <div className="ms-filepicker-footer-controls">
              <span className="ms-filepicker-footer-label">File name:</span>
              <div style={{ flex: 1 }}>
                <InputBox 
                  value={fileName} 
                  onChange={setFileName} 
                  placeholder={options.fileNamePlaceholder || "Enter file name..."}
                />
              </div>
            </div>
          )}

          {hasFilters && (
            <div className="ms-filepicker-footer-controls">
              <span className="ms-filepicker-footer-label">Format:</span>
              <div style={{ flex: 1 }}>
                <Select 
                  value={String(activeFilterIndex)} 
                  onChange={(val) => setActiveFilterIndex(parseInt(val))} 
                  options={selectOptions}
                  placement="top"
                />
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="ms-filepicker-actions">
        <Button variant="type2" onClick={onCancel}>Cancel</Button>
        <Button variant="type1" disabled={isConfirmDisabled} onClick={onConfirm}>
          {options.buttonText || (options.mode === 'folder' ? 'Select Folder' : options.mode === 'saveAs' ? 'Save' : 'Open')}
        </Button>
      </div>

    </div>
  );
};
