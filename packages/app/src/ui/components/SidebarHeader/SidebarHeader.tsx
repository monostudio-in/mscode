// src/ui/components/SidebarHeader/SidebarHeader.tsx
import React from 'react';
import { Icon } from '@/ui/components/Icon/IconRegistry';
import './SidebarHeader.css';

export const SidebarAction: React.FC<{ 
  icon: string; 
  title?: string;
  onClick?: (e: React.MouseEvent) => void 
}> = ({ icon, title, onClick }) => (
  <div 
    className="ms-sidebar-action-icon" 
    onClick={onClick} 
    title={title}
  >
    <Icon name={icon as any} size={16} />
  </div>
);

interface SidebarHeaderProps {
  title: string;
  rightActions?: React.ReactNode;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({ title, rightActions }) => {
  return (
    <div className="ms-sidebar-header">
      <span style={{ fontWeight: '600', letterSpacing: '0.5px' }}>{title}</span>
      {rightActions && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {rightActions}
        </div>
      )}
    </div>
  );
};