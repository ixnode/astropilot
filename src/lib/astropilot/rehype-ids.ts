import { basename } from 'node:path';
import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

/** Prefixes Astro-generated heading IDs with the content filename, avoiding collisions across composed documents. */
export function rehypeUniqueHeadingIds() {
  return (tree: Root, file: { path?: string }) => {
    const prefix = basename(file.path ?? 'content').replace(/\.(?:md|mdx)$/, '').replace(/[^a-zA-Z0-9-]/g, '-');
    visit(tree, 'element', (node) => {
      if (!/^h[1-6]$/.test(node.tagName) || typeof node.properties.id !== 'string') return;
      node.properties.id = `${prefix}-${node.properties.id}`;
    });
  };
}
