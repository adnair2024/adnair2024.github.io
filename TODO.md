# TODO

Status: redesign is built on branch `redesign` (not merged). Items marked **blocks merge** will fail CI or the live site if skipped.

## Before merging to `main`

- [x] Experience details filled in (start date and MSP line intentionally cut).
- [ ] **Switch GitHub Pages source** (blocks merge): repo Settings → Pages → Source → "GitHub Actions". Do it at merge time, not before.
- [ ] Open the PR from `redesign` and paste the checklist results (see CLAUDE.md §11).
- [ ] After the first deploy, confirm `/blog/` still works, then push a blog post and confirm the site rebuilds on its own.

## Content

- [ ] Add `public/resume.pdf` (the `résumé.pdf` button appears automatically).
- [ ] Real recordings for bulwark and termwerm (Charm VHS `.tape` files in `recordings/`). Replace the sample output in `src/components/BulwarkDemo.astro`. Include a text alternative.
- [ ] Odyssey screenshot or clip.
- [ ] Expand the blamey README and tidy GitHub "About" text:
  - blamey says "contributer"
  - bulwark's is long for a card
  - or set `overrides` in `src/data/projects.ts`
- [ ] Decide whether bulwark replaces the old "hardaudit" name everywhere.
- [ ] Keep Odyssey numbers (200 players, 300 servers) current in `src/data/projects.ts`.

## Design decisions

- [ ] Final accent color (default `#8ab4f8`; alternates `#c3a6ff`, `#f5b88a`, `#8fdcb0`). One variable in `src/styles/tokens.css`.
- [ ] Stretch: use the real end-4 Material You palette. Needs the generated colors or the wallpaper. Keep WCAG AA contrast.

## Domain and hosting

- [ ] Pick a domain (leaning `.dev`) and change `SITE_URL` in `src/data/site.ts`.
- [ ] Optional move to Cloudflare Pages (`public/_headers` already written, the build doesn't depend on it).
  - Add a `wrangler pages deploy` step and secrets to `.github/workflows/build.yml`.
  - Note the Hugo blog deploy pushes to this repo's `main`, so the blog source repo may need its own change.
- [ ] After moving: run securityheaders.com (target A/A+) and Mozilla Observatory (target A+).
- [ ] Submit the domain to the HSTS preload list once it's on the final host.

## Cleanup and checks

- [ ] Delete `legacy/` once you're sure you don't need the old site.
- [ ] Run Lighthouse and axe again on the deployed site (mobile and desktop). Local results were 98–100.
- [ ] Check the site on a real phone and with a real screen reader.
- [ ] The CI workflow has never run. Watch the first run.
- [ ] Remove the stale remote branch `copilot/update-contact-email` if you don't need it.

## Notes

- `ALLOW_PLACEHOLDERS=1 npm run build` is a local-only way to build with placeholders. CI never sets it.
- `npm run verify` runs typecheck, tests, build and the CSP check.
- `blog/` is owned by the blog-source deploy. Don't edit it by hand.
