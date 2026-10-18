// Fails if built HTML contains anything the CSP (script-src 'self'; style-src 'self') would block,
// or references another origin.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      // blog/ is Hugo output owned by another repo; it is copied in by CI and not checked here.
      if (p === join(DIST, 'blog')) continue;
      out.push(...(await walk(p)));
    } else out.push(p);
  }
  return out;
}

const problems = [];
const files = await walk(DIST);
const html = files.filter((f) => f.endsWith('.html'));
if (html.length === 0) {
  console.error('check-csp: no HTML found in dist/. Run the build first.');
  process.exit(1);
}

const rules = [
  ['inline <script> (no src)', /<script\b(?![^>]*\bsrc=)[^>]*>/gi],
  ['<style> block', /<style\b/gi],
  ['style="" attribute', /\sstyle\s*=/gi],
  ['inline event handler', /\son[a-z]+\s*=\s*["']/gi],
  ['javascript: URL', /href\s*=\s*["']javascript:/gi],
  ['external resource (src/href to other origin)', /<(?:script|link|img|iframe|source|video|audio)\b[^>]*\b(?:src|href)\s*=\s*["']https?:\/\/(?!adnair2024\.github\.io)[^"']+/gi],
];

for (const f of html) {
  const text = await readFile(f, 'utf8');
  for (const [name, re] of rules) {
    for (const m of text.matchAll(re)) {
      // <link rel=canonical|icon|preload...> to our own SITE_URL and external <a href> are fine;
      // only flag <link> that loads a stylesheet/script from elsewhere.
      if (name.startsWith('external') && /<link\b/i.test(m[0]) && !/rel\s*=\s*["']?(?:stylesheet|preload|modulepreload)/i.test(m[0])) continue;
      problems.push(`${f.replace(DIST, 'dist/')}: ${name}: ${m[0].slice(0, 100)}`);
    }
  }
}

for (const f of files.filter((f) => /\.(js|css)$/.test(f))) {
  const text = await readFile(f, 'utf8');
  if (/\beval\s*\(|new Function\s*\(/.test(text)) problems.push(`${f.replace(DIST, 'dist/')}: eval/new Function`);
  if (/@import\s+url\(\s*["']?https?:/.test(text)) problems.push(`${f.replace(DIST, 'dist/')}: remote @import`);
  if (f.endsWith('.css') && /url\(\s*["']?https?:/.test(text)) problems.push(`${f.replace(DIST, 'dist/')}: remote url() in CSS`);
}

for (const required of ['_headers', '.well-known/security.txt', 'robots.txt']) {
  try {
    await readFile(join(DIST, required));
  } catch {
    problems.push(`dist/${required} is missing`);
  }
}

if (problems.length) {
  console.error(`check-csp: ${problems.length} problem(s)\n  ` + problems.join('\n  '));
  process.exit(1);
}
console.log(`check-csp: ok (${html.length} html files checked)`);
