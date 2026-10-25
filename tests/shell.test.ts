import { describe, expect, it } from 'vitest';
import { commands, complete, History, run, type ShellData, type Workspace } from '../src/scripts/shell-core';

const data: ShellData = {
  projects: [
    { name: 'bulwark', url: 'https://github.com/adnair2024/bulwark' },
    { name: 'odyssey', url: 'https://odysseybot.net' },
    { name: 'termwerm', url: 'https://github.com/adnair2024/termwerm' },
    { name: 'blamey', url: 'https://github.com/adnair2024/blamey' },
  ],
  posts: [{ date: '2026-09-26', title: 'A quick Neovim Plugin' }],
  securityTxt: 'Contact: mailto:adnair2024@gmail.com',
};

function setup() {
  const visited: Workspace[] = [];
  return { visited, ctx: { data, goto: (w: Workspace) => visited.push(w) } };
}
const out = (input: string, ctx = setup().ctx) => run(input, ctx).lines.map((l) => l.text).join('\n');

describe('commands', () => {
  it('every command listed in help runs without error output', () => {
    const helpNames = ['whoami', 'ls', 'cat', 'cd', 'open', 'neofetch', 'clear'];
    for (const n of helpNames) expect(commands[n]).toBeTypeOf('function');
    for (const input of ['whoami', 'ls', 'ls projects', 'ls blog', 'cat about.txt', 'cd ~', 'open bulwark', 'neofetch', 'clear']) {
      const r = run(input, setup().ctx);
      expect(r.lines.every((l) => l.kind !== 'err'), input).toBe(true);
    }
  });

  it('help is exact', () => {
    expect(out('help')).toContain('  open <project>    bulwark, termwerm, term-manga, blamey, odyssey');
    expect(out('help').startsWith('commands:\n')).toBe(true);
  });

  it('lists projects and blog from data', () => {
    expect(out('ls projects')).toBe('bulwark  odyssey  termwerm  blamey');
    expect(out('ls blog')).toBe('2026-09-26  A quick Neovim Plugin');
    expect(out('ls')).toBe('about.txt  experience.txt  security.txt  projects/  blog/');
  });

  it('unknown commands error', () => {
    const r = run('frobnicate', setup().ctx);
    expect(r.lines[0]).toEqual({ text: 'frobnicate: command not found. try help', kind: 'err' });
  });

  it('does not treat prototype keys as commands', () => {
    expect(out('constructor')).toContain('command not found');
    expect(out('__proto__')).toContain('command not found');
  });

  it('cd switches workspaces silently', () => {
    const { ctx, visited } = setup();
    expect(run('cd projects/', ctx).lines).toEqual([]);
    run('cd blog', ctx);
    run('cd', ctx);
    run('cd ~', ctx);
    expect(visited).toEqual(['projects', 'blog', 'home', 'home']);
    expect(out('cd nowhere')).toBe('cd: no such directory: nowhere');
  });

  it('open prints a link and switches to projects', () => {
    const { ctx, visited } = setup();
    const r = run('open odyssey', ctx);
    expect(r.lines).toEqual([{ text: '→ ', href: 'https://odysseybot.net' }]);
    expect(visited).toEqual(['projects']);
    expect(out('open nope')).toBe('open: unknown project: nope');
  });

  it('cat experience switches to home', () => {
    const { ctx, visited } = setup();
    expect(run('cat experience.txt', ctx).lines[0].text).toBe('systems administrator, neuroscience clinic');
    expect(visited).toEqual(['home']);
    expect(out('cat security.txt')).toContain('Contact: mailto:adnair2024@gmail.com');
    expect(out('cat security.txt')).toContain('# no trackers, strict CSP.');
    expect(out('cat nope')).toBe('cat: nope: no such file');
  });

  it('sudo and clear', () => {
    expect(out('sudo rm -rf /')).toBe('visitor is not in the sudoers file. this incident will be reported.');
    expect(run('clear', setup().ctx).clear).toBe(true);
  });

  it('neofetch matches the spec', () => {
    const lines = out('neofetch').split('\n');
    expect(lines).toHaveLength(8);
    expect(lines[0]).toBe('      /\\        ashwin@arch');
    expect(lines[5]).toBe(' / __|  |__\\\\   langs   go, python, lua');
  });

  it('echoes hostile input as plain text data, never markup', () => {
    const r = run('<img src=x onerror=alert(1)>', setup().ctx);
    expect(r.lines[0].text).toBe('<img: command not found. try help');
  });
});

describe('tab completion', () => {
  it('completes a unique command', () => {
    expect(complete('neo', data)).toEqual({ value: 'neofetch ', options: [] });
  });
  it('lists ambiguous commands', () => {
    const c = complete('c', data);
    expect(c.options).toEqual(['cat', 'cd', 'clear']);
    expect(c.value).toBe('c');
  });
  it('completes arguments', () => {
    expect(complete('open bul', data).value).toBe('open bulwark ');
    expect(complete('cat sec', data).value).toBe('cat security.txt');
    expect(complete('cd pro', data).value).toBe('cd projects ');
    expect(complete('ls b', data).value).toBe('ls blog ');
  });
  it('prints options and extends to the common prefix', () => {
    const c = complete('open b', data);
    expect(c.options).toEqual(['blamey', 'bulwark']);
    expect(c.value).toBe('open b');
    expect(complete('cat ', data).options).toEqual(['about.txt', 'experience.txt', 'security.txt']);
  });
  it('does nothing when nothing matches', () => {
    expect(complete('zzz', data)).toEqual({ value: 'zzz', options: [] });
  });
});

describe('history', () => {
  it('walks up and down, restoring the draft', () => {
    const h = new History();
    h.push('help');
    h.push('ls');
    expect(h.up('dra')).toBe('ls');
    expect(h.up('')).toBe('help');
    expect(h.up('')).toBe('help');
    expect(h.down('')).toBe('ls');
    expect(h.down('')).toBe('dra');
    expect(h.down('x')).toBe('x');
  });
  it('ignores blanks and immediate duplicates', () => {
    const h = new History();
    h.push('ls');
    h.push('ls');
    h.push('  ');
    expect(h.up('')).toBe('ls');
    expect(h.up('')).toBe('ls');
  });
});
