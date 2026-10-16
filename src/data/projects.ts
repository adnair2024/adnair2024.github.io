export const githubUser = 'adnair2024';
export const featuredRepos = ['bulwark', 'termwerm', 'blamey']; // order matters

// Optional per-repo overrides; fall back to GitHub data when absent.
export const overrides: Record<string, { tagline?: string; stack?: string; featured?: string }> = {
  bulwark: {
    featured: 'Linux hardening auditor: 27 CIS-inspired checks, a score, and a fix for every finding.',
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
