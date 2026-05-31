// features/git/menu/actions.ts
import type { MenuItem } from '@/store/menuStore'; 
import { useGitStore } from '@/features/git/store/gitStore';
import { commands } from '@/core/extensionAPI/registry/commandRegistry';
import { useOutputStore } from '@/features/termis/components/output/store/outputStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { useNotificationStore } from '@/store/notificationStore';


const s = useGitStore.getState() as any;

export const changesActions: MenuItem[] = [
                    // ✓ Stage All
                    {
                        id: 'git-stage-all',
                        icon: 'check',
                        label: 'Stage All Changes',
                        onClick: () => useGitStore.getState().stageAll(),
                    },
                    // ↺  Refresh
                    {
                        id: 'git-changes-refresh',
                        icon: 'refresh',
                        label: 'Refresh',
                        // sidebarRegistry adds a spin class automatically when isLoading changes
                        // because we pass the store selector below in the `loading` field
                        // loading: () => useGitStore.getState().isLoading,
                        onClick: () => useGitStore.getState().refresh(),
                    },

                    // ── Quick top-level ──────────────────────────────────────────────────────
                    { id: 'pull', label: 'Pull', icon: 'arrow-down', onClick: s.pull },
                    { id: 'push', label: 'Push', icon: 'arrow-up', onClick: s.push },
                    { id: 'clone', label: 'Clone…', icon: 'repo-clone', onClick: s.cloneRepo },
                    { id: 'checkout', label: 'Checkout to…', icon: 'git-branch', onClick: s.openBranchPalette },
                    { id: 'fetch', label: 'Fetch', icon: 'sync', onClick: s.fetch },

                    { id: 'sep0', type: 'separator' },

                    // ── Commit ───────────────────────────────────────────────────────────────
                    {
                        id: 'commit-submenu', label: 'Commit',
                        children: [
                            { id: 'c-staged', label: 'Commit Staged', onClick: () => s.commit() },
                            { id: 'c-all', label: 'Commit All', onClick: () => s.commit({ all: true }) },
                            { id: 'c-undo', label: 'Undo Last Commit', onClick: s.undoLastCommit },
                            { id: 'c-abort', label: 'Abort Rebase', disabled: !s.isRebasing, onClick: () => s.abortRebase() },
                            { type: 'separator', id: 'c-sep1' },
                            { id: 'c-amend', label: 'Commit (Amend)', onClick: () => s.commitAmend() },
                            { id: 'c-amend-staged', label: 'Commit Staged (Amend)', onClick: () => s.commitAmend() },
                            { id: 'c-amend-all', label: 'Commit All (Amend)', onClick: () => s.commitAmend({ all: true }) },
                            { type: 'separator', id: 'c-sep2' },
                            { id: 'c-sign', label: 'Commit (Signed Off)', onClick: () => s.commit({ signoff: true }) },
                            { id: 'c-sign-staged', label: 'Commit Staged (Signed Off)', onClick: () => s.commit({ signoff: true }) },
                            { id: 'c-sign-all', label: 'Commit All (Signed Off)', onClick: () => s.commit({ all: true, signoff: true }) },
                        ],
                    },

                    // ── Changes ───────────────────────────────────────────────────────────────
                    {
                        id: 'changes-group', label: 'Changes', icon: 'diff',
                        children: [
                            { id: 'stage-all', label: 'Stage All Changes', onClick: s.stageAll, disabled: s.unstagedFiles.length === 0 },
                            { id: 'unstage-all', label: 'Unstage All Changes', onClick: s.unstageAll, disabled: s.stagedFiles.length === 0 },
                            {
                                id: 'discard-all', label: 'Discard All Changes',
                                disabled: s.unstagedFiles.length === 0,
                                onClick: () => {
                                    const notif = useNotificationStore.getState();
                                    let nid = '';
                                    nid = notif.addNotification({
                                        type: 'confirmation', title: 'Discard All Changes', source: 'Git',
                                        message: 'Discard ALL unstaged changes? This cannot be undone.',
                                        actions: [
                                            {
                                                label: 'Discard', variant: 'type1',
                                                customStyle: { backgroundColor: '#d32f2f', color: '#fff', borderColor: '#d32f2f' },
                                                onClick: () => { notif.removeNotification(nid); s.discardAll(); },
                                            },
                                            { label: 'Cancel', onClick: () => notif.removeNotification(nid) },
                                        ],
                                    });
                                },
                            },
                        ],
                    },

                    // ── Pull, Push ────────────────────────────────────────────────────────────
                    {
                        id: 'pull-push-submenu', label: 'Pull, Push',
                        children: [
                            { id: 'pp-sync', label: 'Sync', onClick: () => s.sync(), disabled: !s.hasUpstream },
                            { type: 'separator', id: 'pp-s1' },
                            { id: 'pp-pull', label: 'Pull', onClick: () => s.pull(), disabled: !s.hasUpstream },
                            { id: 'pp-pull-rebase', label: 'Pull (Rebase)', onClick: () => s.pullRebase(), disabled: !s.hasUpstream },
                            { id: 'pp-pull-from', label: 'Pull from…', onClick: () => s.pullFrom() },
                            { type: 'separator', id: 'pp-s2' },
                            { id: 'pp-push', label: 'Push', onClick: () => s.push(), disabled: !s.hasUpstream },
                            { id: 'pp-push-to', label: 'Push to…', onClick: () => s.pushTo() },
                            { type: 'separator', id: 'pp-s3' },
                            { id: 'pp-fetch', label: 'Fetch', onClick: () => s.fetch(), disabled: !s.hasUpstream },
                            { id: 'pp-fetch-prune', label: 'Fetch (Prune)', onClick: () => s.fetchPrune(), disabled: !s.hasUpstream },
                            { id: 'pp-fetch-all', label: 'Fetch From All Remotes', onClick: () => s.fetchAll() },
                        ],
                    },

                    // ── Branch ────────────────────────────────────────────────────────────────
                    {
                        id: 'branch-submenu', label: 'Branch',
                        children: [
                            { id: 'b-merge', label: 'Merge Branch…', onClick: () => s.mergeBranch() },
                            { id: 'b-rebase', label: 'Rebase Branch…', onClick: () => s.rebaseBranch() },
                            { type: 'separator', id: 'b-sep1' },
                            { id: 'b-create', label: 'Create Branch…', onClick: () => s.createBranch() },
                            { id: 'b-create-from', label: 'Create Branch From…', onClick: () => s.createBranchFrom() },
                            { type: 'separator', id: 'b-sep2' },
                            { id: 'b-rename', label: 'Rename Branch…', onClick: () => s.renameBranch() },
                            { id: 'b-delete', label: 'Delete Branch…', onClick: () => s.deleteBranch() },
                            { id: 'b-delete-rem', label: 'Delete Remote Branch…', onClick: () => s.deleteRemoteBranch() },
                            { type: 'separator', id: 'b-sep3' },
                            { id: 'b-publish', label: 'Publish Branch…', onClick: () => s.publishBranch(), disabled: s.hasUpstream },
                        ],
                    },

                    // ── Remote ────────────────────────────────────────────────────────────────
                    {
                        id: 'remote-submenu', label: 'Remote',
                        children: [
                            { id: 'r-add', label: 'Add Remote…', onClick: () => s.addRemote() },
                            { id: 'r-remove', label: 'Remove Remote…', onClick: () => s.removeRemote() },
                        ],
                    },

                    // ── Stash ─────────────────────────────────────────────────────────────────
                    {
                        id: 'stash-submenu', label: 'Stash',
                        children: [
                            { id: 'st-stash', label: 'Stash', onClick: () => s.stash(), disabled: !(s.stagedFiles.length > 0 || s.unstagedFiles.length > 0) },
                            { id: 'st-stash-untrack', label: 'Stash (Include Untracked)', onClick: () => s.stash({ includeUntracked: true }), disabled: !(s.stagedFiles.length > 0 || s.unstagedFiles.length > 0) },
                            { id: 'st-stash-staged', label: 'Stash Staged', onClick: () => s.stash({ staged: true }), disabled: s.stagedFiles.length === 0 },
                            { type: 'separator', id: 'st-sep1' },
                            { id: 'st-apply-latest', label: 'Apply Latest Stash', onClick: () => s.applyStash(true), disabled: s.stashes.length === 0 },
                            { id: 'st-apply', label: 'Apply Stash…', onClick: () => s.applyStash(), disabled: s.stashes.length === 0 },
                            { id: 'st-pop-latest', label: 'Pop Latest Stash', onClick: () => s.popStash(true), disabled: s.stashes.length === 0 },
                            { id: 'st-pop', label: 'Pop Stash…', onClick: () => s.popStash(), disabled: s.stashes.length === 0 },
                            { type: 'separator', id: 'st-sep2' },
                            { id: 'st-drop', label: 'Drop Stash…', onClick: () => s.dropStash(), disabled: s.stashes.length === 0 },
                            { id: 'st-drop-all', label: 'Drop All Stashes…', onClick: () => s.dropAllStashes(), disabled: s.stashes.length === 0 },
                            { type: 'separator', id: 'st-sep3' },
                            { id: 'st-view', label: 'View Stash…', onClick: () => s.viewStash(), disabled: s.stashes.length === 0 },
                        ],
                    },

                    // ── Tags ──────────────────────────────────────────────────────────────────
                    {
                        id: 'tags-submenu', label: 'Tags',
                        children: [
                            { id: 't-create', label: 'Create Tag…', onClick: () => s.createTag(), disabled: s.recentCommits.length === 0 },
                            { id: 't-delete', label: 'Delete Tag…', onClick: () => s.deleteTag(), disabled: s.tags.length === 0 },
                            { type: 'separator', id: 't-sep1' },
                            { id: 't-push', label: 'Push Tags', onClick: () => s.pushTags(), disabled: !s.hasUpstream },
                        ],
                    },

                    { id: 'sep-last', type: 'separator' },

                    // ── Output ────────────────────────────────────────────────────────────────
                    {
                        id: 'git-output', label: 'Show Git Output', icon: 'output',
                        onClick: () => {
                            commands.executeCommand('termis.open.output');
                            useOutputStore.getState().setActiveChannel('Git');
                            useSidebarStore.getState().setState('collapsed');
                        },
                    },

                ] ;