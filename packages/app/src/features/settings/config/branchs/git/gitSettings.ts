// src/features/settings/config/branchs/git/gitSettings.ts

import type { IConfigurationSection } from '@/core/extensionAPI/registry/configurationRegistry';

export const gitSection: IConfigurationSection = {
  id:    'git',
  title: 'Source Control',
  order: 50,
  properties: {

    // ══════════════════════════════════════════════════════════════
    // GENERAL
    // ══════════════════════════════════════════════════════════════

    'git.enabled': {
      title:            'Enable Git',
      subCategory:      'General',
      type:             'boolean',
      defaultValue:     true,
      order:            1,
      tags:             ['git', 'general'],
      markdownDescription: 'Whether git integration is enabled.',
    },

    'git.defaultBranchName': {
      title:            'Default Branch Name',
      subCategory:      'General',
      type:             'string',
      defaultValue:     'main',
      order:            2,
      tags:             ['git', 'branch'],
      markdownDescription:
        'The default branch name when initializing a new repository.\n\n> Common values: `main`, `master`, `trunk`',
    },

    'git.ignoreLimitWarning': {
      title:            'Ignore File Limit Warning',
      subCategory:      'General',
      type:             'boolean',
      defaultValue:     false,
      order:            3,
      tags:             ['git', 'performance'],
      markdownDescription:
        'Suppresses the "too many files" warning when a repository contains more files than the status limit.',
    },

    'git.statusLimit': {
      title:            'Status File Limit',
      subCategory:      'General',
      type:             'number',
      defaultValue:     10000,
      minimum:          100,
      maximum:          100000,
      order:            4,
      tags:             ['git', 'performance'],
      markdownDescription:
        'The maximum number of changes that Git will show. If exceeded, a warning is shown.',
    },

    // ══════════════════════════════════════════════════════════════
    // COMMIT
    // ══════════════════════════════════════════════════════════════

    'git.enableSmartCommit': {
      title:            'Enable Smart Commit',
      subCategory:      'Commit',
      type:             'boolean',
      defaultValue:     false,
      order:            10,
      tags:             ['git', 'commit'],
      markdownDescription:
        'Commit all changes when there are no staged changes.\n\nWhen enabled, clicking **Commit** with nothing staged will automatically stage and commit all modified tracked files.',
    },

    'git.smartCommitChanges': {
      title:            'Smart Commit Changes',
      subCategory:      'Commit',
      type:             'select',
      defaultValue:     'all',
      order:            11,
      tags:             ['git', 'commit'],
      markdownDescription:
        'Controls which changes are committed when `#git.enableSmartCommit#` is enabled and there are no staged changes.',
      enum:             ['all', 'tracked'],
      enumItemLabels:   ['All changes', 'Tracked changes only'],
      enumDescriptions: [
        'Stage and commit all modified and untracked files.',
        'Stage and commit only already-tracked (modified) files — ignores new untracked files.',
      ],
    },

    'git.postCommitCommand': {
      title:            'Post-Commit Command',
      subCategory:      'Commit',
      type:             'select',
      defaultValue:     'none',
      order:            12,
      tags:             ['git', 'commit', 'sync'],
      markdownDescription:
        'Runs a git command after every successful commit.',
      enum:             ['none', 'push', 'sync'],
      enumItemLabels:   ['None', 'Push', 'Sync (Pull then Push)'],
      enumDescriptions: [
        'Do nothing after committing.',
        'Run `git push` after committing.',
        'Run pull first, then push after committing.',
      ],
    },

    'git.requireGitUserConfig': {
      title:            'Require Git User Config',
      subCategory:      'Commit',
      type:             'boolean',
      defaultValue:     true,
      order:            13,
      tags:             ['git', 'commit'],
      markdownDescription:
        'Require `user.name` and `user.email` to be set in git config before allowing a commit.\n\n> Sign in to GitHub to set these automatically.',
    },

    'git.inputValidation': {
      title:            'Commit Message Validation',
      subCategory:      'Commit',
      type:             'select',
      defaultValue:     'warn',
      order:            14,
      tags:             ['git', 'commit'],
      markdownDescription:
        'Controls when to show a validation warning in the commit message input box.',
      enum:             ['always', 'warn', 'off'],
      enumItemLabels:   ['Always show', 'Warn only', 'Off'],
      enumDescriptions: [
        'Always show the character count indicator.',
        'Show a warning indicator when the message exceeds the limit.',
        'Never show commit message validation.',
      ],
    },

    'git.inputValidationLength': {
      title:            'Commit Message Max Length',
      subCategory:      'Commit',
      type:             'number',
      defaultValue:     72,
      minimum:          20,
      maximum:          500,
      order:            15,
      tags:             ['git', 'commit'],
      markdownDescription:
        'The maximum number of characters in the commit message subject line before a warning is shown.',
    },

    'git.useCommitInputAsStashMessage': {
      title:            'Use Commit Input as Stash Message',
      subCategory:      'Commit',
      type:             'boolean',
      defaultValue:     false,
      order:            16,
      tags:             ['git', 'commit', 'stash'],
      markdownDescription:
        'Use the commit message text box content as the stash description when running **Stash**.',
    },

    // ══════════════════════════════════════════════════════════════
    // AUTO FETCH
    // ══════════════════════════════════════════════════════════════

    'git.autofetch': {
      title:            'Auto Fetch',
      subCategory:      'Auto Fetch',
      type:             'boolean',
      defaultValue:     false,
      order:            20,
      tags:             ['git', 'fetch', 'remote'],
      markdownDescription:
        'Automatically fetch changes from the remote server in the background.\n\n> Requires network access. The interval is controlled by `#git.autofetchPeriod#`.',
    },

    'git.autofetchPeriod': {
      title:            'Auto Fetch Period (seconds)',
      subCategory:      'Auto Fetch',
      type:             'number',
      defaultValue:     180,
      minimum:          30,
      maximum:          3600,
      order:            21,
      tags:             ['git', 'fetch', 'remote'],
      markdownDescription:
        'How often (in seconds) to automatically fetch from the remote when `#git.autofetch#` is enabled.\n\n- Default: `180` (3 minutes)\n- Minimum: `30` seconds',
    },

    // ══════════════════════════════════════════════════════════════
    // SYNC (PULL / PUSH)
    // ══════════════════════════════════════════════════════════════

    'git.confirmSync': {
      title:            'Confirm Before Sync',
      subCategory:      'Sync',
      type:             'boolean',
      defaultValue:     true,
      order:            30,
      tags:             ['git', 'sync'],
      markdownDescription:
        'Show a confirmation dialog before synchronizing (pull + push) a branch.',
    },

    'git.rebaseWhenSync': {
      title:            'Rebase When Syncing',
      subCategory:      'Sync',
      type:             'boolean',
      defaultValue:     false,
      order:            31,
      tags:             ['git', 'sync', 'rebase'],
      markdownDescription:
        'Use `git rebase` instead of `git merge` when syncing branches.\n\n> This keeps the commit history linear.',
    },

    'git.fetchOnPull': {
      title:            'Fetch Before Pull',
      subCategory:      'Sync',
      type:             'boolean',
      defaultValue:     false,
      order:            32,
      tags:             ['git', 'pull', 'fetch'],
      markdownDescription:
        'Run `git fetch` before every `git pull` to get the latest remote state first.',
    },

    'git.pruneOnFetch': {
      title:            'Prune on Fetch',
      subCategory:      'Sync',
      type:             'boolean',
      defaultValue:     false,
      order:            33,
      tags:             ['git', 'fetch', 'remote'],
      markdownDescription:
        'Prune deleted remote branches when fetching (`git fetch --prune`).',
    },

    'git.pullBeforePush': {
      title:            'Pull Before Push',
      subCategory:      'Sync',
      type:             'boolean',
      defaultValue:     false,
      order:            34,
      tags:             ['git', 'push', 'pull'],
      markdownDescription:
        'Automatically pull from the remote before pushing, to reduce the chance of rejected pushes.',
    },

    // ══════════════════════════════════════════════════════════════
    // BRANCH
    // ══════════════════════════════════════════════════════════════

    'git.branchSortOrder': {
      title:            'Branch Sort Order',
      subCategory:      'Branch',
      type:             'select',
      defaultValue:     'committerdate',
      order:            40,
      tags:             ['git', 'branch'],
      markdownDescription:
        'Controls the sort order when showing branches in the branch picker.',
      enum:             ['committerdate', 'name', 'creatordate'],
      enumItemLabels:   ['Last commit date', 'Name (alphabetical)', 'Branch creation date'],
    },

    'git.branchPrefix': {
      title:            'Branch Name Prefix',
      subCategory:      'Branch',
      type:             'string',
      defaultValue:     '',
      order:            41,
      tags:             ['git', 'branch'],
      markdownDescription:
        'A string prefix that is always prepended when creating a new branch.\n\n> Example: `feat/` → new branch input becomes `feat/my-feature`',
    },

    'git.branchWhitespaceChar': {
      title:            'Branch Whitespace Character',
      subCategory:      'Branch',
      type:             'string',
      defaultValue:     '-',
      order:            42,
      tags:             ['git', 'branch'],
      markdownDescription:
        'The character used to replace spaces when creating a new branch name.\n\n> Example: `my feature` becomes `my-feature`',
    },

    'git.branchValidationRegex': {
      title:            'Branch Name Validation Regex',
      subCategory:      'Branch',
      type:             'string',
      defaultValue:     '',
      order:            43,
      tags:             ['git', 'branch'],
      markdownDescription:
        'A regular expression to validate new branch names.\n\n> Leave empty to disable validation.\n\n**Example:** `^[a-z0-9/_-]+$` allows only lowercase letters, numbers, slashes and dashes.',
    },

    'git.checkoutType': {
      title:            'Checkout Branch Type',
      subCategory:      'Branch',
      type:             'select',
      defaultValue:     'all',
      order:            44,
      tags:             ['git', 'branch', 'checkout'],
      markdownDescription:
        'Controls which types of branches appear in the **Checkout to...** branch picker.',
      enum:             ['all', 'local', 'remote', 'tags'],
      enumItemLabels:   ['All branches & tags', 'Local branches only', 'Remote branches only', 'Tags only'],
    },

    'git.confirmBranchDelete': {
      title:            'Confirm Branch Delete',
      subCategory:      'Branch',
      type:             'boolean',
      defaultValue:     true,
      order:            45,
      tags:             ['git', 'branch'],
      markdownDescription:
        'Show a confirmation dialog before deleting a branch.',
    },

    // ══════════════════════════════════════════════════════════════
    // STASH
    // ══════════════════════════════════════════════════════════════

    'git.stashIncludeUntracked': {
      title:            'Stash Untracked Files',
      subCategory:      'Stash',
      type:             'boolean',
      defaultValue:     true,
      order:            50,
      tags:             ['git', 'stash'],
      markdownDescription:
        'Include untracked files when stashing changes (`git stash --include-untracked`).',
    },

    // ══════════════════════════════════════════════════════════════
    // DECORATIONS
    // ══════════════════════════════════════════════════════════════

    'git.decorations.enabled': {
      title:            'File Decorations',
      subCategory:      'Decorations',
      type:             'boolean',
      defaultValue:     true,
      order:            60,
      tags:             ['git', 'explorer', 'decorations'],
      markdownDescription:
        'Show git status badges (`M`, `U`, `A`, `D`) on files and folders in the Explorer.',
    },

    'git.untrackedChanges': {
      title:            'Untracked Files Position',
      subCategory:      'Decorations',
      type:             'select',
      defaultValue:     'mixed',
      order:            61,
      tags:             ['git', 'decorations'],
      markdownDescription:
        'Controls where untracked files appear in the **Changes** section.',
      enum:             ['mixed', 'separate', 'hidden'],
      enumItemLabels:   ['Mixed with changes', 'Separate section', 'Hidden'],
      enumDescriptions: [
        'Untracked files appear in the same **Changes** list as modified files.',
        'Untracked files appear in their own **Untracked** section.',
        'Untracked files are not shown in the Source Control panel.',
      ],
    },

    'git.countBadge': {
      title:            'Activity Bar Badge',
      subCategory:      'Decorations',
      type:             'select',
      defaultValue:     'all',
      order:            62,
      tags:             ['git', 'decorations', 'badge'],
      markdownDescription:
        'Controls the number shown on the **Source Control** icon in the Activity Bar.',
      enum:             ['all', 'tracked', 'off'],
      enumItemLabels:   ['All changes', 'Tracked changes only', 'Off'],
    },
    
    // ══════════════════════════════════════════════════════════════
    // CHANGES
    // ══════════════════════════════════════════════════════════════

    'git.showPartiallyStaged': {
      title:            'Show Partially Staged Files',
      subCategory:      'Changes',
      type:             'boolean',
      defaultValue:     true,
      order:            55,
      tags:             ['git', 'changes', 'staged'],
      markdownDescription:
        'Show partially staged files in the unstaged changes list.',
    },

    'git.confirmDiscard': {
      title:            'Confirm Discard',
      subCategory:      'Changes',
      type:             'boolean',
      defaultValue:     true,
      order:            56,
      tags:             ['git', 'changes', 'discard'],
      markdownDescription:
        'Show a confirmation dialog before discarding changes in a file.',
    },
    'git.defaultChangesSortOrder': {
      title:            'Default Changes Sort Order',
      subCategory:      'Changes',
      type:             'select',
      defaultValue:     'discovery',
      order:            57,
      tags:             ['git', 'changes', 'sort'],
      markdownDescription:
        'Controls the default sorting order of files in the **Changes** and **Staged Changes** sections.',
      enum:             ['discovery', 'name', 'path', 'status'],
      enumItemLabels:   ['Discovery Time (Default)', 'Name (Alphabetical)', 'File Path', 'Git Status'],
    },

  },
};