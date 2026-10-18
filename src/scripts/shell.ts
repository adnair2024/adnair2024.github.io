import { complete, History, run, type ShellData, type Ctx } from './shell-core';
import { goto, setFocused } from './workspaces';

const MAX_LINES = 60;
const NEAR_EMPTY = 3;

export function initShell() {
  const root = document.getElementById('shell');
  const log = document.getElementById('shell-log');
  const input = document.getElementById('shell-input') as HTMLInputElement | null;
  const chips = document.getElementById('shell-chips');
  if (!root || !log || !input || !chips) return;

  let data: ShellData;
  try {
    data = JSON.parse(root.dataset.shell ?? '');
  } catch {
    return;
  }

  const history = new History();
  const ctx: Ctx = { data, goto };

  function trim() {
    while (log!.children.length > MAX_LINES) log!.firstElementChild?.remove();
    chips!.hidden = log!.children.length > NEAR_EMPTY;
  }

  // All text goes in via textContent: nothing the visitor types is ever parsed as HTML.
  function addLine(text: string, kind?: string, href?: string) {
    const div = document.createElement('div');
    if (kind) div.className = `l-${kind}`;
    div.textContent = text;
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = href;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      div.append(a);
    }
    log!.append(div);
  }

  function finish() {
    trim();
    log!.scrollTop = log!.scrollHeight;
  }

  function exec(raw: string) {
    addLine(`$ ${raw}`, 'cmd');
    history.push(raw);
    const result = run(raw, ctx);
    if (result.clear) log!.replaceChildren();
    for (const l of result.lines) addLine(l.text, l.kind, l.href);
    finish();
  }

  addLine('welcome to ashwin@arch.', 'muted');
  addLine('type help to look around.', 'muted');
  finish();

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      exec(input.value);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      input.value = history.up(input.value);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      input.value = history.down(input.value);
    } else if (e.key === 'Tab' && !e.shiftKey && input.value.trim() !== '') {
      const c = complete(input.value, data);
      if (c.value === input.value && c.options.length === 0) return; // nothing to complete: let focus move on
      e.preventDefault();
      if (c.options.length > 0) {
        addLine(`$ ${input.value}`, 'cmd');
        addLine(c.options.join('  '));
        finish();
      }
      input.value = c.value;
    }
  });

  chips.querySelectorAll<HTMLButtonElement>('[data-cmd]').forEach((b) =>
    b.addEventListener('click', () => {
      exec(b.dataset.cmd ?? '');
      input.focus();
      setFocused(root);
    }),
  );
}
