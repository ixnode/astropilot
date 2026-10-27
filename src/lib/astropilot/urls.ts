import type { SiteConfig } from './types';

export function routeFromPageId(id: string): string {
  const directory = id.replace(/(?:^|\/)page(?:\.ya?ml)?$/, '').replace(/^\/+|\/+$/g, '');
  if (directory === '') return '/';
  if (directory.split('/').some((part) => part === '.' || part === '..' || part === '')) {
    throw new Error(`Unsafe page identifier: ${id}`);
  }
  return `/${directory}/`;
}

export function withBase(pathname: string, base: string): string {
  if (!pathname.startsWith('/') || pathname.startsWith('//')) return pathname;
  const suffix = pathname === '/' ? '' : pathname.slice(1);
  return `${base}${suffix}`;
}

export function contentHref(href: string, site: SiteConfig): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  return withBase(href, site.base);
}

export function canonicalUrl(route: string, site: SiteConfig): string {
  return new URL(withBase(route, site.base), site.url).toString();
}
