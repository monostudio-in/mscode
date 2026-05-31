// src/features/terminal/core/MockTerminalBackend.ts

export class MockTerminalBackend {
  private cwd: string;
  private buffer: string = '';
  private emit: (data: string) => void;

  constructor(initialCwd: string = '/root', onData: (data: string) => void) {
    this.cwd = initialCwd;
    this.emit = onData;
  }

  public start() {
    this.emit(`\x1b[1;32mMS Code Web Mock Shell\x1b[0m\r\n`);
    this.emit(`Type \x1b[1;33m'help'\x1b[0m to see available commands or \x1b[1;33m'scrolltest'\x1b[0m to test scrolling.\r\n\n`);
    this.prompt();
  }

  public write(data: string) {
    // 1. Handle Enter (Execute command)
    if (data === '\r') {
      this.emit('\r\n');
      this.executeCommand(this.buffer.trim());
      this.buffer = '';
      this.prompt();
    } 
    // 2. Handle Backspace (Delete char visually and from buffer)
    else if (data === '\x7f') {
      if (this.buffer.length > 0) {
        this.buffer = this.buffer.slice(0, -1);
        this.emit('\b \b'); // Move back, space (erase), move back
      }
    } 
    // 3. Handle Ctrl+C (Cancel current line)
    else if (data === '\x03') {
      this.emit('^C\r\n');
      this.buffer = '';
      this.prompt();
    }
    // 4. Handle Normal Typing
    else {
      this.buffer += data;
      this.emit(data); // Echo back to screen
    }
  }

  private prompt() {
    this.emit(`\x1b[1;34mroot@mscode\x1b[0m:\x1b[1;36m${this.cwd}\x1b[0m$ `);
  }

  private executeCommand(cmdLine: string) {
    if (!cmdLine) return;

    const args = cmdLine.split(' ');
    const cmd = args[0].toLowerCase();

    switch (cmd) {
      case 'help':
        this.emit('Available commands: ls, cd, pwd, clear, echo, scrolltest, help\r\n');
        break;
      case 'pwd':
        this.emit(`${this.cwd}\r\n`);
        break;
      case 'ls':
        this.emit('\x1b[1;34msrc\x1b[0m  \x1b[1;34mpublic\x1b[0m  package.json  README.md  index.html\r\n');
        break;
      case 'cd':
        const dir = args[1];
        if (!dir || dir === '~') {
          this.cwd = '/root';
        } else if (dir === '..') {
          const parts = this.cwd.split('/').filter(Boolean);
          parts.pop();
          this.cwd = '/' + parts.join('/');
        } else {
          this.cwd = this.cwd === '/' ? `/${dir}` : `${this.cwd}/${dir}`;
        }
        break;
      case 'echo':
        this.emit(`${args.slice(1).join(' ')}\r\n`);
        break;
      case 'clear':
        // ANSI escape code to clear screen and scrollback
        this.emit('\x1b[2J\x1b[3J\x1b[H');
        break;
      case 'scrolltest':
        this.emit('Generating 100 lines for scroll testing...\r\n');
        for (let i = 1; i <= 100; i++) {
          this.emit(`Line ${i}: This is a dummy line to test terminal scrolling behavior.\r\n`);
        }
        break;
      default:
        this.emit(`bash: ${cmd}: command not found\r\n`);
        break;
    }
  }
}