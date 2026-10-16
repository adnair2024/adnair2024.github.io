// Change SITE_URL here when the domain moves. Nothing else hardcodes it
// (except links into the existing Hugo blog, which lives under /blog/).
export const SITE_URL = 'https://adnair2024.github.io';

export const site = {
  name: 'Ashwin Nair',
  title: 'Ashwin Nair · Sysadmin & security tooling',
  description:
    'Sysadmin in healthcare IT, moving into security. I build small, fast Linux tools in Go: hardening auditors, code-analysis TUIs, and an RPG bot for Discord.',
  email: 'adnair2024@gmail.com',
  github: 'adnair2024',
  githubUrl: 'https://github.com/adnair2024',
  blogPath: '/blog/',
  resumePath: '/resume.pdf',
} as const;
