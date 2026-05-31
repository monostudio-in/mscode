// src/ui/layouts/MainLayout/components/StartPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';

interface ShortcutItem {
  label: string;
  action: string;
  keys: string[];
  onClick?: () => void;
}

const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: 'var(--ms-font-mono, monospace)',
    color: 'var(--ms-text-faded)',
    background: 'var(--ms-bg-2, rgba(255,255,255,0.05))',
    border: '1px solid var(--ms-border, rgba(255,255,255,0.08))',
    lineHeight: '18px',
    letterSpacing: '0.02em',
    userSelect: 'none',
  }}>
    {children}
  </span>
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export const StartPage: React.FC = () => {
  const shortcuts: ShortcutItem[] = [
    {
      label: 'Open Command Palette',
      action: 'Ctrl + Shift + P',
      keys: ['Ctrl', 'Shift', 'P'],
      onClick: () => commands.executeCommand('workbench.action.showCommands'),
    },
    {
      label: 'Open Folder',
      action: 'Ctrl+K  Ctrl+O',
      keys: ['Ctrl+K', 'Ctrl+O'],
      onClick: () => commands.executeCommand('workbench.action.files.openFolder'),
    },
    {
      label: 'Open Settings',
      action: 'Ctrl + ,',
      keys: ['Ctrl', ','],
      onClick: () => commands.executeCommand('workbench.action.openSettings')
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        gap: '32px',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      {/* Faded Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src="/mono.png"
          alt="MS Code"
          draggable={false}
          style={{
            width: '250px',
            height: '250px',
            objectFit: 'contain',
            opacity: 0.1,
            filter: 'var(--ms-logo-filter, grayscale(1))',
            pointerEvents: 'none',
          }}
        />
      </motion.div>

      {/* Shortcut List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          alignItems: 'flex-start',
          pointerEvents: 'auto',
        }}
      >
        {shortcuts.map((item) => (
          <motion.button
            key={item.label}
            variants={itemVariants}
            onClick={item.onClick}
            whileHover={{ x: 2 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              width: '100%',
              textAlign: 'left',
            }}
          >
            {/* Label */}
            <span
              style={{
                fontSize: '12px',
                color: 'var(--ms-text-faded)',
                fontFamily: 'var(--ms-font-ui, sans-serif)',
                minWidth: '160px',
                opacity: 0.7,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.7')}
            >
              {item.label}
            </span>

            {/* Keys */}
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {item.keys.map((k, i) => (
                <React.Fragment key={i}>
                  <Key>{k}</Key>
                  {i < item.keys.length - 1 && (
                    <span style={{ fontSize: '10px', color: 'var(--ms-text-faded)', opacity: 0.4, margin: '0 1px' }}>+</span>
                  )}
                </React.Fragment>
              ))}
            </span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
};