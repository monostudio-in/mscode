// src/ui/layouts/MainLayout/components/TopBar/TopBar.tsx
import React from 'react';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Tabs } from './components/Tabs';
import { TopTitle } from './components/TopTitle';
import './TopBar.css';

export const TopBar: React.FC = () => {
  return (
    <header className="top-bar">
      <HamburgerMenu />
      <Tabs />
      <TopTitle />
    </header>
  );
};