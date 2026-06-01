<div align="center">
  <img src="https://i.postimg.cc/C57jC684/monostudio-logo.png" alt="Mono Studio Logo" width="128">
  <h1>Mono Studio</h1>
  <p>A next-generation mobile IDE and powerful extension ecosystem.</p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
  [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/monostudio-org/mscode/pulls)
  [![Platform: Web | Android](https://img.shields.io/badge/Platform-Web%20%7C%20Android-lightgrey.svg)](#)
</div>

---

## Overview

Mono Studio is an advanced, cross-platform code editor designed to bring desktop-grade development capabilities to mobile and web environments. Built with a highly modular architecture, it features a robust extension ecosystem, integrated Git version control, Language Server Protocol (LSP) support, and a comprehensive terminal environment.

## Mono Studio (MS Code) — Features & Docs Overview

[🌐 Check Website](https://monostudio-code.vercel.app)


## Key Features

Based on a strictly typed, modular architecture, Mono Studio offers the following core capabilities:

* **Advanced Editor (Monaco-based):** 
  * Full-featured code editor with syntax highlighting and auto-completion.
  * Mobile-first touch interactions (Teardrops, Touch Scroll, Touch Interceptors).
  * Diff Editor, Breadcrumbs, Minimap, and Sticky Highlights.
  * Auto-save and background backup state management.
* **Integrated Explorer:**
  * File tree with inline input and empty workspace handling.
  * Workspace symbol navigation and generic tree view capabilities.
* **Extension Ecosystem:**
  * Dedicated Extension Host and API runtime.
  * In-app Marketplace for searching, installing, and managing `.msxt` extensions.
  * Support for dynamic contributions and custom runtime configurations.
* **Version Control (Git):**
  * Built-in Git backend with branch management and remote synchronization.
  * Commit history tracking, changed file viewing, and Git status indicators.
* **Language Server Protocol (LSP):**
  * Built-in process managers for multiple language servers.
  * First-class support for C/C++, Python, HTML, CSS, JSON, and JS/TS.
* **Termis (Terminal & Output):**
  * Integrated Terminal using Xterm.js with ANSI parsing.
  * Output panels, problem matchers, and automated task execution.
* **Cross-Platform Core:**
  * Platform-agnostic interfaces for File Systems and Search Engines.
  * Native implementations for both Android and Web environments.
* **Customization:**
  * Comprehensive settings UI with schema validation.
  * Configurable keybindings and a dynamic status bar.

## Architecture

The codebase is organized into distinct, decoupled domains to ensure maintainability and scalability. State management is handled globally across the application.

* `/features` - Contains all core IDE functionalities (Editor, Git, Terminal, LSP, etc.).
* `/platforms` - Environment-specific abstractions (Android, Web).
* `/store` - Centralized state management for layout, navigation, themes, and global events.

## Getting Started

### Prerequisites

Ensure you have the following installed on your local development machine:
* Node.js (v18 or higher recommended)
* npm or yarn

### Installation

1. Clone the repository:
```bash
   git clone [https://github.com/monostudio-org/mscode.git](https://github.com/monostudio-org/mscode.git)
   cd mscode

```

2. Install dependencies:

```bash
   npm install

```

3. Environment Configuration:
The application requires Supabase credentials to handle authentication and backend services. Navigate to the app package and set up your environment variables:

```bash
   cd packages/app
   mv .env.example .env

```

Open the newly created `.env` file. You can either use the provided test credentials for local UI testing and open-source contributions, or insert your own from [Supabase](https://supabase.com/):

```env
   # Default test keys for open-source contributors
   VITE_SUPABASE_URL=[https://test-project-id.supabase.co](https://test-project-id.supabase.co)
   VITE_SUPABASE_ANON_KEY=test-anon-key-provided-for-contributors

```

4. Start the development server:

```bash
   npm run dev

```

## Contributing

Mono Studio is an open-source project, and we welcome contributions from the community. Whether you are fixing a bug, adding a new feature, or improving documentation, your help is appreciated.

### Submitting a Bug Report or Feature Request

If you find a bug or have an idea for a new feature, please use our issue tracker:

1. Navigate to the **Issues** tab in this repository.
2. Search existing issues to avoid duplicates.
3. Click **New Issue** and select the appropriate template (Bug Report or Feature Request).
4. Provide as much context as possible, including steps to reproduce, expected behavior, and environment details.

### Pull Request Process

1. Fork the repository and create your feature branch: `git checkout -b feature/my-new-feature`
2. Commit your changes logically and with clear commit messages.
3. Push to your branch: `git push origin feature/my-new-feature`
4. Submit a Pull Request against the `main` branch.
5. Ensure your code follows the existing style guidelines and passes all checks.

## License

This project is proprietary. All rights are reserved by Mono Studio. 
Commercial use, modification, distribution, or publishing of this software (including but not limited to app stores) is strictly prohibited without explicit written permission.

See the `LICENSE.txt` file for complete details.