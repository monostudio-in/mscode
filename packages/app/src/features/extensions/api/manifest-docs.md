
{
  "id": "openai-chat",
  "name": "Mono AI Chat GPT",
  "publisher": "monostudio",
  "version": "1.0.0",
  "description": "Advanced AI coding companion that brings GPT-4o intelligence directly inside Mono Studio context loops for automated explanations, bug fixing, and predictive text refactoring.",
  "category": "Other",
  "tags": ["ai", "copilot", "gpt-4o", "code-generator", "refactor"],
  "icon": "assets/icon.png",
  "iconColor": "#10a37f",
  "iconLetter": "A",
  "main": "out/extension.js",
  "activates": [
    "onLanguage:javascript",
    "onLanguage:typescript",
    "onLanguage:python",
    "onCommand:openai-chat.focusPanel"
  ],
  "readme": "README.md",
  "changelog": "CHANGELOG.md",
  "license": "LICENSE",

  "contributes": {
    
    // ── 1. AI ENVIRONMENT CONFIGURATIONS ──
    "configuration": {
      "monoAI.api.key": {
        "type": "string",
        "default": "",
        "description": "Your OpenAI / DeepSeek secret API Key used to authenticate completion telemetry tokens."
      },
      "monoAI.model.selection": {
        "type": "string",
        "default": "gpt-4o",
        "description": "Target LLM reasoning engine optimized for code execution context paths.",
        "enum": ["gpt-4o", "o1-preview", "gpt-4-turbo", "deepseek-coder"]
      },
      "monoAI.completion.temperature": {
        "type": "number",
        "default": 0.3,
        "description": "Controls model creativity constraints. Lower values (e.g., 0.2) are safer for strict mathematical and factual code generation."
      },
      "monoAI.context.includeGitStatus": {
        "type": "boolean",
        "default": true,
        "description": "Automatically append your current staged git changes metadata into the AI system prompt map to yield better context awareness."
      }
    },

    // ── 2. AI SPECIALIZED WORKBENCH THEMES ──
    "themes": [
      {
        "label": "Mono AI Matrix Matrix Dark",
        "uiTheme": "vs-dark",
        "path": "./themes/matrix-dark.json"
      }
    ],

    // ── 3. AI OPERATIONAL ICON PACK METADATA ──
    "iconThemes": [
      {
        "id": "mono-ai-neural-icons",
        "label": "Mono AI Neural Micro Icons",
        "path": "./icons/neural-theme.json"
      }
    ],

    // ── 4. AI BOOTSTRAP SHORTCUT SNIPPETS ──
    "snippets": [
      {
        "language": "javascript",
        "path": "./snippets/ai-prompts.json"
      },
      {
        "language": "typescript",
        "path": "./snippets/ai-prompts.json"
      }
    ],

    // ── 5. AI TOOLBAR INTERFACE ON ACTIVITY BAR ──
    "activityBar": [
      {
        "id": "mono-ai-assistant-sidebar",
        "title": "AI Copilot Workspace",
        "icon": "sparkle",
        "position": "top",
        "priority": 90
      }
    ],

    // ── 6. DYNAMIC COGNITIVE KEYBINDINGS ──
    "keybindings": [
      {
        "command": "openai-chat.inlineSuggest",
        "key": "ctrl+shift+a",
        "mac": "cmd+shift+a",
        "when": "editorTextFocus"
      },
      {
        "command": "openai-chat.explainCodeSelection",
        "key": "ctrl+k ctrl+e",
        "when": "editorHasSelection == true"
      },
      {
        "command": "openai-chat.optimizePerformance",
        "key": "ctrl+k ctrl+o",
        "when": "editorHasSelection == true"
      }
    ],

    // ── 7. AI DECLARATIVE CONTEXT MENUS ──
    "menus": {
      
      // Use-Case 1: Main Code Editor Right-Click (Triggers only when code block is selected)
      "editor/context": [
        {
          "command": "openai-chat.explainCodeSelection",
          "label": "Mono AI: Explain Selected Code Block",
          "icon": "sparkle",
          "when": "editorHasSelection == true",
          "order": 1
        },
        {
          "command": "openai-chat.optimizePerformance",
          "label": "Mono AI: Refactor for Time Complexity (O)",
          "icon": "zap",
          "when": "editorHasSelection == true",
          "order": 2
        },
        {
          "command": "openai-chat.generateUnitTests",
          "label": "Mono AI: Generate Jest / PyTest Suites",
          "icon": "check-all",
          "when": "editorHasSelection == true",
          "order": 3
        }
      ],

      // Use-Case 2: Tab Bar Right-Click (Global context mapping for the entire file)
      "editor/title/context": [
        {
          "command": "openai-chat.documentFile",
          "label": "Mono AI: Write Documentations & JSDocs",
          "icon": "book",
          "order": 1
        },
        {
          "command": "openai-chat.findSecurityVulnerabilities",
          "label": "Mono AI: Scan for Code Leaks & Security Flaws",
          "icon": "shield",
          "order": 2
        }
      ],

      // Use-Case 3: File Explorer Sidebar (Right-clicking on folder nodes)
      "sidebar/files/context": [
        {
          "command": "openai-chat.analyzeArchitecture",
          "label": "Mono AI: Analyze Subdirectory Architecture",
          "icon": "project",
          "when": "workspacePath != null",
          "order": 15
        }
      ]
    }
  }
}