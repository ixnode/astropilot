import type { SiteConfig } from './types.js';

export function pageDirectoryFromId(id: string): string {
    const directory = id
        .replace(/(?:^|\/)page(?:\.ya?ml)?$/, '')
        .replace(/^\/+|\/+$/g, '');
    if (
        directory !== '' &&
        directory
            .split('/')
            .some((part) => part === '.' || part === '..' || part === '')
    ) {
        throw new Error(`Unsafe page identifier: ${id}`);
    }
    return directory;
}

export function routeFromPageId(
    id: string,
    urlSegmentForDirectory?: (directory: string) => string | undefined,
): string {
    const directory = pageDirectoryFromId(id);
    if (directory === '') return '/';
    const segments = directory
        .split('/')
        .map(
            (segment, index, allSegments) =>
                urlSegmentForDirectory?.(
                    allSegments.slice(0, index + 1).join('/'),
                ) ?? segment,
        );
    return `/${segments.join('/')}/`;
}

export function withBase(pathname: string, base: string): string {
    if (!pathname.startsWith('/') || pathname.startsWith('//')) return pathname;
    const suffix = pathname === '/' ? '' : pathname.slice(1);
    return `${base}${suffix}`;
}

export function contentHref(href: string, site: SiteConfig): string {
    if (!href.startsWith('/') || href.startsWith('//')) return href;
    const defaultLocale = site.locales[0];
    const localePrefix =
        site.language === defaultLocale ? '' : `/${site.language}`;
    const localizedHref =
        localePrefix === '' ||
        href === localePrefix ||
        href.startsWith(`${localePrefix}/`)
            ? href
            : href === '/'
              ? `${localePrefix}/`
              : `${localePrefix}${href}`;
    return withBase(localizedHref, site.base);
}

/** Compare web links with the validated production origin, including in preview builds. */
export function isExternalWebLink(href: string, siteUrl: string): boolean {
    const site = new URL(siteUrl);
    const target = new URL(href, site);
    return (
        (target.protocol === 'http:' || target.protocol === 'https:') &&
        target.origin !== site.origin
    );
}

export function canonicalUrl(route: string, site: SiteConfig): string {
    return new URL(contentHref(route, site), site.url).toString();
}

/** Derives a safe static route for a dated blog directory identifier. */
export function blogRouteFromId(id: string): string {
    const normalized = id.replace(/^\/+|\/+$/g, '').replace(/\.de$/, '');
    const match = normalized.match(
        /^\d{4}-\d{2}-\d{2}\.([a-z0-9]+(?:-[a-z0-9]+)*)$/,
    );
    if (!match) throw new Error(`Unsafe blog identifier: ${id}`);
    return `/blog/${match[1]}/`;
}
