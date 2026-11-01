import assert from 'node:assert/strict';
import test from 'node:test';
import type { CollectionEntry } from 'astro:content';
import { assemblePages } from '../src/lib/astropilot/pages';
import { routeFromPageId, withBase } from '../src/lib/astropilot/urls';

test('derives normalized routes from page metadata paths', () => {
  assert.equal(routeFromPageId('page.yaml'), '/');
  assert.equal(routeFromPageId('faq/page.yaml'), '/faq/');
  assert.equal(routeFromPageId('leistungen/monitoring/page.yaml'), '/leistungen/monitoring/');
});
test('applies a deployment base exactly once to root-relative URLs', () => {
  assert.equal(withBase('/faq/', '/demo/'), '/demo/faq/');
  assert.equal(withBase('/', '/demo/'), '/demo/');
  assert.equal(withBase('https://example.com', '/demo/'), 'https://example.com');
});

test('recognizes Astro-normalized section IDs and sorts them numerically', () => {
  const pages = [{ id: 'page', data: { title: 'Startseite', description: 'Eine Testseite.' } }] as CollectionEntry<'pages'>[];
  const documents = [
    { id: '02-sectionvorteile', data: { tone: 'muted' } },
    { id: 'hero', data: { title: 'Willkommen', tone: 'brand' } },
    { id: '01-sectioneinleitung', data: { tone: 'default' } },
  ] as CollectionEntry<'documents'>[];

  const [page] = assemblePages(pages, documents);

  assert.equal(page.hero?.id, 'hero');
  assert.deepEqual(page.sections.map((section) => section.id), ['01-sectioneinleitung', '02-sectionvorteile']);
});
