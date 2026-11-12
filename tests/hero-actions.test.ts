import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateSproutsiteContent } from '../src/lib/sproutsite/validation.js';

test('validates shared hero actions and their link protocols', () => {
    const directory = mkdtempSync(join(tmpdir(), 'sproutsite-hero-actions-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Start\ndescription: A start page.\n',
        );
        const hero = join(directory, 'hero.md');
        writeFileSync(
            hero,
            `---
title: Start
titleHighlight: art
actions:
    - label: Get started
      href: /
      variant: primary
    - label: Source
      href: https://example.com/source
      variant: secondary
tagline: A concise claim.
claim: A prominent message.
---

Introduction.
`,
        );
        assert.doesNotThrow(() => validateSproutsiteContent(directory));

        writeFileSync(
            hero,
            `---
title: Start
titleHighlight: Sproutsite
---

Introduction.
`,
        );
        assert.throws(
            () => validateSproutsiteContent(directory),
            /titleHighlight: must occur in title/,
        );

        writeFileSync(
            hero,
            `---
title: Start
actions:
    - label: Unsafe
      href: javascript:alert(1)
      variant: primary
---
`,
        );
        assert.throws(
            () => validateSproutsiteContent(directory),
            /disallowed hero action link protocol/,
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
