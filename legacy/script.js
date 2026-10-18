// Fetch GitHub repos and render project cards
import { GITHUB_USERNAME, GITHUB_PROJECTS_COUNT } from './config.js';

const projectListEl = document.getElementById('project-list');
const errorEl = document.getElementById('projects-error');
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

async function fetchRepos(username, count=6) {
  const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${count}`;
  const res = await fetch(url);
  if (!res.ok) {
    const errText = await res.text().catch(()=>res.statusText);
    throw new Error(`GitHub API error: ${res.status} — ${errText}`);
  }
  return res.json();
}

function createCard(repo) {
  const div = document.createElement('div');
  div.className = 'project-card';

  // sanitize minimal fields
  const name = repo.name || 'Unnamed';
  const desc = repo.description ? repo.description : 'No description provided';
  const url = repo.html_url;
  const lang = repo.language || '—';
  const stars = repo.stargazers_count ?? 0;
  const forks = repo.forks_count ?? 0;
  const updated = repo.updated_at ? new Date(repo.updated_at).toLocaleDateString() : '';

  div.innerHTML = `
    <h3><a href="${url}" target="_blank" rel="noopener">${escapeHtml(name)}</a></h3>
    <p>${escapeHtml(desc)}</p>
    <div class="repo-meta">
      <span title="Primary language">🛈 ${escapeHtml(lang)}</span>
      <span title="Stars">★ ${stars}</span>
      <span title="Forks">⎇ ${forks}</span>
      <span title="Last updated">⏱ ${escapeHtml(updated)}</span>
    </div>
  `;
  return div;
}

function escapeHtml(s){
  if (!s) return '';
  return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}

async function load() {
  try {
    projectListEl.innerHTML = `<div class="muted">Loading projects…</div>`;
    const repos = await fetchRepos(GITHUB_USERNAME, GITHUB_PROJECTS_COUNT);
    projectListEl.innerHTML = '';
    if (!Array.isArray(repos) || repos.length === 0) {
      projectListEl.innerHTML = `<div class="muted">No repositories found.</div>`;
      return;
    }
    repos.forEach(repo => {
      const card = createCard(repo);
      projectListEl.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    projectListEl.innerHTML = '';
    errorEl.hidden = false;
    errorEl.textContent = `Could not load projects: ${err.message}`;
  }
}

document.addEventListener('DOMContentLoaded', load);

