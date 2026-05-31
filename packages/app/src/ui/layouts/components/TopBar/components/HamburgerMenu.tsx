// src/ui/layouts/MainLayout/components/TopBar/HamburgerMenu.tsx
import React from 'react';
import { Icon }              from '@/ui/components/Icon/IconRegistry';
import { useSidebarStore }   from "@/store/sidebarStore";

export const HamburgerMenu: React.FC = () => {
  const { state: sidebarState , toggleMenu} = useSidebarStore();

  if (sidebarState !== 'hidden') return null;

  return (
    <div className="hamburger-menu" onClick={toggleMenu} style={{ background: 'transparent' , color: '#7e7e7e' }}>
      <Icon name="menu" size={20} />
    </div>
  );
};