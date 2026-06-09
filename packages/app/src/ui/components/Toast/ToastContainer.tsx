// src/ui/components/Toast/ToastContainer.tsx
//
// Mount ONE instance of this anywhere high up in the tree — e.g., in App.tsx.
//
//   import { ToastContainer } from '@/ui/components/Toast';
//   // in App return:
//   <ToastContainer />

import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { useToastStore }  from '@/store/toastStore';
import { ToastItem }      from './ToastItem';
import type { ToastPosition } from '@/store/toastStore';
import './Toast.css' ;
// All possible anchor positions
const POSITIONS: ToastPosition[] = [
  'bottom-center',
  'bottom-left',
  'bottom-right',
  'side-right',
  'side-left',
];

export const ToastContainer: React.FC = () => {
  const toasts = useToastStore(s => s.toasts);

  return (
    <>
      {POSITIONS.map(position => {
        const group = toasts.filter(t => t.position === position);
        return (
          <div
            key={position}
            className={`ms-toast-anchor ms-toast-anchor--${position}`}
            aria-live="polite"
            aria-atomic="false"
          >
            <AnimatePresence mode="sync" initial={false}>
              {group.map(t => (
                <ToastItem key={t.id} toast={t} />
              ))}
            </AnimatePresence>
          </div>
        );
      })}
    </>
  );
};