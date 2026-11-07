import assert from 'node:assert/strict';
import test from 'node:test';
import type { CollectionEntry } from 'astro:content';
import { assemblePages } from '../src/lib/astropilot/pages.js';
import { routeFromPageId, withBase } from '../src/lib/astropilot/urls.js';

test('derives normalized routes from page metadata paths', () => {
    assert.equal(routeFromPageId('page.yaml'), '/');
    assert.equal(routeFromPageId('faq/page.yaml'), '/faq/');
    assert.equal(
        routeFromPageId('leistungen/monitoring/page.yaml'),
        '/leistungen/monitoring/',
    );
});

test('uses optional page URL segments while preserving parent URL segments', () => {
    const urlSegments = new Map([
        ['documentation', 'dokumentation'],
        ['documentation/getting-started', 'einstieg'],
    ]);

    assert.equal(
        routeFromPageId(
            'documentation/getting-started/page.yaml',
            (directory) => urlSegments.get(directory),
        ),
        '/dokumentation/einstieg/',
    );
});

test('assembles page routes from inherited URL segments', () => {
    const pages = [
        {
            id: 'documentation/page',
            data: {
                title: 'Dokumentation',
                description: 'Die Dokumentation.',
                url: 'dokumentation',
            },
        },
        {
            id: 'documentation/getting-started/page',
            data: {
                title: 'Einstieg',
                description: 'Der Einstieg.',
                url: 'einstieg',
            },
        },
    ] as CollectionEntry<'pages'>[];

    const pagesWithRoutes = assemblePages(pages, []);

    assert.deepEqual(
        pagesWithRoutes.map((page) => page.route),
        ['/dokumentation/', '/dokumentation/einstieg/'],
    );
});
test('applies a deployment base exactly once to root-relative URLs', () => {
    assert.equal(withBase('/faq/', '/demo/'), '/demo/faq/');
    assert.equal(withBase('/', '/demo/'), '/demo/');
    assert.equal(
        withBase('https://example.com', '/demo/'),
        'https://example.com',
    );
});

test('recognizes generated section IDs and sorts them numerically', () => {
    const pages = [
        {
            id: 'page',
            data: { title: 'Startseite', description: 'Eine Testseite.' },
        },
    ] as CollectionEntry<'pages'>[];
    const documents = [
        { id: '02-benefits', data: { tone: 'muted' } },
        { id: 'hero', data: { title: 'Willkommen', tone: 'brand' } },
        { id: '01-introduction', data: { tone: 'default' } },
    ] as CollectionEntry<'documents'>[];

    const [page] = assemblePages(pages, documents);

    assert.equal(page.hero?.id, 'hero');
    assert.deepEqual(
        page.sections.map((section) => section.id),
        ['01-introduction', '02-benefits'],
    );
});
