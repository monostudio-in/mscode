// src/ui/components/Modal/GlobalModal.tsx
import React from 'react';
import { useModalStore } from '@/store/modalStore';
import { Modal } from './Modal';

export const GlobalModal: React.FC = () => {
  const { isOpen, options, closeModal } = useModalStore();

  if (!isOpen || !options) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      title={options.title} 
      iconName={options.iconName} 
      onClose={() => closeModal(null)}
      footerActions={
        options.buttons?.map((btn, index) => (
          <button 
            key={btn} 
            onClick={() => closeModal(btn)}
            style={{ 
              padding: '6px 12px', 
              background: index === 0 ? 'var(--ms-primary)' : 'transparent', 
              color: index === 0 ? '#fff' : 'var(--ms-text-main)', 
              border: index === 0 ? 'none' : '1px solid var(--ms-border-light)', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            {btn}
          </button>
        ))
      }
    >
      <div style={{ padding: '15px', lineHeight: '1.5' }}>
        {options.message}
      </div>
    </Modal>
  );
};