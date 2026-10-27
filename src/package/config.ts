import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { remarkUniqueHeadingIds } from '../lib/astropilot/remark-ids';
import { remarkContentLinks } from '../lib/astropilot/remark-links';
import { loadSiteConfig } from '../lib/astropilot/site-config';
import { validateAstroPilotContent } from '../lib/astropilot/validation';

/** Returns the Astro configuration required by the default AstroPilot theme. */
export function createAstroPilotConfig() {
  validateAstroPilotContent();
  const site = loadSiteConfig();

  return {
    site: site.url,
    base: site.base,
    integrations: [sitemap()],
    vite: { plugins: [tailwindcss()] },
    markdown: { processor: unified({ remarkPlugins: [remarkUniqueHeadingIds, [remarkContentLinks, site]] }) },
  };
}
