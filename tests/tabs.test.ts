import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { validateAstroPilotContent } from '../src/lib/astropilot/validation';

function validate(body: string): void {
    const directory = mkdtempSync(join(tmpdir(), 'astropilot-tabs-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Tabs\ndescription: Tab examples.\n',
        );
        writeFileSync(
            join(directory, '01-tabs.mdx'),
            `import { Tabs, Tab } from 'astropilot/components';\n\n## Tab examples\n\n${body}\n`,
        );
        validateAstroPilotContent(directory);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
}

const panels =
    '<Tab title="Overview">\n\nAn overview.\n\n</Tab>\n\n<Tab title="Details">\n\nDetails.\n\n</Tab>';

test('accepts independent Tabs groups and all documented variants', () => {
    for (const variant of ['border', 'box', 'lift']) {
        assert.doesNotThrow(() =>
            validate(
                `<Tabs label="First" variant="${variant}" initial={2}>\n${panels}\n</Tabs>\n\n<Tabs label="Second">\n${panels}\n</Tabs>`,
            ),
        );
    }
});

test('rejects invalid Tabs props and child relationships', () => {
    for (const props of [
        'label=""',
        'label="Example" variant="unknown"',
        'label="Example" initial={0}',
        'label="Example" initial={3}',
        'label="Example" initial={1.5}',
        'label="Example" initial="1"',
        'label="Example" class="custom"',
        'label="Example" initial={1 + 1}',
    ]) {
        assert.throws(
            () => validate(`<Tabs ${props}>\n${panels}\n</Tabs>`),
            /Tabs requires/,
        );
    }
    assert.throws(() => validate('<Tabs label="Empty" />'), /Tabs requires/);
    assert.throws(
        () => validate('<Tab title="Orphan">\n\nContent\n\n</Tab>'),
        /Tab must be a direct child/,
    );
    assert.throws(
        () =>
            validate(
                '<Tabs label="Group">\n<Tab title="">\n\nContent\n\n</Tab>\n</Tabs>',
            ),
        /non-empty title/,
    );
    assert.throws(
        () => validate('<Tabs label="Group">\n\nUnwrapped content\n\n</Tabs>'),
        /Tabs requires/,
    );
});
