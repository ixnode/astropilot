import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { contentHref } from './urls';
import type { SiteConfig } from './types';

export function remarkContentLinks(site: SiteConfig) {
  return (tree: Root) => {
    visit(tree, 'link', (node) => {
      node.url = contentHref(node.url, site);
    });
  };
}
