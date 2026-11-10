import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

interface TableWrapper {
    type: string;
    name?: string;
    attributes?: Array<{
        type: string;
        name?: string;
        value?: string | { value?: string } | null;
    }>;
}

/** Add native table semantics using Astro's existing Markdown/MDX tree. */
export function rehypeContentTables() {
    return (tree: Root) => {
        visit(tree, 'element', (table, _index, parent) => {
            if (table.tagName !== 'table') return;
            const wrapper = parent as TableWrapper | undefined;
            if (
                wrapper?.type !== 'mdxJsxFlowElement' ||
                wrapper.name !== 'ContentTable'
            )
                return;
            const caption = wrapper.attributes?.find(
                (attribute) => attribute.name === 'caption',
            )?.value;
            if (typeof caption !== 'string' || !caption.trim())
                throw new Error('ContentTable requires a non-empty caption.');
            if (
                !table.children.some(
                    (child) =>
                        child.type === 'element' && child.tagName === 'caption',
                )
            )
                table.children.unshift({
                    type: 'element',
                    tagName: 'caption',
                    properties: {},
                    children: [{ type: 'text', value: caption }],
                });
            visit(table, 'element', (cell) => {
                if (cell.tagName === 'th') cell.properties.scope = 'col';
            });
            const highlight = wrapper.attributes?.find(
                (attribute) => attribute.name === 'highlight',
            );
            if (!highlight) return;
            const rowNumber = Number(
                highlight.value && typeof highlight.value === 'object'
                    ? highlight.value.value
                    : undefined,
            );
            const body = table.children.find(
                (child): child is Element =>
                    child.type === 'element' && child.tagName === 'tbody',
            );
            const rows =
                body?.children.filter(
                    (child): child is Element =>
                        child.type === 'element' && child.tagName === 'tr',
                ) ?? [];
            if (
                !Number.isInteger(rowNumber) ||
                rowNumber < 1 ||
                rowNumber > rows.length
            )
                throw new Error(
                    'ContentTable highlight must refer to an existing body row.',
                );
            rows[rowNumber - 1].properties['data-highlighted'] = 'true';
        });
    };
}
