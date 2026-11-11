import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateSproutsiteContent } from '../src/lib/sproutsite/validation.js';

test('accepts multiple rows while rejecting invalid Column spans', () => {
    const directory = mkdtempSync(join(tmpdir(), 'sproutsite-columns-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Columns\ndescription: Multiple rows of content.\n',
        );
        const section = (span: number) =>
            `import { Column, Columns } from 'sproutsite/components';\n\n## Multiple rows\n\n<Columns>\n${Array.from({ length: 8 }, () => `<Column span={${span}}>\n\nContent\n\n</Column>`).join('\n\n')}\n</Columns>\n`;
        const sectionPath = join(directory, '01-columns.mdx');
        writeFileSync(sectionPath, section(4));
        assert.doesNotThrow(() => validateSproutsiteContent(directory));
        writeFileSync(sectionPath, section(6));
        assert.doesNotThrow(() => validateSproutsiteContent(directory));
        writeFileSync(sectionPath, section(13));
        assert.throws(
            () => validateSproutsiteContent(directory),
            /numeric span prop from 1 to 12/,
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
