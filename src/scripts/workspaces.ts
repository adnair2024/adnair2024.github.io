import type { Workspace } from './shell-core';

const ORDER: Workspace[] = ['home', 'projects', 'blog'];
const LABEL: Record<Workspace, string> = { home: 'Home', projects: 'Projects', blog: 'Blog' };

let current: Workspace = 'home';
let announce: HTMLElement | null = null;

function fromHash(): Workspace {
  const h = location.hash.slice(1);
  return (ORDER as string[]).includes(h) ? (h as Workspace) : 'home';
}

export function setFocused(win: Element | null | undefined) {
  if (!win) return;
  document.querySelectorAll('.win.is-focused').forEach((w) => w.classList.remove('is-focused'));
  win.classList.add('is-focused');
}

function reducedMotion() {
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function show(ws: Workspace, opts: { animate: boolean }) {
  const prev = current;
  current = ws;
  document.documentElement.dataset.ws = ws;

  document.querySelectorAll<HTMLElement>('#ws-nav [data-ws]').forEach((b) => {
    if (b.dataset.ws === ws) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });

  const panel = document.getElementById(ws);
  if (panel && opts.animate && ws !== prev && !reducedMotion()) {
    panel.classList.remove('enter-left', 'enter-right');
    void panel.offsetWidth; // restart the animation
    const dir = ORDER.indexOf(ws) > ORDER.indexOf(prev) ? 'enter-right' : 'enter-left';
    panel.classList.add(dir);
    panel.addEventListener('animationend', () => panel.classList.remove(dir), { once: true });
  }

  setFocused(panel?.querySelector('[data-primary]'));
  if (opts.animate && ws !== prev) {
    if (announce) announce.textContent = `${LABEL[ws]} workspace`;
    window.scrollTo(0, 0);
  }
}

/** Change workspace by updating the hash; the hashchange handler does the rest. */
export function goto(ws: Workspace) {
  if (location.hash.slice(1) === ws) return;
  location.hash = ws;
}

function upgradeNavToButtons() {
  document.querySelectorAll<HTMLAnchorElement>('#ws-nav a[data-ws]').forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = a.className;
    b.dataset.ws = a.dataset.ws;
    b.textContent = a.textContent;
    b.addEventListener('click', () => goto(a.dataset.ws as Workspace));
    a.replaceWith(b);
  });
}

export function initWorkspaces() {
  const root = document.getElementById('workspaces');
  announce = document.getElementById('ws-announce');

  // Focus follows mouse and keyboard focus, on every window.
  document.querySelectorAll('.win').forEach((w) => {
    w.addEventListener('mouseenter', () => setFocused(w));
    w.addEventListener('focusin', () => setFocused(w));
  });

  if (!root || !document.getElementById('home')) return;

  upgradeNavToButtons();
  current = fromHash();
  show(current, { animate: false });
  window.addEventListener('hashchange', () => {
    const next = fromHash();
    if (next !== current) show(next, { animate: true });
  });
}
