import type { Root } from 'hast';
import { visit } from 'unist-util-visit';
import { isExternalWebLink } from './urls';

/** Apply the same external-link behavior after Markdown references and autolinks resolve. */
export function rehypeExternalLinks(siteUrl: string) {
    return (tree: Root) => {
        visit(tree, 'element', (node) => {
            if (
                node.tagName !== 'a' ||
                typeof node.properties.href !== 'string'
            )
                return;
            if (!isExternalWebLink(node.properties.href, siteUrl)) return;
            node.properties.target = '_blank';
            node.properties.rel = ['noopener', 'noreferrer'];
        });
    };
}
