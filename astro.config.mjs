import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/data/site.ts';

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [sitemap()],
  build: { inlineStylesheets: 'never' },
  vite: { build: { assetsInlineLimit: 0 } },
});
