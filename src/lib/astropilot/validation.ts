import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import GithubSlugger from 'github-slugger';
import type { Root } from 'mdast';
import { z } from 'zod';
import { parse as parseYaml } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';
import { loadSiteConfig } from './site-config';
import { tones } from './types';
import { routeFromPageId } from './urls';

const pageSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
});
const markdownSchema = z
    .object({
        tone: z.enum(tones).optional(),
        eyebrow: z.string().trim().min(1).optional(),
    })
    .strict();
const heroSchema = markdownSchema.extend({ title: z.string().trim().min(1) });
const sectionPattern = /^\d{2,}-[a-z0-9][a-z0-9-]*\.(?:md|mdx)$/;
const mdxComponentImport =
    /^import\s*\{\s*Column\s*,\s*Columns\s*\}\s*from\s*['"]astropilot\/components['"];?$/;

interface MdxNode {
    type: string;
    name?: string | null;
    value?: string;
    attributes?: MdxAttribute[];
    children?: MdxNode[];
}

interface MdxAttribute {
    type: string;
    name?: string;
    value?: string | { type: string; value?: string } | null;
}

function filesIn(directory: string): string[] {
    return readdirSync(directory).flatMap((name) => {
        const path = join(directory, name);
        return statSync(path).isDirectory() ? filesIn(path) : [path];
    });
}

function fail(contentRoot: string, path: string, message: string): never {
    const displayPath =
        relative(process.cwd(), path) || relative(contentRoot, path);
    throw new Error(`${displayPath}: ${message}`);
}

function contentDirectory(contentRoot: string, path: string): string {
    const directory = relative(contentRoot, join(path, '..')).replaceAll(
        '\\',
        '/',
    );
    return directory === '.' ? '' : directory;
}

function frontmatterAndTree(path: string) {
    const source = readFileSync(path, 'utf8');
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    const frontmatter = match ? parseYaml(match[1]) : {};
    const body = match ? source.slice(match[0].length) : source;
    const processor = unified().use(remarkParse);
    if (path.endsWith('.mdx')) processor.use(remarkMdx);
    return { frontmatter, tree: processor.parse(body) };
}

function validateMdxLayout(
    contentRoot: string,
    path: string,
    tree: Root,
): void {
    let hasComponentImport = false;
    let columnsCount = 0;
    const validatedColumns = new Set<MdxNode>();

    visit(tree, (node) => {
        const mdxNode = node as MdxNode;
        if (mdxNode.type === 'mdxjsEsm') {
            if (!mdxComponentImport.test(mdxNode.value?.trim() ?? ''))
                fail(
                    contentRoot,
                    path,
                    'MDX may only import Column and Columns from astropilot/components',
                );
            hasComponentImport = true;
        }
        if (
            mdxNode.type === 'mdxFlowExpression' ||
            mdxNode.type === 'mdxTextExpression'
        )
            fail(contentRoot, path, 'MDX expressions are not allowed');
        if (
            mdxNode.type === 'mdxJsxFlowElement' ||
            mdxNode.type === 'mdxJsxTextElement'
        ) {
            if (mdxNode.name === 'Columns') {
                columnsCount += 1;
                const columns = (mdxNode.children ?? []).filter(
                    (child) => child.type === 'mdxJsxFlowElement',
                );
                if (
                    mdxNode.attributes?.length !== 0 ||
                    columns.length < 1 ||
                    columns.length > 4 ||
                    columns.some((column) => column.name !== 'Column')
                )
                    fail(
                        contentRoot,
                        path,
                        'Columns must contain one to four direct Column components and no props',
                    );
                const spans = columns.map((column) => {
                    validatedColumns.add(column);
                    if ((column.attributes?.length ?? 0) === 0) return 12;
                    const span = column.attributes?.find(
                        (attribute) =>
                            attribute.type === 'mdxJsxAttribute' &&
                            attribute.name === 'span',
                    );
                    const spanValue = span?.value;
                    const value =
                        spanValue !== null && typeof spanValue === 'object'
                            ? spanValue.value
                            : undefined;
                    const numericValue = Number(value);
                    if (
                        column.attributes?.length !== 1 ||
                        !Number.isInteger(numericValue) ||
                        numericValue < 1 ||
                        numericValue > 12
                    )
                        fail(
                            contentRoot,
                            path,
                            'Column accepts no props for span 12 or exactly one numeric span prop from 1 to 12',
                        );
                    return numericValue;
                });
                if (spans.reduce((sum, span) => sum + span, 0) > 12)
                    fail(
                        contentRoot,
                        path,
                        'the Column spans in one Columns layout must not exceed 12',
                    );
            } else if (mdxNode.name === 'Column') {
                if (!validatedColumns.has(mdxNode))
                    fail(
                        contentRoot,
                        path,
                        'Column must be a direct child of Columns',
                    );
            } else {
                fail(
                    contentRoot,
                    path,
                    `unsupported MDX component: ${mdxNode.name ?? 'anonymous'}`,
                );
            }
        }
    });

    if (!hasComponentImport || columnsCount === 0)
        fail(
            contentRoot,
            path,
            'MDX section requires a Columns layout and its AstroPilot component import',
        );
}

/** Validates AstroPilot's file-based content contract in the current Astro project. */
export function validateAstroPilotContent(
    contentRoot = resolve(process.cwd(), 'src/content/pages'),
): void {
    const site = loadSiteConfig();
    const allFiles = filesIn(contentRoot);
    const pageFiles = allFiles.filter((path) => path.endsWith('/page.yaml'));
    const pageDirectories = new Set(
        pageFiles.map((path) => contentDirectory(contentRoot, path)),
    );
    const routes = new Set<string>();
    const headingsByRoute = new Map<string, Set<string>>();

    for (const pagePath of pageFiles) {
        const parsed = pageSchema.safeParse(
            parseYaml(readFileSync(pagePath, 'utf8')),
        );
        if (!parsed.success)
            fail(
                contentRoot,
                pagePath,
                `invalid page metadata: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
            );
        const directory = contentDirectory(contentRoot, pagePath);
        const route = routeFromPageId(
            `${directory === '' ? '' : `${directory}/`}page.yaml`,
        );
        if (routes.has(route))
            fail(contentRoot, pagePath, `URL collision at ${route}`);
        routes.add(route);
        headingsByRoute.set(route, new Set(['page-title']));
    }

    for (const path of allFiles) {
        const filename = path.split('/').at(-1)!;
        if (filename === 'page.yaml') continue;
        const directory = contentDirectory(contentRoot, path);
        if (!pageDirectories.has(directory))
            fail(
                contentRoot,
                path,
                'hero or section file has no directly associated page.yaml',
            );
        if (filename !== 'hero.md' && !sectionPattern.test(filename))
            fail(
                contentRoot,
                path,
                'invalid content filename; expected hero.md or NN-name.md(x)',
            );
        const { frontmatter, tree } = frontmatterAndTree(path);
        const metadata = (
            filename === 'hero.md' ? heroSchema : markdownSchema
        ).safeParse(frontmatter);
        if (!metadata.success)
            fail(
                contentRoot,
                path,
                `invalid frontmatter: ${metadata.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
            );
        if (path.endsWith('.mdx')) validateMdxLayout(contentRoot, path, tree);
        const route = directory === '' ? '/' : `/${directory}/`;
        const seen = headingsByRoute.get(route)!;
        const headingSlugger = new GithubSlugger();
        let firstHeading: number | undefined;
        let previousHeading = 0;
        visit(tree, (node) => {
            if (node.type === 'html')
                fail(contentRoot, path, 'raw HTML is not allowed in Markdown');
            if (node.type === 'heading') {
                firstHeading ??= node.depth;
                if (node.depth === 1)
                    fail(contentRoot, path, 'Markdown must not contain an h1');
                if (previousHeading > 0 && node.depth > previousHeading + 1)
                    fail(
                        contentRoot,
                        path,
                        `heading level jumps from h${previousHeading} to h${node.depth}`,
                    );
                previousHeading = node.depth;
                const text = node.children
                    .map((child) => ('value' in child ? child.value : ''))
                    .join('');
                const id = `${filename.replace(/\.(?:md|mdx)$/, '')}-${headingSlugger.slug(text)}`;
                if (seen.has(id))
                    fail(
                        contentRoot,
                        path,
                        `duplicate generated heading id ${id}`,
                    );
                seen.add(id);
            }
            if (node.type === 'link') {
                const href = node.url;
                if (
                    /^(?:javascript:|data:)/i.test(href) ||
                    href.startsWith('//')
                )
                    fail(
                        contentRoot,
                        path,
                        `disallowed link protocol: ${href}`,
                    );
                if (href.startsWith('/')) {
                    const [target, fragment] = href.split('#', 2);
                    const normalized =
                        target === ''
                            ? '/'
                            : target.endsWith('/')
                              ? target
                              : `${target}/`;
                    if (!routes.has(normalized))
                        fail(
                            contentRoot,
                            path,
                            `internal link target does not exist: ${href}`,
                        );
                    if (
                        fragment &&
                        !headingsByRoute.get(normalized)?.has(fragment)
                    )
                        fail(
                            contentRoot,
                            path,
                            `internal link fragment does not exist: ${href}`,
                        );
                }
            }
        });
        if (filename !== 'hero.md' && firstHeading !== 2)
            fail(contentRoot, path, 'a section must begin with an h2');
    }

    for (const directory of pageDirectories) {
        const sections = allFiles.filter(
            (path) =>
                contentDirectory(contentRoot, path) === directory &&
                sectionPattern.test(path.split('/').at(-1)!),
        );
        const numbers = new Set<number>();
        for (const section of sections) {
            const number = Number(
                section.split('/').at(-1)!.match(/^\d+/)?.[0],
            );
            if (numbers.has(number))
                fail(
                    contentRoot,
                    section,
                    `duplicate section number ${number}`,
                );
            numbers.add(number);
        }
    }
    if (site.base !== '/' && !site.base.endsWith('/'))
        fail(
            contentRoot,
            resolve('src/content/site.yaml'),
            'base must end in /',
        );
}
