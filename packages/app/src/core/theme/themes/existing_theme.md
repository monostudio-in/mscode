// existing themes 
uiColors: {
    // Backgrounds
    'ms-bg-main':         '#1e1e1e',
    'ms-bg-side':         '#252526',
    'ms-bg-activity':     '#333333',
    'ms-activity-hover':  '#444444',
    'ms-tab-inactive-bg': '#2d2d2d',
    'ms-tab-active-bg':   '#1e1e1e',

    // Text
    'ms-text-main':   '#cccccc',
    'ms-text-faded':  '#858585',
    'ms-text-bright': '#ffffff',

    // Borders
    'ms-border-light': '#393a42',
    'ms-border-dark':  '#595c64',
    'ms-menu-border':  '#454545',
    'ms-separator':    '#454545',

    // Interactive
    'ms-accent':        '#007acc',
    'ms-icon-hover-bg': '#333333',
    'ms-menu-hover-bg': '#04395e',
    'ms-shadow':        'rgba(0, 0, 0, 0.36)',

    // Settings & Forms
    'ms-settings-bg':             '#1e1e1e',
    'ms-settings-category-color': '#888888',
    'ms-settings-title-color':    '#cccccc',
    'ms-settings-desc-color':     '#999999',
    'ms-settings-link-color':     '#3794ff',
    'ms-input-bg':                '#3c3c3c',
    'ms-input-fg':                '#cccccc',
    'ms-input-border':            '#3c3c3c',
    'ms-input-focus-border':      '#007fd4',
    'ms-code-bg':                 'rgba(255, 255, 255, 0.1)',
    'ms-code-fg':                 '#ce9178',
  },
  
  
  
  // target theme 
  uiColors: {

    // ── A1  Backgrounds ────────────────────────────────────────────────────
    'ms-bg-main':           '#1e1e1e',   // editor + main content area
    'ms-bg-side':           '#252526',   // sidebar, panels, suggest widget
    'ms-bg-activity':       '#333333',   // activity bar background
    'ms-bg-overlay':        '#252526',   // modals, context menus, dropdowns
    'ms-bg-floating':       '#1e1e1e',   // hover cards, tooltips, peek view
    'ms-bg-input':          '#3c3c3c',   // text inputs, selects, checkboxes
    'ms-bg-highlight':      '#2a2d2e',   // active line, hovered list row
    'ms-bg-selection':      '#264f78',   // active text selection
    'ms-bg-selection-inactive': '#3a3d41', // selection when editor is unfocused

    // ── A2  Text ───────────────────────────────────────────────────────────
    'ms-text-main':         '#cccccc',   // default body text
    'ms-text-faded':        '#858585',   // placeholders, secondary labels
    'ms-text-bright':       '#ffffff',   // headings, active tab title
    'ms-text-disabled':     '#5a5a5a',   // disabled controls
    'ms-text-link':         '#3794ff',   // hyperlinks, clickable descriptions
    'ms-text-error':        '#f48771',   // error messages inline
    'ms-text-warning':      '#cca700',   // warning messages inline
    'ms-text-info':         '#75beff',   // info messages inline

    // ── A3  Borders & Dividers ─────────────────────────────────────────────
    'ms-border-light':      '#393a42',   // subtle borders (panels, sidebar)
    'ms-border-dark':       '#595c64',   // stronger borders (focused inputs)
    'ms-menu-border':       '#454545',   // context-menu and dropdown borders
    'ms-separator':         '#454545',   // horizontal rule / divider lines
    'ms-focus-border':      '#007fd4',   // keyboard-focus ring on controls

    // ── A4  Interactive / Accent ───────────────────────────────────────────
    'ms-accent':            '#007acc',   // primary brand color (buttons, tabs)
    'ms-accent-hover':      '#1a8bcc',   // accent on hover
    'ms-shadow':            'rgba(0,0,0,0.36)', // drop shadows
    'ms-icon-hover-bg':     '#333333',   // icon button hover background
    'ms-menu-hover-bg':     '#04395e',   // hovered item in menus / suggest

    // ── A5  Tabs ───────────────────────────────────────────────────────────
    'ms-tab-active-bg':     '#1e1e1e',   // active (foreground) tab
    'ms-tab-inactive-bg':   '#2d2d2d',   // background tabs
    'ms-tab-hover-bg':      '#252526',   // tab on pointer hover
    'ms-tab-active-border': '#007acc',   // top border of the active tab
    'ms-tab-dirty-dot':     '#e7c27d',   // unsaved-changes indicator dot

    // ── A6  Activity Bar ───────────────────────────────────────────────────
    'ms-activity-hover':    '#444444',   // icon hover background
    'ms-activity-active':   '#ffffff',   // active view icon color
    'ms-activity-inactive': '#858585',   // inactive view icon color
    'ms-activity-badge-bg': '#007acc',   // notification badge on activity icons
    'ms-activity-badge-fg': '#ffffff',   // text inside the badge

    // ── A7  Status Bar ─────────────────────────────────────────────────────
    'ms-statusbar-bg':         '#007acc', // default status bar background
    'ms-statusbar-fg':         '#ffffff', // status bar text / icons
    'ms-statusbar-hover-bg':   '#1a8bcc', // status bar item on hover
    'ms-statusbar-error-bg':   '#c72e0f', // background when errors exist
    'ms-statusbar-warning-bg': '#856404', // background when warnings exist
    'ms-statusbar-no-folder':  '#68217a', // background when no workspace is open

    // ── A8  Breadcrumb ─────────────────────────────────────────────────────
    'ms-breadcrumb-fg':         '#cccccc', // breadcrumb path text
    'ms-breadcrumb-hover-fg':   '#e0e0e0', // breadcrumb segment on hover
    'ms-breadcrumb-active-fg':  '#ffffff', // current (last) breadcrumb segment
    'ms-breadcrumb-bg':         '#1e1e1e', // breadcrumb bar background

    // ── A9  Panels & Terminal ──────────────────────────────────────────────
    'ms-panel-bg':              '#1e1e1e', // Termis / output panel background
    'ms-panel-border':          '#393a42', // panel top border
    'ms-panel-tab-active-fg':   '#e0e0e0', // active panel tab label
    'ms-panel-tab-inactive-fg': '#858585', // inactive panel tab label
    'ms-terminal-bg':           '#1e1e1e', // terminal canvas background
    'ms-terminal-fg':           '#cccccc', // terminal default text color
    'ms-terminal-cursor':       '#aeafad', // terminal cursor color
    'ms-terminal-selection-bg': '#264f78', // terminal text selection

    // ── A10  Notifications & Badges ────────────────────────────────────────
    'ms-notif-bg':          '#252526',   // notification toast background
    'ms-notif-border':      '#454545',   // notification border
    'ms-notif-info-icon':   '#75beff',   // ℹ icon color
    'ms-notif-warn-icon':   '#cca700',   // ⚠ icon color
    'ms-notif-error-icon':  '#f48771',   // ✖ icon color
    'ms-badge-bg':          '#007acc',   // generic pill/badge background
    'ms-badge-fg':          '#ffffff',   // generic pill/badge text

    // ── A11  List & Tree ───────────────────────────────────────────────────
    'ms-list-hover-bg':         '#2a2d2e', // row on pointer hover
    'ms-list-active-bg':        '#04395e', // selected row (focused list)
    'ms-list-inactive-bg':      '#37373d', // selected row (unfocused list)
    'ms-list-drop-bg':          '#062f4a', // drag-and-drop insertion highlight
    'ms-tree-indent-guide':     '#404040', // vertical indent guide lines
    'ms-tree-indent-guide-active': '#707070', // active indent guide

    // ── A12  Input / Form Controls ─────────────────────────────────────────
    'ms-input-bg':              '#3c3c3c', // text input background
    'ms-input-fg':              '#cccccc', // text input foreground
    'ms-input-border':          '#3c3c3c', // text input border (unfocused)
    'ms-input-focus-border':    '#007fd4', // text input border (focused)
    'ms-input-placeholder':     '#858585', // placeholder text
    'ms-checkbox-bg':           '#3c3c3c', // checkbox fill
    'ms-checkbox-border':       '#6b6b6b', // checkbox border
    'ms-checkbox-checked-bg':   '#007acc', // checkbox fill when checked
    'ms-dropdown-bg':           '#3c3c3c', // select / dropdown background
    'ms-dropdown-border':       '#3c3c3c', // select / dropdown border
    'ms-button-primary-bg':     '#0e639c', // primary action button background
    'ms-button-primary-fg':     '#ffffff', // primary action button text
    'ms-button-primary-hover':  '#1177bb', // primary button on hover
    'ms-button-secondary-bg':   '#313131', // secondary/ghost button background
    'ms-button-secondary-fg':   '#cccccc', // secondary button text
    'ms-button-secondary-hover':'#3c3c3c', // secondary button on hover

    // ── A13  Settings Page ─────────────────────────────────────────────────
    'ms-settings-bg':             '#1e1e1e', // settings page background
    'ms-settings-category-color': '#888888', // left-nav section header
    'ms-settings-title-color':    '#cccccc', // setting item title
    'ms-settings-desc-color':     '#999999', // setting item description
    'ms-settings-link-color':     '#3794ff', // "Learn more" links
    'ms-code-bg':                 'rgba(255,255,255,0.1)', // inline code chip background
    'ms-code-fg':                 '#ce9178', // inline code chip text

    // ── A14  Diff Editor ───────────────────────────────────────────────────
    'ms-diff-insert-bg':        'rgba(40,93,64,0.3)',  // added line background
    'ms-diff-insert-border':    'rgba(40,93,64,0.8)',  // added line gutter bar
    'ms-diff-remove-bg':        'rgba(139,46,46,0.3)', // removed line background
    'ms-diff-remove-border':    'rgba(139,46,46,0.8)', // removed line gutter bar
    'ms-diff-word-insert':      'rgba(40,93,64,0.6)',  // added word within a line
    'ms-diff-word-remove':      'rgba(139,46,46,0.6)', // removed word within a line

    // ── A15  Inline Hints & Decorations ───────────────────────────────────
    'ms-hint-fg':               '#888888', // inlay hint text (type hints, param names)
    'ms-hint-bg':               'rgba(88,88,88,0.18)', // inlay hint background chip
    'ms-minimap-slider':        'rgba(121,121,121,0.4)', // minimap viewport slider
    'ms-scrollbar-slider':      'rgba(121,121,121,0.4)', // editor scrollbar thumb
    'ms-scrollbar-hover':       'rgba(100,100,100,0.7)', // scrollbar thumb on hover
    'ms-progressbar-bg':        '#007acc', // progress bar fill (file indexing etc.)
  },