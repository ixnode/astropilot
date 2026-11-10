import mdx from '@astrojs/mdx';
import type { AstroIntegration } from 'astro';
import sitemap from '@astrojs/sitemap';
import {
    rehypeHeadingIds,
    unified,
    type ShikiConfig,
} from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import tsx from '@shikijs/langs/tsx';
import { rehypeUniqueHeadingIds } from '../lib/sproutsite/rehype-ids.js';
import { rehypeContentTables } from '../lib/sproutsite/rehype-tables.js';
import { rehypeExternalLinks } from '../lib/sproutsite/rehype-links.js';
import { remarkContentLinks } from '../lib/sproutsite/remark-links.js';
import { loadSiteConfig } from '../lib/sproutsite/site-config.js';
import { validateSproutsiteContent } from '../lib/sproutsite/validation.js';

/** Returns the Astro configuration required by the default Sproutsite theme. */
export function createSproutsiteConfig() {
    validateSproutsiteContent();
    const site = loadSiteConfig();

    return {
        site: site.url,
        base: site.base,
        integrations: [
            mdx(),
            sitemap(),
            {
                name: 'sproutsite/manifest',
                hooks: {
                    'astro:config:setup': ({ injectRoute }) => {
                        injectRoute({
                            pattern: '/site.webmanifest',
                            entrypoint: new URL(
                                './manifest.ts',
                                import.meta.url,
                            ),
                            prerender: true,
                        });
                    },
                },
            } satisfies AstroIntegration,
        ],
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
                rehypePlugins: [
                    rehypeHeadingIds,
                    rehypeUniqueHeadingIds,
                    rehypeContentTables,
                    [rehypeExternalLinks, site.url],
                ],
            }),
        },
    };
}
