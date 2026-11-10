import type { APIRoute } from 'astro';
import icon192 from '../themes/default/assets/branding/icon-192x192.png';
import icon512 from '../themes/default/assets/branding/icon-512x512.png';
import { loadSiteConfig } from '../lib/sproutsite/site-config.js';

// A native static Astro endpoint keeps bundled, hashed icon URLs correct for
// both package consumers and deployments under a base path. No service worker.
export const GET: APIRoute = () => {
    const site = loadSiteConfig();
    return new Response(
        JSON.stringify({
            name: site.name,
            short_name: site.name,
            lang: site.language,
            start_url: site.base,
            scope: site.base,
            display: 'browser',
            icons: [icon192, icon512].map((icon) => ({
                src: icon.src,
                sizes: `${icon.width}x${icon.height}`,
                type: 'image/png',
                purpose: 'any',
            })),
        }),
        { headers: { 'Content-Type': 'application/manifest+json' } },
    );
};
