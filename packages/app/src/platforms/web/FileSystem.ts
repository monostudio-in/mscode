// src/platforms/web/FileSystem.ts
import type { IFileSystem, FileStat } from '@/core/fileSystem/IFileSystem';

// Enhanced Fake Android File System with Rich Nested Structure
const mockStorage: Record<string, FileStat[]> = {
  'ROOT': [],
  
  '/storage/emulated/0': [
    { name: 'Download', path: '/storage/emulated/0/Download', isDirectory: true },
    { name: 'Documents', path: '/storage/emulated/0/Documents', isDirectory: true },
    { name: 'Android', path: '/storage/emulated/0/Android', isDirectory: true },
    { name: 'Pictures', path: '/storage/emulated/0/Pictures', isDirectory: true },
    { name: 'Music', path: '/storage/emulated/0/Music', isDirectory: true },
  ],

  '/storage/emulated/0/Documents': [
    { name: 'MSCodeProjects', path: '/storage/emulated/0/Documents/MSCodeProjects', isDirectory: true },
    { name: 'notes.txt', path: '/storage/emulated/0/Documents/notes.txt', isDirectory: false },
    { name: 'todo.md', path: '/storage/emulated/0/Documents/todo.md', isDirectory: false },
    { name: 'report.pdf', path: '/storage/emulated/0/Documents/report.pdf', isDirectory: false },
  ],

  // ==================== MSCodeProjects (Main Project) ====================
  '/storage/emulated/0/Documents/MSCodeProjects': [
    { name: 'index.html', path: '/storage/emulated/0/Documents/MSCodeProjects/index.html', isDirectory: false },
    { name: 'app.js', path: '/storage/emulated/0/Documents/MSCodeProjects/app.js', isDirectory: false },
    { name: 'style.css', path: '/storage/emulated/0/Documents/MSCodeProjects/style.css', isDirectory: false },
    { name: 'Main.java', path: '/storage/emulated/0/Documents/MSCodeProjects/Main.java', isDirectory: false },
    { name: 'machine.py', path: '/storage/emulated/0/Documents/MSCodeProjects/machine.py', isDirectory: false },
    { name: 'system.c', path: '/storage/emulated/0/Documents/MSCodeProjects/system.c', isDirectory: false },
    { name: 'systemp.cpp', path: '/storage/emulated/0/Documents/MSCodeProjects/systemp.cpp', isDirectory: false },
    { name: 'types.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/types.ts', isDirectory: false },
    { name: 'kino.rs', path: '/storage/emulated/0/Documents/MSCodeProjects/kino.rs', isDirectory: false },
    { name: 'README.md', path: '/storage/emulated/0/Documents/MSCodeProjects/README.md', isDirectory: false },
    { name: 'public', path: '/storage/emulated/0/Documents/MSCodeProjects/public', isDirectory: true },
    { name: 'src', path: '/storage/emulated/0/Documents/MSCodeProjects/src', isDirectory: true },
    { name: 'utils', path: '/storage/emulated/0/Documents/MSCodeProjects/utils', isDirectory: true },
  ],

  '/storage/emulated/0/Documents/MSCodeProjects/public': [
    { name: 'data.json', path: '/storage/emulated/0/Documents/MSCodeProjects/public/data.json', isDirectory: false },
    { name: 'logo.png', path: '/storage/emulated/0/Documents/MSCodeProjects/public/logo.png', isDirectory: false },
  ],

  '/storage/emulated/0/Documents/MSCodeProjects/src': [
    { name: 'components', path: '/storage/emulated/0/Documents/MSCodeProjects/src/components', isDirectory: true },
    { name: 'utils', path: '/storage/emulated/0/Documents/MSCodeProjects/src/utils', isDirectory: true },
    { name: 'modules', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules', isDirectory: true }, // Added Level 1
    { name: 'App.tsx', path: '/storage/emulated/0/Documents/MSCodeProjects/src/App.tsx', isDirectory: false },
  ],

  '/storage/emulated/0/Documents/MSCodeProjects/src/components': [
    { name: 'Header.tsx', path: '/storage/emulated/0/Documents/MSCodeProjects/src/components/Header.tsx', isDirectory: false },
    { name: 'Footer.tsx', path: '/storage/emulated/0/Documents/MSCodeProjects/src/components/Footer.tsx', isDirectory: false },
  ],

  '/storage/emulated/0/Documents/MSCodeProjects/utils': [
    { name: 'helper.py', path: '/storage/emulated/0/Documents/MSCodeProjects/utils/helper.py', isDirectory: false },
    { name: 'maths.js', path: '/storage/emulated/0/Documents/MSCodeProjects/utils/maths.js', isDirectory: false },
  ],

  // ==================== 8-Level Deep Nesting (Inside src/modules) ====================
  // Level 1: modules
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules': [
    { name: 'core', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core', isDirectory: true },
    { name: 'index.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/index.ts', isDirectory: false },
  ],

  // Level 2: core
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core': [
    { name: 'services', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services', isDirectory: true },
    { name: 'core.module.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/core.module.ts', isDirectory: false },
  ],

  // Level 3: services
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services': [
    { name: 'api', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api', isDirectory: true },
    { name: 'logger.service.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/logger.service.ts', isDirectory: false },
  ],

  // Level 4: api
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api': [
    { name: 'v1', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1', isDirectory: true },
    { name: 'api.config.json', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/api.config.json', isDirectory: false },
  ],

  // Level 5: v1
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1': [
    { name: 'handlers', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers', isDirectory: true },
    { name: 'routes.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/routes.ts', isDirectory: false },
  ],

  // Level 6: handlers
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers': [
    { name: 'middlewares', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares', isDirectory: true },
    { name: 'auth.handler.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/auth.handler.ts', isDirectory: false },
    { name: 'user.handler.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/user.handler.ts', isDirectory: false },
  ],

  // Level 7: middlewares
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares': [
    { name: 'helpers', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares/helpers', isDirectory: true },
    { name: 'rateLimiter.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares/rateLimiter.ts', isDirectory: false },
  ],

  // Level 8: helpers
  '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares/helpers': [
    { name: 'tokenValidator.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares/helpers/tokenValidator.ts', isDirectory: false },
    { name: 'passwordHasher.ts', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares/helpers/passwordHasher.ts', isDirectory: false },
    { name: 'constants.json', path: '/storage/emulated/0/Documents/MSCodeProjects/src/modules/core/services/api/v1/handlers/middlewares/helpers/constants.json', isDirectory: false },
  ],

  // ==================== Termux Home ====================
  '/data/data/com.termux/files/home': [
    { name: 'my-project', path: '/data/data/com.termux/files/home/my-project', isDirectory: true },
    { name: '.bashrc', path: '/data/data/com.termux/files/home/.bashrc', isDirectory: false },
    { name: 'setup.sh', path: '/data/data/com.termux/files/home/setup.sh', isDirectory: false },
  ],

  '/data/data/com.termux/files/home/my-project': [
    { name: 'server.py', path: '/data/data/com.termux/files/home/my-project/server.py', isDirectory: false },
    { name: 'README.md', path: '/data/data/com.termux/files/home/my-project/README.md', isDirectory: false },
  ],
};


const mockFileContents: Record<string, string> = {
  '/storage/emulated/0/Documents/MSCodeProjects/index.html': 
`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MS Code - Modern IDE</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>MS Code Projects</h1>
    </header>
    <main>
        <h2>Welcome to the Multi-Language Editor</h2>
        <p>This is a demo project with multiple language support.</p>
    </main>
    <script src="app.js"></script>
</body>
</html>`,

  '/storage/emulated/0/Documents/MSCodeProjects/app.js': 
`// app.js - ~80 lines simulation
console.log("MS Code Editor Started");

class Editor {
    constructor() {
        this.files = [];
        this.currentFile = null;
    }

    openFile(path) {
        console.log(\`Opening file: \${path}\`);
        this.currentFile = path;
    }

    saveFile(content) {
        console.log("File saved successfully");
        return true;
    }

    // More methods...
    formatCode() {
        console.log("Code formatted using Prettier");
    }
}

const editor = new Editor();
editor.openFile("Main.java");

// Additional utility functions
function debounce(func, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), delay);
    };
}

for(let i = 0; i < 50; i++) {
    console.log(\`Line \${i + 1} of demo code\`);
}

// ... (imagine 60+ more lines of real editor logic)
`,

  '/storage/emulated/0/Documents/MSCodeProjects/Main.java': 
`// Main.java - ~80 lines of Java code
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from MS Code Java Compiler!");
        
        for(int i = 0; i < 30; i++) {
            System.out.println("Iteration: " + i);
        }
        
        Calculator calc = new Calculator();
        System.out.println("Sum: " + calc.add(45, 55));
    }
}

class Calculator {
    public int add(int a, int b) {
        return a + b;
    }
    
    public int multiply(int a, int b) {
        return a * b;
    }
    
    // More methods...
    public double power(double base, int exp) {
        return Math.pow(base, exp);
    }
}

// Additional classes and utilities would continue here...
`,

  '/storage/emulated/0/Documents/MSCodeProjects/machine.py': 
`# machine.py - ~80 lines Python ML demo
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

print("MS Code Python Environment")

class NeuralNetwork:
    def __init__(self):
        self.weights = np.random.randn(10, 5)
        print("Neural Network initialized")
    
    def forward(self, x):
        return np.dot(x, self.weights)
    
    def train(self, epochs=100):
        for epoch in range(epochs):
            if epoch % 20 == 0:
                print(f"Epoch {epoch} completed")

nn = NeuralNetwork()
nn.train(80)

# More code...
for i in range(60):
    print(f"Processing batch {i}")
`,

  '/storage/emulated/0/Documents/MSCodeProjects/system.c': 
`// system.c - C language demo
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("MS Code C Compiler\\n");
    
    for(int i = 0; i < 40; i++) {
        printf("Memory block %d allocated\\n", i);
    }
    
    // More system level code
    return 0;
}
`,

  '/storage/emulated/0/Documents/MSCodeProjects/README.md': 
`# MS Code Projects

A powerful multi-language code editor.

## Features
- Java, Python, C/C++, TypeScript, Rust support
- Built-in terminal
- File system explorer
- Syntax highlighting

## Current Files
- \`Main.java\`
- \`machine.py\`
- \`app.js\`
- etc.

**Total files simulated: 25+**
`,

  // Add more ..
  '/storage/emulated/0/Documents/notes.txt': "This is a sample text file from MS Code.",
  '/storage/emulated/0/Documents/todo.md': "# TODO\n\n- Add more languages\n- Improve performance",
};

export class WebFileSystem implements IFileSystem {
  async readDir(path: string): Promise<FileStat[]> {
    console.log(`[Mock FS] Reading Directory: ${path}`);
    return mockStorage[path] || [];
  }

  async readFile(path: string): Promise<string> {
    console.log(`[Mock FS] Reading File: ${path}`);
    return mockFileContents[path] || `// File: ${path}\n// Content not available in mock yet.`;
  }

  async writeFile(path: string, _content: string): Promise<void> {
    console.log(`[Mock FS] Writing File: ${path}`);
    // In real implementation, you would update mockFileContents here
  }

  async mkdir(path: string): Promise<void> {
    console.log(`[Mock FS] Creating Folder: ${path}`);
  }

  async delete(path: string): Promise<void> {
    console.log(`[Mock FS] Deleting: ${path}`);
  }

  async rename(oldPath: string, newPath: string): Promise<void> {
    console.log(`[Mock FS] Renaming ${oldPath} to ${newPath}`);
  }
}