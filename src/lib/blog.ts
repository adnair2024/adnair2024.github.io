import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface Post {
  date: string; // YYYY-MM-DD
  title: string;
  url: string;
  blurb: string;
}

const FEED = join(process.cwd(), 'blog/index.xml');

const entities: Record<string, string> = {
  lt: '<', gt: '>', amp: '&', quot: '"', apos: "'", nbsp: ' ',
  rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', ndash: '–', mdash: '—', hellip: '…',
};
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return entities[e] ?? m;
  });
const text = (s: string) => decode(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

function tag(item: string, name: string): string {
  const m = item.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`));
  return m ? m[1] : '';
}

function blurbFrom(html: string): string {
  // First paragraph with real text (skips image-only paragraphs).
  const paras = [...decode(html).matchAll(/<p>([\s\S]*?)<\/p>/g)].map((m) => text(m[1]));
  const t = paras.find((p) => p.length > 0) ?? '';
  const sentence = t.match(/^.*?[.!?](\s|$)/)?.[0].trim() ?? t;
  return sentence.length > 140 ? sentence.slice(0, 137).trimEnd() + '…' : sentence;
}

// The feed holds absolute URLs for whatever domain Hugo was built with; link same-origin instead.
function localPath(url: string): string {
  try {
    const u = new URL(url);
    return u.pathname.startsWith('/blog/') ? u.pathname : url;
  } catch {
    return url;
  }
}

export function parseFeed(xml: string, limit = 4): Post[] {
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
  return items.slice(0, limit).map((item) => {
    const d = new Date(tag(item, 'pubDate'));
    // Date in the author's timezone is baked into the offset; use the literal date string.
    const raw = tag(item, 'pubDate').match(/(\d{1,2}) (\w{3}) (\d{4})/);
    const months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
    const date = raw
      ? `${raw[3]}-${String(months.indexOf(raw[2]) + 1).padStart(2, '0')}-${raw[1].padStart(2, '0')}`
      : d.toISOString().slice(0, 10);
    return {
      date,
      title: text(tag(item, 'title')),
      url: localPath(text(tag(item, 'link'))),
      blurb: blurbFrom(tag(item, 'description')),
    };
  });
}

// The Hugo output is committed in this repo, so no network fetch is needed.
export async function getPosts(limit = 4): Promise<Post[]> {
  try {
    return parseFeed(await readFile(FEED, 'utf8'), limit);
  } catch (err) {
    console.warn(`[blog] could not read blog/index.xml: ${(err as Error).message}`);
    return [];
  }
}
