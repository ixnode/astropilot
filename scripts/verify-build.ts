import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadSiteConfig } from '../src/lib/astropilot/site-config';
import { canonicalUrl, withBase } from '../src/lib/astropilot/urls';

const site = loadSiteConfig();
const routes = ['/', '/faq/', '/info/', '/kontakt/'];
for (const route of routes) {
  const relativeFile = route === '/' ? 'index.html' : join(route, 'index.html');
  const path = join('dist', relativeFile);
  if (!existsSync(path)) throw new Error(`Missing generated page: ${path}`);
  const html = readFileSync(path, 'utf8');
  if (!html.includes(`<link rel="canonical" href="${canonicalUrl(route, site)}"`)) throw new Error(`Missing canonical for ${route}`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) throw new Error(`Missing description for ${route}`);
  if ((html.match(/<main\b/g) ?? []).length !== 1 || (html.match(/<h1\b/g) ?? []).length !== 1) throw new Error(`Main/H1 contract failed for ${route}`);
}
const sitemap = readdirSync('dist').find((name) => name === 'sitemap-index.xml' || name === 'sitemap-0.xml');
if (!sitemap) throw new Error('Sitemap output is missing');
const home = readFileSync(join('dist', 'index.html'), 'utf8');
if (!home.includes(`href="${withBase('/faq/', site.base)}"`)) throw new Error('Base-prefixed internal links are missing from built output');
console.log('Built pages, metadata, sitemap, and base-prefixed links verified.');
