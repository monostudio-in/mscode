// src/ui/components/Modal/Modal.tsx
import React, { useEffect } from 'react';
import { Icon } from '../Icon/IconRegistry';
import type { IconName } from '../Icon/IconRegistry'; 

/**
 * Configuration schema for the MS Code Native Modal Component.
 */
export interface ModalProps {
  /** Controls the visibility state of the modal viewport overlay. */
  isOpen: boolean;

  /** Primary header title string displayed at the top left of the modal wrapper. */
  title: string;

  /** * Optional icon token from the Codicon registry to be positioned right before the header title.
   * @example 'info', 'gear', 'warning'
   */
  iconName?: IconName | string; 

  /** * Triggers immediately when clicking the close (X) icon button or hitting the `Escape` key.
   * Use this boundary frame callback to revert the `isOpen` state flag to false.
   */
  onClose: () => void;

  /** Inside markup nodes rendered straight within the scrollable content container body view layer. */
  children: React.ReactNode;

  /** * Target action components (like Buttons) to append sequentially inside the sticky lower bottom panel zone.
   * @example 
   * ```tsx
   * <div style={{ display: 'flex', gap: '8px' }}>
   * <Button label="Cancel" variant="secondary" onClick={onClose} />
   * <Button label="Save Changes" onClick={handleSave} />
   * </div>
   * ```
   */
  footerActions?: React.ReactNode;
}

/**
 * Native MS Code Modal overlay Dialog Box context.
 * Adapts to active dark/light IDE styling matrices automatically.
 * * Supports focus escape loops on pressing the **ESC** key natively.
 * * @example
 * ```tsx
 * const { Modal, Button, InputBox } = mscode.ui.components;
 * const [showModal, setShowModal] = useState(true);
 * * <Modal 
 * isOpen={showModal} 
 * title="Create Project Workspace" 
 * iconName="new-folder"
 * onClose={() => setShowModal(false)}
 * footerActions={
 * <>
 * <Button label="Close" onClick={() => setShowModal(false)} />
 * <Button label="Confirm" onClick={handleConfirmClick} />
 * </>
 * }
 * >
 * <div style={{ padding: '16px' }}>
 * <InputBox placeholder="Enter repo layout workspace name..." value={name} onChange={setName} />
 * </div>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, title, iconName, onClose, children, footerActions }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100002, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      {/* Top Thin Bar & Box Design */}
      <div style={{ 
        backgroundColor: 'var(--ms-bg-main)', 
        border: '1px solid var(--ms-border-light)', 
        borderTop: '0.1px solid rgba(85, 85, 85, 0.533)',
        borderRadius: '6px', 
        width: '90%', 
        maxWidth: '500px', 
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)', 
        display: 'flex', 
        flexDirection: 'column' 
      }}>
        
        {/* Header (Icon + Title) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', borderBottom: '1px solid var(--ms-border-light)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {iconName && <Icon name={iconName} size={16} />}
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--ms-text-main)' }}>{title}</span>
          </div>
          <div style={{ cursor: 'pointer', opacity: 0.7 }} onClick={onClose}>
            <Icon name="close" size={16} />
          </div>
        </div>

        {/* Body*/}
        <div style={{ padding: '0', fontSize: '13px', color: 'var(--ms-text-main)', overflowY: 'auto', minHeight: '120px', maxHeight: '80vh' }}>
          {children}
        </div>

        {/* Footer */}
        {footerActions && (
          <div style={{ padding: '10px 15px', borderTop: '1px solid var(--ms-border-light)', display: 'flex', justifyContent: 'flex-end', gap: '8px', backgroundColor: 'var(--ms-bg-side)' }}>
            {footerActions}
          </div>
        )}
      </div>
    </div>
  );
};