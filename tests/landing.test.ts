import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateAstroPilotContent } from '../src/lib/astropilot/validation.js';

test('landing pages require one content H1 and reject a hero', () => {
    const directory = mkdtempSync(join(tmpdir(), 'astropilot-landing-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Welcome\ndescription: Entry page.\nlayout: landing\n',
        );
        const section = join(directory, '01-welcome.md');
        writeFileSync(section, '# Welcome\n\n## Offer\n\nPersonal training.\n');
        assert.doesNotThrow(() => validateAstroPilotContent(directory));
        writeFileSync(section, '## Offer\n');
        assert.throws(
            () => validateAstroPilotContent(directory),
            /exactly one visible h1/,
        );
        writeFileSync(section, '# Welcome\n\n# Duplicate\n');
        assert.throws(
            () => validateAstroPilotContent(directory),
            /exactly one visible h1/,
        );
        writeFileSync(section, '# Welcome\n');
        writeFileSync(join(directory, 'hero.md'), '---\ntitle: Hero\n---\n');
        assert.throws(
            () => validateAstroPilotContent(directory),
            /must not contain hero/,
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
