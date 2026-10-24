# CLAUDE.md: Portfolio redesign ("terminal Hyprland")

This file is the full brief for redesigning Ashwin Nair's personal site
(currently `adnair2024.github.io`). It was written from a design session that
produced an interactive mockup. Everything needed to build the site is here:
goals, visual system, layout, interactions, exact copy, data pipeline,
security requirements, and an acceptance checklist.

Read the whole file before writing code. When this file and your instincts
disagree, this file wins. When this file is silent, prefer the simpler, faster,
more accessible option and note the decision in the PR description.

---

## 0. First steps (do these before building anything)

1. **Inspect the existing repo.** The current site is a single page built with
   Three.js on GitHub Pages. There is also a Hugo blog served at
   `/blog/` (https://adnair2024.github.io/blog/). Find out how `/blog/` is
   produced (same repo subfolder? separate repo? built output committed?).
   **Do not break or delete the blog.** If it lives in this repo, the new build
   must keep serving it at `/blog/` exactly as it does now.
2. **Work on a branch** (`redesign`), never directly on `main`.
3. **Keep the old site recoverable.** Don't delete old files in the same commit
   that adds the new site; move them to `legacy/` or remove them in a separate,
   clearly labeled commit.
4. Write a short plan (stack, folder structure, how the blog is preserved) and
   confirm it with Ashwin before the big build.

---

## 1. Goals and audience

**Primary audience:** recruiters and hiring managers for security and
sysadmin / infrastructure roles. They skim for ~30 seconds.

**Secondary audience:** Ashwin himself. He wants a site he genuinely likes,
because a site you like is a site you keep updated.

**The story the site tells:**
> Sysadmin in healthcare IT, moving into security, who builds his own tools,
> and ships a real product (Odyssey) with real users.

**Success criteria**
- In 30 seconds a visitor knows: who he is, what he does now, what he builds,
  how to contact him.
- Nothing important is hidden behind an interaction. The fun stuff (workspaces,
  shell) is a layer on top, never a requirement.
- It feels like his actual Arch + Hyprland desktop (he uses end-4's Hyprland
  dotfiles), not a generic "hacker terminal" template.
- It practices what it preaches: strict security headers, no trackers,
  no third-party scripts, fast.

**Retire from the old site:** the "I build stuff with Python & web APIs"
headline, the Modo and Codesnap featured apps (free-tier demos that sleep),
the WebGL/Three.js background, and the client-side "Loading your GitHub
contributions..." section.

---

## 2. Stack and hosting

- **Framework:** Astro (static output, `output: 'static'`). Ship zero JS by
  default; the interactive parts are small vanilla TypeScript islands or plain
  `<script>` modules. No React/Vue/Svelte runtime unless there's a real need.
  (If you have a strong reason to pick something else, propose it first.)
- **Hosting target:** Cloudflare Pages (it supports a `_headers` file; GitHub
  Pages cannot set HTTP headers). Until the move happens, the build must also
  work on GitHub Pages; the site should not depend on the headers to function.
- **Domain:** undecided. Leaning toward a `.dev` domain (HSTS-preloaded TLD).
  Keep every absolute URL in one config value (`SITE_URL`) so switching domains
  is a one-line change. Do not hardcode `adnair2024.github.io` anywhere except
  that config and links to the existing blog.
- **Package manager:** pnpm or npm, whichever the repo already uses; otherwise npm.
- **Node:** current LTS. Pin it in `.nvmrc` and `package.json` `engines`.

---

## 3. Visual system

### 3.1 Concept
The page **is** a Hyprland desktop:
- A **Waybar-style top bar** with workspace buttons, the current path, and a clock.
- Content lives in **tiled "windows"** with gaps between them and rounded
  borders, like Hyprland tiling.
- The **focused window** gets the accent-colored border; others get a dim one.
  Focus follows the mouse (Hyprland's default `follow_mouse`) and keyboard focus.
- Each window has a small title like a terminal: `kitty — ~/whoami`.
- Section headings are written as shell commands: `$ whoami`,
  `$ cat experience.txt`, `$ ls -l ~/projects`, `$ ls -t ~/blog`.

### 3.2 Color tokens
Define as CSS custom properties on `:root`. The site is dark-only (it's a rice).

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0d12` | page background (the "wallpaper") |
| `--win` | `#141821` | window background, top bar |
| `--win-inset` | `#11141c` | cards inside windows |
| `--input` | `#0f1218` | shell input background |
| `--border-idle` | `#222837` | unfocused window border, top bar border |
| `--border-soft` | `#2a3142` | card borders, chips, outline buttons, dividers |
| `--text` | `#e6e8ee` | primary text |
| `--text-body` | `#c9cfdb` | body copy |
| `--text-muted` | `#9aa3b5` | metadata, labels, window titles |
| `--accent` | `#8ab4f8` | focused border, prompts, primary buttons, links |
| `--on-accent` | `#0b0d12` | text on accent backgrounds |
| `--ok` | `#8fdcb0` | PASS in terminal output |
| `--warn` | `#f0c674` | WARN in terminal output |
| `--err` | `#f4a29a` | FAIL / shell errors |

Alternate accents Ashwin may switch to: `#c3a6ff`, `#f5b88a`, `#8fdcb0`.
Keep the accent a single variable so it's one-line to change.

**Stretch goal:** replace the palette with the Material You colors end-4's
dotfiles generate from Ashwin's wallpaper (ask him for the generated colors or
the wallpaper). Keep contrast at WCAG AA or better if you do.

Contrast rules: body and muted text must stay ≥ 4.5:1 on their background.
PASS/WARN/FAIL are always shown as words, never color alone.

### 3.3 Typography
- **Mono (UI, headings, commands, labels):** JetBrains Mono, weights 400/500/700/800.
- **Sans (body copy):** IBM Plex Sans, weights 400/500.
- **Self-host both** as `.woff2` files with `@font-face` and
  `font-display: swap`. No Google Fonts link (the CSP forbids it). Subset to
  Latin if practical. Preload the mono 800 weight used by the hero name.
- Do not use Inter, Roboto, or Arial.

Type scale (desktop; scale down on phones):
- Hero name: mono 800, 56px, letter-spacing -1.5px, line-height 1.1
- Card / job titles: mono 700, 20–22px
- Section command headings: mono 500, 16px, accent color
- Window titles (`kitty — ~/whoami`): mono 400, 13px, muted
- Body: sans 400, 15–19px, line-height 1.5–1.55
- Metadata / chips: mono 400, 12–13px, muted

### 3.4 Shape and spacing
- Page padding and gaps between windows: **10px** (Hyprland gaps).
- Window: 2px border, **12px radius**, padding ~20–32px.
- Cards inside windows: 1px border, 10px radius, padding 14–20px.
- Buttons and chips: 6–8px radius. Every interactive target ≥ 44px tall.
- Border color transition on focus: 150ms ease.

---

## 4. Layout

### 4.1 Top bar (Waybar)
Full width, sticky not required. Left to right:
- **Workspace buttons** (real `<button>` elements, `aria-current="page"` on the
  active one): `1 home`, `2 projects`, `3 blog`. Active = accent background,
  `--on-accent` text, bold. Inactive = transparent, muted text.
- **Center:** `ashwin@arch` followed by the current path in accent:
  `~` (home), `~/projects`, `~/blog`.
- **Right:** `go · linux · security` (muted) and a live `HH:MM` clock
  (visitor's local time, 24h, updates every 15s).
- Wraps gracefully on narrow screens.

### 4.2 Main area
A wrapping flex row:
- **Workspace area** (`flex: 999 1 640px`): shows the windows of the active workspace.
- **Shell window** (`flex: 1 1 360px`, min-height ~420px): pinned on the right
  on every workspace. On phones it stacks below the workspace content.

### 4.3 Workspace 1: home
Windows, in order:
1. **`~/whoami`** (`flex: 1 1 420px`): hero. See copy in §6.1.
2. A column (`flex: 1 1 420px`) with:
   - **`experience.txt`** window (§6.2)
   - **`contact.txt`** window (§6.3)
3. **Featured strip** (`flex: 1 1 100%`, full width under the above):
   heading `$ ls ~/projects | head -2`, an `all projects →` button, and two
   compact project cards (bulwark, Odyssey). Clicking a card or the button
   switches to workspace 2. This exists so visitors who never click the
   workspace bar still see the work.

### 4.4 Workspace 2: projects
1. **Projects window** (`flex: 999 1 480px`): heading `$ ls -l ~/projects`,
   right-aligned muted note `synced from github.com/adnair2024`. A wrapping grid
   of project cards (`flex: 1 1 300px`): Odyssey first (hand-written), then the
   GitHub-sourced repos.
2. **Demo window** (`flex: 1 1 360px`, aligned to top): title
   `kitty — bulwark demo`, showing bulwark output (§6.5).

### 4.5 Workspace 3: blog
1. **Blog window** (`flex: 999 1 480px`): heading `$ ls -t ~/blog`, link
   `all posts ↗` to the blog index. A list of recent posts: date (mono, muted,
   fixed ~104px column), title (sans 500, 18px), one-line blurb (muted).
   Each row is a link to the post; rows separated by 1px `--border-idle` lines.
2. **README window** (`flex: 1 1 300px`, aligned to top): title
   `kitty — ~/blog/README` (§6.6).

### 4.6 Responsive behavior
- Everything is fluid; no fixed page widths. Works from 320px up.
- On phones, windows stack in one column, top bar wraps, the shell sits below
  the workspace content, wide `<pre>` output scrolls horizontally inside its box.
- No horizontal page scroll at any width.

---

## 5. Interactions

### 5.1 Workspaces
- Clicking a workspace button swaps the workspace area's windows.
- **Animation:** the incoming workspace slides in ~56px from the right when
  moving to a higher number, from the left when moving to a lower one, while
  fading from 0 to 1. ~320ms, `cubic-bezier(.2,.8,.2,1)`.
- Switching sets focus to that workspace's primary window
  (home → whoami, projects → projects, blog → blog).
- **URL sync:** reflect the workspace in the hash (`#home`, `#projects`,
  `#blog`) so links are shareable and back/forward works. Loading `/#projects`
  opens that workspace directly (no animation on initial load).
- **No-JS fallback (required):** without JavaScript, all three workspaces
  render stacked on one long page with normal headings, and the workspace
  buttons are plain anchor links to each section. JS enhances this into the
  workspace view. Recruiters with script blockers, crawlers and reader modes
  must get all content.

### 5.2 Focus follows mouse
- `mouseenter` or `focusin` on a window makes it focused: its border becomes
  `--accent`, all others `--border-idle`. Exactly one focused window at a time.
- Implement with a class (`.is-focused`), not inline styles.

### 5.3 Hero typing animation
- `Ashwin Nair` types out character by character after the `$ whoami` line:
  start after ~450ms, ~95ms per character, followed by a blinking `_` caret
  in accent (1s step blink).
- Play **only on the first page view per session** (sessionStorage flag,
  wrapped in try/catch). Later views show the full name immediately.
- The `<h1>` must contain the real text `Ashwin Nair` for screen readers and
  SEO. Animate a visual overlay or `aria-hidden` span; never leave the heading
  empty in the HTML.
- Reserve the heading's height so nothing jumps while typing.

### 5.4 Reduced motion
Under `prefers-reduced-motion: reduce`: no typing (full name immediately),
no caret blink, no workspace slide, no border transitions.

### 5.5 The shell
An optional, working fake shell. Pinned on every workspace.

**UI:** window title `kitty — ~/shell`; a scrollable output log
(`role="log"`, `aria-live="polite"`, mono 14px, `white-space: pre-wrap`,
auto-scrolls to bottom); an input row with an accent `$` label and a text input
(placeholder `try: help, neofetch, ls projects`, `autocomplete="off"`,
`spellcheck="false"`); a muted hint under it: `Optional. Everything here is
clickable too.`

**Behavior:**
- Enter runs the command. The command is echoed as `$ <input>` in accent.
- Up/Down arrows walk command history.
- **Tab completes** commands and arguments (commands, filenames, directories,
  project names). If ambiguous, print the options.
- Show 3–4 **clickable suggestion chips** under the input when the log is
  near-empty (`help`, `neofetch`, `ls projects`, `cat about.txt`). Clicking one
  runs it.
- Keep at most the last 60 log lines.
- Initial log (muted): `welcome to ashwin@arch.` / `type help to look around.`
- Unknown command: `<cmd>: command not found. try help` (error color).
- Input text that is echoed must be rendered as text, never HTML.
- No global keyboard shortcuts on the page (they'd hijack typing).

**Commands (exact output):**

`help`
```
commands:
  whoami            who is this
  ls                list files
  ls projects       list projects
  ls blog           list blog posts
  cat <file>        about.txt, experience.txt, security.txt
  cd <dir>          ~, projects, blog
  open <project>    bulwark, termwerm, term-manga, blamey, odyssey
  neofetch          system info
  clear             clear the screen
```

`whoami`
```
Ashwin Nair. sysadmin in healthcare IT, building security tools in go.
```

`ls`
```
about.txt  experience.txt  security.txt  projects/  blog/
```

`ls projects` → `bulwark  odyssey  termwerm  blamey` (generate from project data)

`ls blog` → one line per post: `YYYY-MM-DD  Title` (from blog data)

`cat about.txt`
```
sysadmin in healthcare IT, moving into security.
I build small, fast linux tools in go, and an RPG bot for discord.
```

`cat experience.txt` → switches to workspace 1, prints:
```
systems administrator, neuroscience clinic
athenaPractice EHR, HIPAA-regulated environment
B.S. computer information systems, loyola new orleans, cum laude
```

`cat security.txt` → prints the real security.txt contents (§8.3) plus:
```
# found something? tell me. no third-party scripts,
# no trackers, strict CSP. same file lives at /.well-known/
```

`cd`, `cd ~`, `cd projects`, `cd blog` (trailing `/` allowed) → switch
workspace, no output. Anything else: `cd: no such directory: <arg>`.

`open <project>` → prints `→ <url>` and switches to workspace 2. Also make the
printed URL a clickable link in the log. Unknown: `open: unknown project: <arg>`.
URLs: bulwark/termwerm/blamey → their GitHub repos; odyssey → https://odysseybot.net

`neofetch`
```
      /\        ashwin@arch
     /  \       -----------
    /\   \      os      arch linux
   /  __  \     wm      hyprland
  /  (  )  \    editor  neovim
 / __|  |__\\   langs   go, python, lua
/.`        `.\  job     sysadmin, healthcare
                site    strict csp, no trackers
```

`sudo ...` → `visitor is not in the sudoers file. this incident will be reported.` (error color)

`clear` → empties the log.

Feel free to add one or two tasteful easter eggs, but keep `help` accurate.

---

## 6. Content (use this copy; don't invent stats)

### 6.1 whoami window
- Title: `kitty — ~/whoami`
- Prompt: `$ whoami`
- `<h1>`: `Ashwin Nair` (+ blinking caret)
- Body: "Sysadmin in healthcare IT, moving into security. I build small, fast
  Linux tools in Go: hardening auditors, code-analysis TUIs, and an RPG bot for
  Discord."
- Chips: `arch + hyprland`, `go`, `python`, `linux hardening`, `ehr systems`
- Buttons: `./projects` (primary, switches to workspace 2), `github ↗`
  (https://github.com/adnair2024), `résumé.pdf` (links to `/resume.pdf`;
  **placeholder until Ashwin provides the PDF**; hide the button if the file
  doesn't exist at build time).

### 6.2 experience window
- Heading: `$ cat experience.txt`
- Role: **Systems Administrator**, right-aligned dates `[START] – now`
- Org line: `Neuroscience clinic · HIPAA-regulated healthcare`
  (Keep the employer generic: **do not name the clinic or its MSP.**)
- Bullets (placeholders marked `[...]` must be filled by Ashwin; never invent):
  - Administer the clinic's athenaPractice EHR (formerly GE Centricity).
    [WHAT HE OWNS: upgrades, interfaces, user access]
  - Work alongside the clinic's managed service provider.
    [WHERE HIS JOB ENDS AND THEIRS BEGINS]
  - [SCALE: users, endpoints, sites supported]
  - [ONE THING HE AUTOMATED, FIXED OR HARDENED, with a number]
- Divider, then education: `B.S. Computer Information Systems, Loyola
  University New Orleans`, right-aligned `cum laude`.

Put experience content in a data file (`src/data/experience.ts`) so it's easy
to edit. If any `[...]` placeholder is still present at build time, **fail the
production build** with a clear message (dev builds may warn instead).

### 6.3 contact window
- Heading: `$ cat contact.txt`
- `email adnair2024@gmail.com` (mailto link)
- `github adnair2024` (https://github.com/adnair2024)
- No LinkedIn (he doesn't use it).
- Consider light obfuscation of the email against scrapers only if it stays
  accessible and works without JS; otherwise leave it plain.

### 6.4 Projects

**Odyssey** (private repo, hand-written, always first):
- Name: `odyssey`
- Stack: `python · discord.py · postgres`
- Description: "An RPG that lives in Discord. Live at odysseybot.net with real players."
- Stat line: "Over 200 players, in 300 servers." (Ashwin's numbers; keep in data
  so he can update them.)
- Link: `odysseybot.net ↗` → https://odysseybot.net
- Featured-strip version: "An RPG that lives in Discord, with over 200 players
  in 300 servers."

**GitHub-sourced projects** (in this order): `bulwark`, `termwerm`, `blamey`.
Card: name (mono 700), language (muted), description, `repo ↗` link. See §7
for where the data comes from.

Context on each (for taglines, alt text, and the shell; verify against the repos):
- **bulwark** (Go, Bubble Tea): read-only Linux hardening auditor with a TUI.
  27 CIS-inspired checks across SSH, accounts, file permissions, firewall,
  exposed services, kernel params, patching and logging; weighted score and
  A–F grade; JSON/Markdown export; `--fail-under` for CI; single static binary;
  parses `sshd_config` the way sshd does; reads listening sockets from
  `/proc/net/tcp`; all system access behind a `System` interface so tests run
  without root. Featured-strip line: "Linux hardening auditor: 27 CIS-inspired
  checks, a score, and a fix for every finding."
- **termwerm** (Go, zero-CGO TUI): audits function complexity across codebases
  in 10 languages, detecting loop depth and recursion without a compiler;
  three-tier rating (efficient / moderate / not efficient); Markdown export.
- **blamey** (Go CLI): shows how much each contributor really added to a
  project. Its README is a single line; the card relies on the GitHub
  description until Ashwin expands it.

### 6.5 bulwark demo window
Until a real recording exists, show this sample (as preformatted text, with
PASS/WARN/FAIL colored via classes) and the muted note
"Sample output. Swap in a real recording later.":
```
$ sudo bulwark --plain
────────────────────────────────
PASS  SSH-01  root login disabled
PASS  SSH-02  password auth off
PASS  NET-01  firewall active
WARN  KRN-02  ip forwarding on
FAIL  LOG-02  no brute-force guard
────────────────────────────────
score 84  grade B
```
**Planned upgrade:** a real recording made with Charm's VHS (`.tape` script
committed under `recordings/`), exported as a looping video (`.webm`/`.mp4`,
muted, `playsinline`, with a poster frame) or optimized GIF. Same for termwerm.
Provide a text alternative for each recording. Leave a clean slot for these.

### 6.6 blog README window
- Title: `kitty — ~/blog/README`
- "Notes on Neovim, tooling and tinkering, written in Markdown and built with Hugo."
- `topics: neovim · coding · tech · fun`

---

## 7. Data pipeline (all at BUILD time)

Nothing is fetched in the visitor's browser. This keeps the page instant, avoids
GitHub's per-IP rate limits, and is required by the CSP (`connect-src 'self'`).

### 7.1 Projects
- Config file `src/data/projects.ts`:
  ```ts
  export const githubUser = 'adnair2024';
  export const featuredRepos = ['bulwark', 'termwerm', 'blamey']; // order matters
  // Optional per-repo overrides; fall back to GitHub data when absent.
  export const overrides: Record<string, { tagline?: string; stack?: string }> = {};
  ```
- At build, fetch `GET https://api.github.com/repos/{user}/{repo}` for each repo.
  Use `name`, `description`, `language`, `html_url`, `pushed_at`, `topics`.
- Authenticate with `GITHUB_TOKEN` when present (in CI), unauthenticated locally.
- **Cache the last successful response** to `src/data/.cache/github.json`
  (committed or restored by CI). If the API fails, build from the cache and log
  a warning. Never fail the whole build because GitHub hiccuped.
- Skip private, archived or missing repos with a warning.
- Nice-to-have: let each repo provide its own short tagline via a
  `portfolio.yml` in the repo root (fetched raw at build), so cards stay
  consistently short. Priority: `overrides` > `portfolio.yml` > GitHub description.
- Do **not** show star counts (they're 0 and read badly).

### 7.2 Blog posts
- The blog is Hugo. Read its RSS feed at build time (find the real feed URL by
  inspecting the blog: likely `/blog/index.xml`). If the blog source is in this
  repo, reading Hugo's content files directly is also fine.
- Show the 4 most recent posts (date, title, link). For blurbs use the post
  summary/description, trimmed to one sentence.
- Current posts for reference (newest first):
  - 2026-09-26 "A quick Neovim Plugin that made writing code and blog articles easier for me" (temp.nvim)
  - 2026-02-12 "Pokemon Tinkering" (Shiny Patcher)
  - 2025-12-29 "How to Publish a Neovim Plugin" (md-helper.nvim)
  - 2025-12-22 "Stationary Wrap Up - 2025" (non-dev; fine to show if it's in the latest 4, but prefer dev posts if you add filtering by category)
  - 2025-12-21 "my-markdown"
  - 2025-12-20 "the beginning."
- Same failure rule: cache and fall back; never break the build.

### 7.3 Rebuilds
GitHub Actions workflow `.github/workflows/build.yml`:
- On push to `main`, on a daily schedule (`cron`), and on `workflow_dispatch`.
- Installs, builds, runs checks (§10), deploys (Cloudflare Pages via
  `wrangler pages deploy` with secrets, or GitHub Pages until the move).
- Minimal `permissions:`; pin third-party actions to a commit SHA.

---

## 8. Security (this site is part of a security portfolio)

### 8.1 Headers
A `_headers` file already exists from the design session; put it at
`public/_headers` so it deploys to the site root. Its policy:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
```

### 8.2 What the CSP forces (non-negotiable)
- **No inline `<script>`** and **no inline `<style>`** blocks in built HTML.
- **No `style="..."` attributes** in built HTML (blocked by `style-src 'self'`).
  All styling via classes in external CSS. Setting styles from JS through the
  CSSOM (`el.style.foo = ...`, `classList`) is fine; `setAttribute('style', ...)`
  and `innerHTML` with style attributes are not.
- No CDNs, no Google Fonts, no analytics, no embeds. Everything same-origin.
- In Astro: set `build.inlineStylesheets: 'never'`, and check the built output
  for inlined scripts; configure Astro so scripts are emitted as files. Add a
  build check (§10) that greps `dist/` for `<script>` without `src`, `<style`,
  and ` style="` and fails if any are found (JSON-LD, if used, must be
  removed or handled with a hash; simplest is not to use it).
- No `eval`, `new Function`, or string `setTimeout`.
- Use `textContent` (never `innerHTML`) for anything derived from user input in
  the shell.

### 8.3 security.txt
Serve at `/.well-known/security.txt` (put it in `public/.well-known/`):
```
Contact: mailto:adnair2024@gmail.com
Expires: 2027-10-16T00:00:00Z
Preferred-Languages: en
Canonical: https://YOUR-DOMAIN/.well-known/security.txt
```
Fill `Canonical` from `SITE_URL`. Ideally generate it at build so `Expires`
stays about a year out (and the shell's `cat security.txt` reads the same data).

### 8.4 Other
- `rel="noopener noreferrer"` on external links that open new tabs (prefer not
  opening new tabs at all, except the explicit `↗` links).
- No cookies, no localStorage except the typing-animation sessionStorage flag.
- Targets: securityheaders.com grade **A or A+**, Mozilla Observatory **A+**
  (both after moving to Cloudflare Pages).

---

## 9. Accessibility, SEO and performance

**Accessibility (WCAG 2.2 AA)**
- Semantic landmarks: `<header>`, `<nav aria-label="Workspaces">`, `<main>`,
  each window a `<section>` with `aria-labelledby` its heading.
- One `<h1>` (the name). Windows use `<h2>`, cards `<h3>`.
- Real `<button>` / `<a href>` / `<input>` + `<label>` only; no click handlers
  on divs. Visible focus rings (accent outline) on everything focusable.
- Hidden workspaces must be removed from the tab order and accessibility tree
  (`hidden` attribute or `inert`), not just visually offscreen.
- Announce workspace changes politely (e.g., update a visually hidden live
  region: "Projects workspace").
- Decorative ASCII (neofetch logo) is fine inside the log; the log itself is
  `role="log"`.

**SEO / sharing**
- `<title>`: `Ashwin Nair · Sysadmin & security tooling`
- Meta description from the hero copy.
- Open Graph + Twitter card with a 1200×630 image that looks like the home
  workspace (generate at build or commit a static PNG).
- Canonical URL from `SITE_URL`. `sitemap.xml` and `robots.txt`.
- A favicon that fits the theme (e.g., an accent `$` or `>_` glyph). SVG + PNG fallback.

**Performance budget**
- Lighthouse ≥ 95 on Performance, Accessibility, Best Practices, SEO (aim for 100).
- Total JS ≤ 20 KB gzipped. Total page weight (excluding optional demo video) ≤ 300 KB.
- Fonts: only the weights listed, `.woff2`, preloaded hero weight.
- No layout shift from fonts or the typing animation (CLS ≈ 0).

---

## 10. Suggested structure

```
src/
  data/
    projects.ts        # repo list + overrides + Odyssey card
    experience.ts      # experience bullets (fails build on [placeholders])
    site.ts            # SITE_URL, name, email, socials
    .cache/            # last good GitHub / RSS responses
  lib/
    github.ts          # build-time fetch + cache
    blog.ts            # build-time RSS read + cache
  components/
    TopBar.astro
    Window.astro       # title, heading, focus class, aria wiring
    ProjectCard.astro
    FeaturedStrip.astro
    BlogList.astro
    BulwarkDemo.astro
    Shell.astro        # markup only; behavior in scripts/shell.ts
  scripts/
    workspaces.ts      # switching, hash sync, focus-follows-mouse
    typing.ts          # hero animation
    shell.ts           # command parser, history, tab completion
  styles/
    tokens.css         # §3.2 variables
    global.css
  pages/
    index.astro
    404.astro          # themed: `cd: no such file or directory`
public/
  _headers
  .well-known/security.txt   # or generated
  fonts/*.woff2
  resume.pdf                 # when provided
recordings/                  # VHS .tape files (later)
scripts/check-csp.mjs        # fails build on inline script/style/style=""
```

Keep the shell's command table data-driven (one object mapping command →
handler) and unit-test it (Vitest): every command in `help` works, unknown
commands error, `cd`/`open` switch workspaces, history and tab completion behave.

---

## 11. Acceptance checklist

Before calling the redesign done, verify each item and report results in the PR:

- [ ] Blog at `/blog/` still works exactly as before.
- [ ] All content readable with JavaScript disabled (stacked layout).
- [ ] Workspace switching, slide direction, hash sync and back/forward work.
- [ ] Focus-follows-mouse and keyboard focus move the accent border.
- [ ] Typing animation plays once per session; disabled under reduced motion.
- [ ] Every shell command in `help` works; tab completion and history work;
      suggestion chips work; user input is never rendered as HTML.
- [ ] Project cards come from the GitHub API at build; build survives API failure via cache.
- [ ] Blog list comes from the blog at build; same fallback.
- [ ] No `[placeholder]` text in production output.
- [ ] `scripts/check-csp.mjs` passes: no inline scripts, `<style>` blocks, or `style=""`.
- [ ] No requests to any other origin (check the network panel).
- [ ] `/.well-known/security.txt` served and valid.
- [ ] Lighthouse ≥ 95 in all four categories, mobile and desktop.
- [ ] axe (or similar) reports no violations.
- [ ] Looks right at 320px, 390px, 768px, 1280px, 1440px+.
- [ ] Old Three.js site removed or archived in `legacy/` in its own commit.

---

## 12. Open items (ask Ashwin; don't guess)

- Experience details: start date, scope, scale, one quantified win.
- Résumé PDF.
- Domain name (leaning `.dev`); hosting switch to Cloudflare Pages.
- Final accent color / whether to use his real end-4 Material You palette.
- Real VHS recordings for bulwark and termwerm; an Odyssey screenshot or clip.
- Expanded README / tagline for blamey (and tightening repo "About" text on
  GitHub: blamey's says "contributer", bulwark's is long for a card).
- Whether bulwark replaces his earlier "hardaudit" project name everywhere.

## 13. Things not to do

- Don't fetch anything client-side.
- Don't add analytics, trackers, chat widgets, or third-party embeds.
- Don't name his employer or its MSP.
- Don't invent metrics, dates, testimonials, or job details.
- Don't make the shell or workspaces the only way to reach content.
- Don't reintroduce WebGL/Three.js backgrounds or heavy animation libraries.
- Don't use emoji as icons; use text glyphs (`↗`, `→`) or inline SVG.
