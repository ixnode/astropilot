import assert from 'node:assert/strict';
import test from 'node:test';
import { unified } from '@astrojs/markdown-remark';
import { isExternalWebLink } from '../src/lib/astropilot/urls.js';
import { rehypeExternalLinks } from '../src/lib/astropilot/rehype-links.js';

test('classifies external web links against the production origin', () => {
    const site = 'https://example.com';
    for (const href of [
        'https://docs.astro.build/',
        'http://other.test/',
        'https://example.com.evil.test/',
        'https://example.com@other.test/',
        'https://sub.example.com/',
        'https://example.com:8443/',
    ])
        assert.equal(isExternalWebLink(href, site), true, href);
    for (const href of [
        '/faq/',
        '/demo/faq/?ref=docs#page-title',
        '#main-content',
        '?next=https://other.test/',
        'https://example.com/faq/',
        'HTTPS://EXAMPLE.COM:443/faq/',
        'mailto:hallo@other.test',
        'tel:+4930123456',
    ])
        assert.equal(isExternalWebLink(href, site), false, href);
});

test('renders direct, reference and autolinks with the required external attributes', async () => {
    const renderer = await unified({
        rehypePlugins: [[rehypeExternalLinks, 'https://example.com']],
    }).createRenderer({});
    const { code } = await renderer.render(
        [
            '[Direct](https://docs.astro.build/)',
            '[Reference][documentation]',
            '<https://other.test/>',
            '[Internal](/faq/)',
            '[Same origin](https://example.com/info/)',
            '[Mail](mailto:hello@other.test)',
            '[Telephone](tel:+4930123456)',
            '[documentation]: https://docs.astro.build/en/guides/markdown-content/',
        ].join('\n\n'),
    );
    const anchors = Array.from(
        code.matchAll(/<a\b([^>]*)>(.*?)<\/a>/g),
        (match) => ({ attributes: match[1], label: match[2] }),
    );
    assert.equal(anchors.length, 7);
    for (const anchor of anchors) {
        if (
            ['Direct', 'Reference', 'https://other.test/'].includes(
                anchor.label,
            )
        ) {
            assert(anchor.attributes.includes('target="_blank"'), anchor.label);
            assert(
                anchor.attributes.includes('rel="noopener noreferrer"'),
                anchor.label,
            );
        } else {
            assert(!anchor.attributes.includes('target='), anchor.label);
            assert(!anchor.attributes.includes('rel='), anchor.label);
        }
    }
});
