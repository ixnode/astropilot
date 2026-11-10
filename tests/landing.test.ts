import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateSproutsiteContent } from '../src/lib/sproutsite/validation.js';

test('landing pages require one content H1 and reject a hero', () => {
    const directory = mkdtempSync(join(tmpdir(), 'sproutsite-landing-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Welcome\ndescription: Entry page.\nlayout: landing\n',
        );
        const section = join(directory, '01-welcome.md');
        writeFileSync(section, '# Welcome\n\n## Offer\n\nPersonal training.\n');
        assert.doesNotThrow(() => validateSproutsiteContent(directory));
        writeFileSync(section, '## Offer\n');
        assert.throws(
            () => validateSproutsiteContent(directory),
            /exactly one visible h1/,
        );
        writeFileSync(section, '# Welcome\n\n# Duplicate\n');
        assert.throws(
            () => validateSproutsiteContent(directory),
            /exactly one visible h1/,
        );
        writeFileSync(section, '# Welcome\n');
        writeFileSync(join(directory, 'hero.md'), '---\ntitle: Hero\n---\n');
        assert.throws(
            () => validateSproutsiteContent(directory),
            /must not contain hero/,
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
