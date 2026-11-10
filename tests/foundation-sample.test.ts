import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateSproutsiteContent } from '../src/lib/sproutsite/validation.js';

test('accepts documented FoundationSample kinds and rejects arbitrary props or children', () => {
    const directory = mkdtempSync(
        join(tmpdir(), 'sproutsite-foundation-sample-'),
    );
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Samples\ndescription: Visual foundations.\n',
        );
        const section = join(directory, '01-samples.mdx');
        const validate = (component: string) => {
            writeFileSync(
                section,
                `import { FoundationSample } from 'sproutsite/components';\n\n## Samples\n\n${component}\n`,
            );
            validateSproutsiteContent(directory);
        };
        for (const kind of [
            'colors',
            'type',
            'spacing',
            'radius',
            'shadow',
            'focus',
        ])
            assert.doesNotThrow(() =>
                validate(`<FoundationSample kind="${kind}" />`),
            );
        for (const component of [
            '<FoundationSample />',
            '<FoundationSample kind="unknown" />',
            '<FoundationSample kind={"colors"} />',
            '<FoundationSample kind="colors" class="custom" />',
            '<FoundationSample kind="colors">\n\nUnexpected content\n\n</FoundationSample>',
        ])
            assert.throws(
                () => validate(component),
                /FoundationSample accepts exactly one kind/,
            );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
