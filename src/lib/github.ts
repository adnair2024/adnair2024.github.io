import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { githubUser, featuredRepos, excludeRecent, overrides } from '../data/projects';

export interface Repo {
  name: string;
  description: string;
  language: string;
  url: string;
  pushedAt: string;
  topics: string[];
  tagline: string;
  featured: string;
}

interface ApiRepo {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  pushed_at: string;
  topics?: string[];
  private: boolean;
  archived: boolean;
}

// Resolved from the project root: this module is bundled during the build, so import.meta.url is not stable.
const CACHE = join(process.cwd(), 'src/data/.cache/github.json');

async function readCache(): Promise<Record<string, ApiRepo>> {
  try {
    return JSON.parse(await readFile(CACHE, 'utf8'));
  } catch {
    return {};
  }
}

async function fetchRepo(name: string): Promise<ApiRepo> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com/repos/${githubUser}/${name}`, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = (await res.json()) as ApiRepo;
  // Keep only the fields we use so the committed cache stays small and diff-friendly.
  return {
    name: j.name,
    description: j.description,
    language: j.language,
    html_url: j.html_url,
    pushed_at: j.pushed_at,
    topics: j.topics ?? [],
    private: j.private,
    archived: j.archived,
  };
}

// Priority: overrides > GitHub description. Never throws.
export async function getRepos(): Promise<Repo[]> {
  const cache = await readCache();
  const fresh: Record<string, ApiRepo> = { ...cache };
  const out: Repo[] = [];

  for (const name of featuredRepos) {
    let data: ApiRepo | undefined;
    try {
      data = await fetchRepo(name);
      fresh[name] = data;
    } catch (err) {
      data = cache[name];
      console.warn(`[github] ${name}: ${(err as Error).message}${data ? ', using cache' : ', skipped'}`);
    }
    if (!data) continue;
    if (data.private || data.archived) {
      console.warn(`[github] ${name}: private or archived, skipped`);
      continue;
    }
    const o = overrides[name] ?? {};
    const description = data.description ?? '';
    out.push({
      name: data.name,
      description,
      language: o.stack ?? data.language ?? '',
      url: data.html_url,
      pushedAt: data.pushed_at,
      topics: data.topics ?? [],
      tagline: o.tagline ?? description,
      featured: o.featured ?? o.tagline ?? description,
    });
  }

  try {
    await mkdir(dirname(CACHE), { recursive: true });
    await writeFile(CACHE, JSON.stringify(fresh, null, 2) + '\n');
  } catch (err) {
    console.warn(`[github] could not write cache: ${(err as Error).message}`);
  }
  return out;
}

export interface RecentRepo {
  name: string;
  description: string;
  language: string;
  url: string;
  pushedAt: string;
}

interface ApiListRepo extends ApiRepo {
  fork: boolean;
}

const RECENT_CACHE = join(process.cwd(), 'src/data/.cache/recent.json');

// Most recently pushed public repos that are not already pinned. Never throws.
export async function getRecentRepos(limit = 5): Promise<RecentRepo[]> {
  let list: ApiListRepo[];
  try {
    const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(
      `https://api.github.com/users/${githubUser}/repos?type=owner&sort=pushed&per_page=30`,
      { headers },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = (await res.json()) as ApiListRepo[];
    list = raw.map((j) => ({
      name: j.name,
      description: j.description,
      language: j.language,
      html_url: j.html_url,
      pushed_at: j.pushed_at,
      private: j.private,
      archived: j.archived,
      fork: j.fork,
    }));
    try {
      await mkdir(dirname(RECENT_CACHE), { recursive: true });
      await writeFile(RECENT_CACHE, JSON.stringify(list, null, 2) + '\n');
    } catch (err) {
      console.warn(`[github] could not write recent cache: ${(err as Error).message}`);
    }
  } catch (err) {
    try {
      list = JSON.parse(await readFile(RECENT_CACHE, 'utf8'));
      console.warn(`[github] recent: ${(err as Error).message}, using cache`);
    } catch {
      console.warn(`[github] recent: ${(err as Error).message}, skipped`);
      return [];
    }
  }
  return list
    .filter((r) => !r.private && !r.archived && !r.fork && !featuredRepos.includes(r.name) && !excludeRecent.includes(r.name))
    .slice(0, limit)
    .map((r) => ({
      name: r.name,
      description: r.description ?? '',
      language: r.language ?? '',
      url: r.html_url,
      pushedAt: r.pushed_at.slice(0, 10),
    }));
}
