// src/features/git/GitSkeleton.tsx

import React from 'react';
import { sidebarRegistry } from '@/core/extensionAPI/registry/sidebarRegistry';
import { useGitStore } from './store/gitStore';
import { useSettingsStore } from '@/features/settings/store/settingsStore';
// import { commands } from '@/core/extensionAPI/registry/commandRegistry';
// import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
// import { useSidebarStore } from '@/store/sidebarStore';
// import { useNotificationStore } from '@/store/notificationStore';

import { changesActions } from './menu/actions';

// Components
import { GitChangesSection } from './components/GitChangesSection';
import { GitRepositoriesSection } from './components/GitRepositoriesSection';
import { GitHistorySection } from './components/GitHistorySection';
import { GitStashesSection } from './components/GitStashesSection';
import { GitEmptyState } from './components/GitEmptyState';

import './Git.css';

// ─── Headers ────────────────────────────────────────────────────────────────
const CommitsTitle: React.FC = () => {
  const recentCommits = useGitStore(state => state.recentCommits) || [];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      Commit History ({recentCommits.length})
    </span>
  );
};

// New Stashes Header
const StashesTitle: React.FC = () => {
  const stashes = useGitStore(state => state.stashes) || [];
  return (
    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      Stashes ({stashes.length})
    </span>
  );
};

// ─── Bootstrap ────────────────────────────────────────────────────────────────
export function bootstrapGitPanel() {
    const settings = useSettingsStore.getState().settings;
    const isEnabled = settings['git.enabled'] ?? true;
    
    const registerSidebarView = (isGitRepo: boolean) => {
        if (!isGitRepo) {
            // ── Not a Git Repo: Show Empty State ──
            sidebarRegistry.registerPanel({
                activityBarId: 'git',
                header: { title: 'SOURCE CONTROL' },
                sections: [
                    {
                        id: 'git-empty',
                        title: '', 
                        content: GitEmptyState,
                        defaultExpanded: true,
                        fillHeight: true
                    }
                ]
            });
        } else {
            // ── Is a Git Repo: Show Full Git Panels ──
        sidebarRegistry.registerPanel({
        activityBarId: 'git',

        // ── Panel header: "SOURCE CONTROL" ─────────────────────────────────────
        header: {
            title: 'Source Control',
            maxOverflow: 2,
            actions: isEnabled ? [
                {
                    id: 'git-refresh',
                    icon: 'refresh',
                    label: 'Refresh',
                    onClick: () => useGitStore.getState().refresh(),
                },
            ] : [],
        },

        sections: isEnabled ? [
            // ── REPOSITORIES ───────────────────────────────────────────────────────
            {
                id: 'repositories',
                title: 'Repositories',
                content: GitRepositoriesSection,
                defaultExpanded: true,
                maxOverflow: 0,
                fillHeight: false,
                defaultHeight: 'auto',
                scrollX: true,
                sticky: true,
                stickyTop: 0,
                stickyZIndex: 40,
                actions: [
                    {
                        id: 'discovery',
                        label: 'Sort by Discovery Time',
                        checked: useGitStore.getState().sortMode === 'discovery', 
                        onClick: () => {
                            useGitStore.getState().setSortMode('discovery');
                            sidebarRegistry.updateSection('git', 'repositories', {}); 
                        },
                    },
                    {
                        id: 'name',
                        label: 'Sort by Name',
                        checked: useGitStore.getState().sortMode === 'name',
                        onClick: () => {
                            useGitStore.getState().setSortMode('name');
                            sidebarRegistry.updateSection('git', 'repositories', {});
                        },
                    },
                    {
                        id: 'path',
                        label: 'Sort by Path',
                        checked: useGitStore.getState().sortMode === 'path',
                        onClick: () => {
                            useGitStore.getState().setSortMode('path');
                            sidebarRegistry.updateSection('git', 'repositories', {});
                        },
                    },
                ],
            },

            // ── CHANGES ────────────────────────────────────────────────────────────
            {
                id: 'changes',
                title: 'Changes',
                content: GitChangesSection,
                fillHeight: true,
                defaultExpanded: true,
                maxOverflow: 2,
                defaultHeight: 330,
                actions: changesActions,
            },
            
            // ── COMMITS ────────────────────────────────────────────────────────────
            {
                id: 'commits',
                title: <CommitsTitle />,
                content: GitHistorySection,
                defaultExpanded: false,
                maxOverflow: 0,
                fillHeight: true,
                scrollX: true,
                sticky: true,
                stickyTop: 0,
                stickyZIndex: 40,
                defaultHeight: 230,
            },
            
            // ── STASHES  ────────────────────────────────────────────────────────
            {
                id: 'stashes',
                title: <StashesTitle />,
                content: GitStashesSection,
                defaultExpanded: false,
                maxOverflow: 1,
                fillHeight: true,
                scrollX: true,
                sticky: true,
                stickyTop: 0,
                stickyZIndex: 40,
                actions: [
                    {
                        id: 'drop-all',
                        icon: 'trash',
                        label: 'Drop All Stashes',
                        onClick: () => {
                            const state = useGitStore.getState() as any;
                            if(state.dropAllStashes) state.dropAllStashes();
                        },
                    }
                ]
            },
            
        ] : [],
    });
        }
    };

    // Initial Setup
    const initialState = useGitStore.getState();
    registerSidebarView(initialState.isGitRepo);

    // Reactive Subscription
    useGitStore.subscribe((state, prevState) => {
        if (state.isGitRepo !== prevState.isGitRepo) {
            registerSidebarView(state.isGitRepo);
        }
    });
}