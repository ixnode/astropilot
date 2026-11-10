import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { Element, Root } from 'hast';
import { validateSproutsiteContent } from '../src/lib/sproutsite/validation.js';
import { rehypeContentTables } from '../src/lib/sproutsite/rehype-tables.js';

const markdownTable =
    '| Name | Count |\n| :--- | ---: |\n| First | 1 |\n| Second | 2 |';

test('validates ContentTable options and an actual Markdown table', () => {
    const directory = mkdtempSync(join(tmpdir(), 'sproutsite-table-'));
    try {
        writeFileSync(
            join(directory, 'page.yaml'),
            'title: Tables\ndescription: Table examples.\n',
        );
        const validate = (props: string, children = markdownTable) => {
            writeFileSync(
                join(directory, '01-tables.mdx'),
                `import { ContentTable } from 'sproutsite/components';\n\n## Tables\n\n<ContentTable ${props}>\n\n${children}\n\n</ContentTable>\n`,
            );
            validateSproutsiteContent(directory);
        };
        assert.doesNotThrow(() => validate('caption="Example"'));
        assert.doesNotThrow(() =>
            validate(
                'caption="Example" variant="striped" density="compact" highlight={2} wide',
            ),
        );
        for (const props of [
            '',
            'caption=""',
            'caption="Example" variant="unknown"',
            'caption="Example" density="large"',
            'caption="Example" wide="true"',
            'caption="Example" class="custom"',
            'caption="Example" caption="Duplicate"',
            'caption="Example" highlight={0}',
            'caption="Example" highlight={3}',
            'caption="Example" highlight={1.5}',
            'caption="Example" highlight={1 + 1}',
        ])
            assert.throws(() => validate(props), /ContentTable requires/);
        assert.throws(
            () => validate('caption="Example"', 'Only a paragraph.'),
            /exactly one Markdown table/,
        );
        assert.throws(
            () =>
                validate(
                    'caption="Example"',
                    `${markdownTable}\n\nExtra paragraph.`,
                ),
            /exactly one Markdown table/,
        );
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});

test('adds native caption and column scopes without injecting caption markup', () => {
    const header: Element = {
        type: 'element',
        tagName: 'th',
        properties: {},
        children: [{ type: 'text', value: 'Name' }],
    };
    const rows: Element[] = [0, 1].map(() => ({
        type: 'element',
        tagName: 'tr',
        properties: {},
        children: [],
    }));
    const table: Element = {
        type: 'element',
        tagName: 'table',
        properties: {},
        children: [
            {
                type: 'element',
                tagName: 'thead',
                properties: {},
                children: [
                    {
                        type: 'element',
                        tagName: 'tr',
                        properties: {},
                        children: [header],
                    },
                ],
            },
            {
                type: 'element',
                tagName: 'tbody',
                properties: {},
                children: rows,
            },
        ],
    };
    // Astro's MDX pipeline extends HAST with this JSX parent node.
    const tree = {
        type: 'root',
        children: [
            {
                type: 'mdxJsxFlowElement',
                name: 'ContentTable',
                attributes: [
                    {
                        type: 'mdxJsxAttribute',
                        name: 'caption',
                        value: '<strong>Names & values</strong>',
                    },
                    {
                        type: 'mdxJsxAttribute',
                        name: 'highlight',
                        value: { value: '2' },
                    },
                ],
                children: [table],
            },
        ],
    } as unknown as Root;
    rehypeContentTables()(tree);
    const caption = table.children[0];
    assert.equal(caption.type, 'element');
    if (caption.type !== 'element') throw new Error('Expected native caption');
    assert.equal(caption.tagName, 'caption');
    assert.deepEqual(caption.children, [
        { type: 'text', value: '<strong>Names & values</strong>' },
    ]);
    assert.equal(header.properties.scope, 'col');
    assert.equal(rows[0].properties['data-highlighted'], undefined);
    assert.equal(rows[1].properties['data-highlighted'], 'true');
    rehypeContentTables()(tree);
    assert.equal(
        table.children.filter(
            (node) => node.type === 'element' && node.tagName === 'caption',
        ).length,
        1,
    );
});
