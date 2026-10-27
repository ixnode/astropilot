import { basename } from 'node:path';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

/** Prefixes generated heading IDs with the content filename, avoiding collisions across composed Markdown files. */
export function remarkUniqueHeadingIds() {
  return (tree: Root, file: { path?: string }) => {
    const prefix = basename(file.path ?? 'content', '.md').replace(/[^a-zA-Z0-9-]/g, '-');
    visit(tree, 'heading', (node) => {
      const text = node.children.map((child) => ('value' in child ? child.value : '')).join('').toLowerCase();
      const slug = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'abschnitt';
      const existingProperties = (node.data as { hProperties?: Record<string, string> } | undefined)?.hProperties;
      node.data = { ...node.data, hProperties: { ...existingProperties, id: `${prefix}-${slug}` } };
    });
  };
}
