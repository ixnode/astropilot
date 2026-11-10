import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateSproutsiteContent } from '../src/lib/sproutsite/validation.js';
import { withBase } from '../src/lib/sproutsite/urls.js';

test('validates query links against their page path and preserves fragment checks', () => {
    const directory = mkdtempSync(join(tmpdir(), 'sproutsite-query-links-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Start\ndescription: Link examples.\n',
        );
        mkdirSync(join(directory, 'faq'));
        writeFileSync(
            join(directory, 'faq/page.yaml'),
            'title: FAQ\ndescription: Answers.\n',
        );
        const section = join(directory, '01-links.md');
        writeFileSync(
            section,
            '## Links\n\n[FAQ](/faq/?ref=showcase)\n\n[FAQ title](/faq?ref=showcase#page-title)\n',
        );
        assert.doesNotThrow(() => validateSproutsiteContent(directory));
        assert.equal(
            withBase('/faq/?ref=showcase#page-title', '/demo/'),
            '/demo/faq/?ref=showcase#page-title',
        );
        writeFileSync(
            section,
            '## Links\n\n[Missing page](/missing/?ref=showcase)\n',
        );
        assert.throws(
            () => validateSproutsiteContent(directory),
            /internal link target does not exist/,
        );
        writeFileSync(
            section,
            '## Links\n\n[Missing fragment](/faq/?ref=showcase#missing)\n',
        );
        assert.throws(
            () => validateSproutsiteContent(directory),
            /internal link fragment does not exist/,
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
