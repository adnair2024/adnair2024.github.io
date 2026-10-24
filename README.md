# adnair2024.github.io

Ashwin Nair's personal site, styled as a Hyprland desktop. Astro (static), vanilla TypeScript, no third-party requests.

```
npm ci
npm run dev        # dev server
npm run verify     # typecheck, tests, build, CSP check
```

- **Content:** `src/data/` (`site.ts`, `experience.ts`, `projects.ts`). Experience placeholders in `[BRACKETS]` fail a production build.
- **Build-time data:** GitHub repos are fetched by `src/lib/github.ts` (cached in `src/data/.cache/`); the blog list is read from `blog/index.xml`.
- **Blog:** `blog/` is Hugo output pushed here by `adnair2024/blog-source`. Don't edit it by hand. CI copies it into the built site unchanged.
- **Deploy:** `.github/workflows/build.yml` builds and deploys to GitHub Pages (Pages source must be "GitHub Actions"). `public/_headers` is for the planned Cloudflare Pages move.
- **Old site:** removed; recoverable from git history (before the "remove legacy" commit).
- **Local-only escape hatch:** `ALLOW_PLACEHOLDERS=1 npm run build` builds despite experience placeholders. CI never sets it.
