// src/ui/components/ContextMenu/GlobalContextMenu.tsx
import React from 'react';
import { useMenuStore } from '@/store/menuStore';
import { ContextMenu } from './ContextMenu';

export const GlobalContextMenu: React.FC = () => {
  const { isOpen, position, items } = useMenuStore();

  if (!isOpen) return null;

  return (
    <ContextMenu 
      items={items} 
      style={{ left: position.x, top: position.y }} 
    />
  );
};