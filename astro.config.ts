import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import { loadSiteConfig } from './src/lib/astropilot/site-config';
import { remarkUniqueHeadingIds } from './src/lib/astropilot/remark-ids';
import { remarkContentLinks } from './src/lib/astropilot/remark-links';

const site = loadSiteConfig();

export default defineConfig({
  site: site.url,
  base: site.base,
  integrations: [sitemap()],
  vite: { plugins: [tailwindcss()] },
  markdown: { processor: unified({ remarkPlugins: [remarkUniqueHeadingIds, [remarkContentLinks, site]] }) },
});
