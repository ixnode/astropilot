import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import { rehypeUniqueHeadingIds } from '../lib/astropilot/rehype-ids';
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
        integrations: [mdx(), sitemap()],
        vite: { plugins: [tailwindcss()] },
        markdown: {
            processor: unified({
                remarkPlugins: [[remarkContentLinks, site]],
                rehypePlugins: [rehypeHeadingIds, rehypeUniqueHeadingIds],
            }),
        },
    };
}
