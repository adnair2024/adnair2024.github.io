export const githubUser = 'adnair2024';
export const featuredRepos = ['bulwark', 'termwerm', 'blamey']; // order matters

// Repos never shown in the "recent" list (this site, the blog source, dotfiles).
export const excludeRecent = ['adnair2024.github.io', 'blog-source', '.dotfiles'];

// Optional per-repo overrides; fall back to GitHub data when absent.
export const overrides: Record<string, { tagline?: string; stack?: string; featured?: string }> = {
  bulwark: {
    tagline: 'Read-only Linux hardening auditor with a TUI: CIS-inspired checks, a score, and a fix for every finding.',
    featured: 'Linux hardening auditor: 27 CIS-inspired checks, a score, and a fix for every finding.',
  },
  termwerm: {
    tagline: 'Terminal UI that rates function complexity across 10 languages, without a compiler.',
  },
};

export const odyssey = {
  name: 'odyssey',
  stack: 'python · discord.py · postgres',
  description: 'An RPG that lives in Discord. Live at odysseybot.net with real players.',
  stat: 'Over 200 players, in 300 servers.',
  featured: 'An RPG that lives in Discord, with over 200 players in 300 servers.',
  url: 'https://odysseybot.net',
  linkLabel: 'odysseybot.net',
};
