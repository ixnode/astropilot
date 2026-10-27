import assert from 'node:assert/strict';
import test from 'node:test';
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
