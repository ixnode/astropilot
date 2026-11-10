import type { CollectionEntry } from 'astro:content';
import { pageDirectoryFromId, routeFromPageId } from './urls.js';
import type { Tone } from './types.js';

type PageEntry = CollectionEntry<'pages'>;
type DocumentEntry = CollectionEntry<'documents'>;
type PageEntryLike = { id: string; data: object };
type DocumentEntryLike = { id: string; data: { tone: Tone } };

export interface AssembledPage<
    TPage extends PageEntryLike = PageEntry,
    TDocument extends DocumentEntryLike = DocumentEntry,
> {
    entry: TPage;
    route: string;
    hero?: TDocument;
    sections: TDocument[];
}

const sectionName = /(?:^|\/)(\d{2,})-[a-z0-9][a-z0-9-]*$/;

export function assemblePages<
    TPage extends PageEntryLike,
    TDocument extends DocumentEntryLike,
>(
    pageEntries: TPage[],
    documentEntries: TDocument[],
    routeForPage?: (entry: TPage) => string,
): AssembledPage<TPage, TDocument>[] {
    const pageUrlByDirectory = new Map(
        pageEntries.map((entry) => [
            pageDirectoryFromId(entry.id),
            (entry.data as { url?: string }).url,
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
            route:
                routeForPage?.(entry) ??
                routeFromPageId(entry.id, (path) =>
                    pageUrlByDirectory.get(path),
                ),
            hero,
            sections,
        };
    });
    return pages.sort((left, right) => left.route.localeCompare(right.route));
}

export function toneOf(document: DocumentEntryLike): Tone {
    return document.data.tone;
}
