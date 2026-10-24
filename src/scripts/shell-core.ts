// Pure shell logic: no DOM access, so it can be unit tested.

export type Workspace = 'home' | 'projects' | 'blog';

export interface ShellData {
  projects: { name: string; url: string }[];
  posts: { date: string; title: string }[];
  securityTxt: string;
}

export interface Line {
  text: string;
  kind?: 'cmd' | 'muted' | 'err';
  href?: string;
}

export interface Result {
  lines: Line[];
  clear?: boolean;
}

export interface Ctx {
  data: ShellData;
  goto(ws: Workspace): void;
}

type Handler = (args: string[], ctx: Ctx) => Result;

const plain = (text: string, kind?: Line['kind']): Result => ({
  lines: text.split('\n').map((t) => ({ text: t, kind })),
});
const err = (text: string) => plain(text, 'err');
const none: Result = { lines: [] };
const trimSlash = (s: string) => (s.length > 1 ? s.replace(/\/+$/, '') : s);

const FILES = ['about.txt', 'experience.txt', 'security.txt'];
const DIRS = ['projects', 'blog'];

const HELP = `commands:
  whoami            who is this
  ls                list files
  ls projects       list projects
  ls blog           list blog posts
  cat <file>        about.txt, experience.txt, security.txt
  cd <dir>          ~, projects, blog
  open <project>    bulwark, termwerm, term-manga, blamey, odyssey
  neofetch          system info
  clear             clear the screen`;

const NEOFETCH = `      /\\        ashwin@arch
     /  \\       -----------
    /\\   \\      os      arch linux
   /  __  \\     wm      hyprland
  /  (  )  \\    editor  neovim
 / __|  |__\\\\   langs   go, python, lua
/.\`        \`.\\  job     sysadmin, healthcare
                site    strict csp, no trackers`;

const ABOUT = `sysadmin in healthcare IT, moving into security.
I build small, fast linux tools in go, and an RPG bot for discord.`;

const EXPERIENCE = `systems administrator, neuroscience clinic
athenaPractice EHR, HIPAA-regulated environment
B.S. computer information systems, loyola new orleans, cum laude`;

const SECURITY_NOTE = `# found something? tell me. no third-party scripts,
# no trackers, strict CSP. same file lives at /.well-known/`;

export const commands: Record<string, Handler> = {
  help: () => plain(HELP),
  whoami: () => plain('Ashwin Nair. sysadmin in healthcare IT, building security tools in go.'),
  neofetch: () => plain(NEOFETCH),
  clear: () => ({ lines: [], clear: true }),

  ls: ([arg], { data }) => {
    if (!arg) return plain('about.txt  experience.txt  security.txt  projects/  blog/');
    const target = trimSlash(arg);
    if (target === 'projects') return plain(data.projects.map((p) => p.name).join('  '));
    if (target === 'blog') {
      return data.posts.length
        ? plain(data.posts.map((p) => `${p.date}  ${p.title}`).join('\n'))
        : plain('(empty)', 'muted');
    }
    return err(`ls: cannot access '${arg}': no such file or directory`);
  },

  cat: ([arg], { data, goto }) => {
    if (!arg) return err('cat: missing file. try: cat about.txt');
    if (arg === 'about.txt') return plain(ABOUT);
    if (arg === 'experience.txt') {
      goto('home');
      return plain(EXPERIENCE);
    }
    if (arg === 'security.txt') return plain(`${data.securityTxt}\n\n${SECURITY_NOTE}`);
    return err(`cat: ${arg}: no such file`);
  },

  cd: ([arg], { goto }) => {
    const target = arg === undefined ? '~' : trimSlash(arg);
    if (target === '~') goto('home');
    else if (target === 'projects') goto('projects');
    else if (target === 'blog') goto('blog');
    else return err(`cd: no such directory: ${arg}`);
    return none;
  },

  open: ([arg], { data, goto }) => {
    const project = data.projects.find((p) => p.name === arg);
    if (!project) return err(`open: unknown project: ${arg ?? ''}`.trimEnd());
    goto('projects');
    return { lines: [{ text: '→ ', href: project.url }] };
  },

  sudo: () => err('visitor is not in the sudoers file. this incident will be reported.'),

  // easter egg, intentionally absent from `help`
  rm: () => err('rm: nice try.'),
};

export function run(input: string, ctx: Ctx): Result {
  const words = input.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return none;
  const [name, ...args] = words;
  const handler = Object.hasOwn(commands, name.toLowerCase()) ? commands[name.toLowerCase()] : undefined;
  if (!handler) return err(`${name}: command not found. try help`);
  return handler(args, ctx);
}

// ---- tab completion ----

export interface Completion {
  value: string; // new input value
  options: string[]; // printed when ambiguous
}

function commonPrefix(items: string[]): string {
  return items.reduce((a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  });
}

function argCandidates(cmd: string, data: ShellData): string[] {
  switch (cmd) {
    case 'ls':
      return DIRS;
    case 'cat':
      return FILES;
    case 'cd':
      return ['~', ...DIRS];
    case 'open':
      return data.projects.map((p) => p.name);
    default:
      return [];
  }
}

export function complete(input: string, data: ShellData): Completion {
  const trailing = /\s$/.test(input);
  const words = input.trimStart().split(/\s+/).filter(Boolean);
  const done: Completion = { value: input, options: [] };

  let candidates: string[];
  let prefix: string;
  let head: string;

  if (words.length === 0 || (words.length === 1 && !trailing)) {
    prefix = words[0] ?? '';
    head = '';
    candidates = Object.keys(commands);
  } else {
    const cmd = words[0].toLowerCase();
    prefix = trailing ? '' : words[words.length - 1];
    head = (trailing ? words : words.slice(0, -1)).join(' ') + ' ';
    if (words.length - (trailing ? 0 : 1) !== 1) return done; // only the first argument completes
    candidates = argCandidates(cmd, data);
  }

  const bare = prefix.replace(/\/$/, '');
  const matches = candidates.filter((c) => c.startsWith(bare)).sort((a, b) => a.localeCompare(b));
  if (matches.length === 0) return done;
  if (matches.length === 1) {
    const only = matches[0];
    const isFirst = head === '';
    return { value: head + only + (isFirst || !only.endsWith('.txt') ? ' ' : ''), options: [] };
  }
  const common = commonPrefix(matches);
  return { value: head + common, options: matches };
}

// ---- history ----

export class History {
  private items: string[] = [];
  private pos = 0; // === items.length means "fresh input"
  private draft = '';

  push(entry: string) {
    if (entry.trim() && this.items[this.items.length - 1] !== entry) this.items.push(entry);
    this.pos = this.items.length;
    this.draft = '';
  }

  up(current: string): string {
    if (this.items.length === 0) return current;
    if (this.pos === this.items.length) this.draft = current;
    this.pos = Math.max(0, this.pos - 1);
    return this.items[this.pos];
  }

  down(current: string): string {
    if (this.pos >= this.items.length) return current;
    this.pos++;
    return this.pos === this.items.length ? this.draft : this.items[this.pos];
  }
}
