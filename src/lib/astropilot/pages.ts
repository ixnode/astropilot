import type { CollectionEntry } from 'astro:content';
import { pageDirectoryFromId, routeFromPageId } from './urls';
import type { Tone } from './types';

type PageEntry = CollectionEntry<'pages'>;
type DocumentEntry = CollectionEntry<'documents'>;

export interface AssembledPage {
    entry: PageEntry;
    route: string;
    hero?: DocumentEntry;
    sections: DocumentEntry[];
}

const sectionName = /(?:^|\/)(\d{2,})-[a-z0-9][a-z0-9-]*$/;

export function assemblePages(
    pageEntries: PageEntry[],
    documentEntries: DocumentEntry[],
): AssembledPage[] {
    const pageUrlByDirectory = new Map(
        pageEntries.map((entry) => [
            pageDirectoryFromId(entry.id),
            entry.data.url,
        ]),
    );
    const pages = pageEntries.map((entry) => {
        const directory = pageDirectoryFromId(entry.id);
        const prefix = directory === '' ? '' : `${directory}/`;
        const ownDocuments = documentEntries.filter(
            (document) =>
                document.id.startsWith(prefix) &&
                !document.id.slice(prefix.length).includes('/'),
        );
        const hero = ownDocuments.find(
            (document) => document.id === `${prefix}hero`,
        );
        const sections = ownDocuments
            .filter((document) => sectionName.test(document.id))
            .sort(
                (left, right) =>
                    Number(sectionName.exec(left.id)?.[1]) -
                    Number(sectionName.exec(right.id)?.[1]),
            );
        return {
            entry,
            route: routeFromPageId(entry.id, (path) =>
                pageUrlByDirectory.get(path),
            ),
            hero,
            sections,
        };
    });
    return pages.sort((left, right) => left.route.localeCompare(right.route));
}

export function toneOf(document: DocumentEntry): Tone {
    return document.data.tone;
}
