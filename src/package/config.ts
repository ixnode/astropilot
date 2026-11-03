import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import {
    rehypeHeadingIds,
    unified,
    type ShikiConfig,
} from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import tsx from '@shikijs/langs/tsx';
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
            // A high-contrast Shiki theme keeps code comments readable in the
            // documentation as well as in regular content.
            shikiConfig: {
                theme: 'github-dark-high-contrast',
                // MDX embeds TSX lazily; preload it to highlight imports and JSX.
                langs: tsx,
            } satisfies ShikiConfig,
            processor: unified({
                remarkPlugins: [[remarkContentLinks, site]],
                rehypePlugins: [rehypeHeadingIds, rehypeUniqueHeadingIds],
            }),
        },
    };
}
