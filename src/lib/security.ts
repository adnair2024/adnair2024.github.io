import { SITE_URL, site } from '../data/site';

// Expires stays about a year out because the site rebuilds daily.
export function securityTxt(now = new Date()): string {
  const expires = new Date(now.getTime() + 364 * 24 * 3600 * 1000);
  const stamp = expires.toISOString().slice(0, 10) + 'T00:00:00Z';
  return [
    `Contact: mailto:${site.email}`,
    `Expires: ${stamp}`,
    'Preferred-Languages: en',
    `Canonical: ${new URL('/.well-known/security.txt', SITE_URL).href}`,
    '',
  ].join('\n');
}
