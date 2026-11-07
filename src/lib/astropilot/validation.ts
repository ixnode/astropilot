import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import GithubSlugger from 'github-slugger';
import type { Root } from 'mdast';
import { z } from 'zod';
import { parse as parseYaml } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { loadSiteConfig } from './site-config';
import { tones } from './types';
import { routeFromPageId } from './urls';

const pageSchema = z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
    url: z
        .string()
        .trim()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
            message: 'must use lowercase letters, digits, and hyphens',
        })
        .optional(),
});
const markdownSchema = z
    .object({
        tone: z.enum(tones).optional(),
        eyebrow: z.string().trim().min(1).optional(),
    })
    .strict();
const sectionSchema = markdownSchema.extend({
    fullWidth: z.boolean().optional(),
});
const heroClass = z.string().regex(/^ap-[a-z0-9][a-z0-9_-]*$/, {
    message:
        'must start with ap- and contain only lowercase letters, digits, underscores, or hyphens',
});
const heroSchema = markdownSchema.extend({
    title: z.string().trim().min(1),
    classes: z.array(heroClass).max(8).nullable().optional(),
});
const sectionPattern = /^\d{2,}-[a-z0-9][a-z0-9-]*\.(?:md|mdx)$/;
const mdxComponentImport =
    /^import\s*\{\s*Column\s*,\s*Columns(?:\s*,\s*Eyebrow)?\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const eyebrowComponentImport =
    /^import\s*\{\s*Eyebrow\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const alertComponentImport =
    /^import\s*\{\s*Alert\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const contentImageComponentImport =
    /^import\s*\{\s*ContentImage\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const cardComponentImport =
    /^import\s*\{\s*Card(?:\s*,\s*CardActions)?\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const tabsComponentImport =
    /^import\s*\{\s*Tabs\s*,\s*Tab\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const contentTableImport =
    /^import\s*\{\s*ContentTable\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const foundationSampleImport =
    /^import\s*\{\s*FoundationSample\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const buttonComponentImport =
    /^import\s*\{\s*Button\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const badgeComponentImport =
    /^import\s*\{\s*Badge\s*\}\s*from\s*['"]astropilot\/components['"];?$/;
const localImageImport =
    /^import\s+([A-Za-z_$][\w$]*)\s+from\s+['"](?:\.\.\/|\.\/)[a-z0-9_][a-z0-9._/-]*\.(?:avif|jpe?g|png|webp)['"];?$/i;
const imageExtensions = new Set(['.avif', '.jpeg', '.jpg', '.png', '.webp']);

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

function isReservedContentDirectory(directory: string): boolean {
    return directory.split('/').some((segment) => segment.startsWith('_'));
}

function frontmatterAndTree(path: string) {
    const source = readFileSync(path, 'utf8');
    const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
    const frontmatter = match ? parseYaml(match[1]) : {};
    const body = match ? source.slice(match[0].length) : source;
    const processor = unified().use(remarkParse).use(remarkGfm);
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
    let tabsCount = 0;
    let contentTableCount = 0;
    let foundationSampleCount = 0;
    let alertCount = 0;
    let contentImageCount = 0;
    let cardCount = 0;
    let eyebrowCount = 0;
    let buttonCount = 0;
    let badgeCount = 0;
    const localImageImports = new Set<string>();
    const validatedColumns = new Set<MdxNode>();
    const validatedTabs = new Set<MdxNode>();
    const validatedCardActions = new Set<MdxNode>();

    visit(tree, (node) => {
        const mdxNode = node as MdxNode;
        if (mdxNode.type === 'mdxjsEsm') {
            const imports = (mdxNode.value?.trim() ?? '')
                .split('\n')
                .map((statement) => statement.trim())
                .filter(Boolean);
            for (const importValue of imports) {
                const localImageMatch = importValue.match(localImageImport);
                if (localImageMatch) {
                    localImageImports.add(localImageMatch[1]);
                    continue;
                }
                if (
                    !mdxComponentImport.test(importValue) &&
                    !eyebrowComponentImport.test(importValue) &&
                    !alertComponentImport.test(importValue) &&
                    !contentImageComponentImport.test(importValue) &&
                    !cardComponentImport.test(importValue) &&
                    !tabsComponentImport.test(importValue) &&
                    !foundationSampleImport.test(importValue) &&
                    !contentTableImport.test(importValue) &&
                    !buttonComponentImport.test(importValue) &&
                    !badgeComponentImport.test(importValue)
                )
                    fail(
                        contentRoot,
                        path,
                        'MDX may only import supported components from astropilot/components and local relative images',
                    );
                hasComponentImport = true;
            }
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
            if (mdxNode.name === 'ContentTable') {
                contentTableCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const caption = attributes.find(
                    (attribute) => attribute.name === 'caption',
                );
                const variant = attributes.find(
                    (attribute) => attribute.name === 'variant',
                );
                const density = attributes.find(
                    (attribute) => attribute.name === 'density',
                );
                const wide = attributes.find(
                    (attribute) => attribute.name === 'wide',
                );
                const highlight = attributes.find(
                    (attribute) => attribute.name === 'highlight',
                );
                const highlightValue = highlight?.value;
                const rowNumber = Number(
                    highlightValue && typeof highlightValue === 'object'
                        ? highlightValue.value
                        : undefined,
                );
                const children = (mdxNode.children ?? []).filter(
                    (child) => !(child.type === 'text' && !child.value?.trim()),
                );
                const table = children[0];
                const rowCount = (table?.children?.length ?? 1) - 1;
                if (
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            ![
                                'caption',
                                'variant',
                                'density',
                                'wide',
                                'highlight',
                            ].includes(attribute.name ?? ''),
                    ) ||
                    new Set(attributes.map((attribute) => attribute.name))
                        .size !== attributes.length ||
                    typeof caption?.value !== 'string' ||
                    !caption.value.trim() ||
                    (variant &&
                        !['plain', 'striped'].includes(
                            String(variant.value),
                        )) ||
                    (density &&
                        !['comfortable', 'compact'].includes(
                            String(density.value),
                        )) ||
                    (wide && wide.value !== null) ||
                    children.length !== 1 ||
                    table?.type !== 'table' ||
                    (highlight &&
                        (!Number.isInteger(rowNumber) ||
                            rowNumber < 1 ||
                            rowNumber > rowCount))
                )
                    fail(
                        contentRoot,
                        path,
                        'ContentTable requires a caption and exactly one Markdown table; variant is plain or striped, density is comfortable or compact, wide is a boolean flag, and highlight must be an existing body row number',
                    );
            } else if (mdxNode.name === 'FoundationSample') {
                foundationSampleCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const kind = attributes[0];
                if (
                    attributes.length !== 1 ||
                    kind?.type !== 'mdxJsxAttribute' ||
                    kind.name !== 'kind' ||
                    typeof kind.value !== 'string' ||
                    ![
                        'colors',
                        'type',
                        'spacing',
                        'radius',
                        'shadow',
                        'focus',
                    ].includes(kind.value) ||
                    mdxNode.children?.length
                )
                    fail(
                        contentRoot,
                        path,
                        'FoundationSample accepts exactly one kind: colors, type, spacing, radius, shadow, or focus, and no children',
                    );
            } else if (mdxNode.name === 'Tabs') {
                tabsCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const label = attributes.find(
                    (attribute) => attribute.name === 'label',
                );
                const variant = attributes.find(
                    (attribute) => attribute.name === 'variant',
                );
                const initial = attributes.find(
                    (attribute) => attribute.name === 'initial',
                );
                const initialValue = initial?.value;
                const initialNumber = initial
                    ? Number(
                          initialValue && typeof initialValue === 'object'
                              ? initialValue.value
                              : undefined,
                      )
                    : 1;
                const children = mdxNode.children ?? [];
                const tabs = children.filter(
                    (child) =>
                        child.type === 'mdxJsxFlowElement' &&
                        child.name === 'Tab',
                );
                if (
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            !['label', 'variant', 'initial'].includes(
                                attribute.name ?? '',
                            ),
                    ) ||
                    new Set(attributes.map((attribute) => attribute.name))
                        .size !== attributes.length ||
                    typeof label?.value !== 'string' ||
                    !label.value.trim() ||
                    (variant &&
                        !['border', 'box', 'lift'].includes(
                            String(variant.value),
                        )) ||
                    tabs.length < 1 ||
                    children.some(
                        (child) =>
                            !(
                                child.type === 'mdxJsxFlowElement' &&
                                child.name === 'Tab'
                            ) &&
                            !(child.type === 'text' && !child.value?.trim()),
                    ) ||
                    !Number.isInteger(initialNumber) ||
                    initialNumber < 1 ||
                    initialNumber > tabs.length
                )
                    fail(
                        contentRoot,
                        path,
                        'Tabs requires a non-empty label, direct Tab children, optional variant border, box, or lift, and an initial index from 1 to the number of tabs',
                    );
                tabs.forEach((tab) => validatedTabs.add(tab));
            } else if (mdxNode.name === 'Tab') {
                const attributes = mdxNode.attributes ?? [];
                const title = attributes[0];
                if (
                    !validatedTabs.has(mdxNode) ||
                    attributes.length !== 1 ||
                    title?.type !== 'mdxJsxAttribute' ||
                    title.name !== 'title' ||
                    typeof title.value !== 'string' ||
                    !title.value.trim()
                )
                    fail(
                        contentRoot,
                        path,
                        'Tab must be a direct child of Tabs and accepts exactly one non-empty title',
                    );
            } else if (mdxNode.name === 'Columns') {
                columnsCount += 1;
                const columns = (mdxNode.children ?? []).filter(
                    (child) => child.type === 'mdxJsxFlowElement',
                );
                if (
                    mdxNode.attributes?.length !== 0 ||
                    columns.length < 1 ||
                    columns.some((column) => column.name !== 'Column')
                )
                    fail(
                        contentRoot,
                        path,
                        'Columns must contain at least one direct Column component and no props',
                    );
                columns.forEach((column) => {
                    validatedColumns.add(column);
                    if ((column.attributes?.length ?? 0) === 0) return;
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
                });
            } else if (mdxNode.name === 'Column') {
                if (!validatedColumns.has(mdxNode))
                    fail(
                        contentRoot,
                        path,
                        'Column must be a direct child of Columns',
                    );
            } else if (mdxNode.name === 'Alert') {
                alertCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const variant = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'variant',
                );
                const style = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'style',
                );
                const variantValue = variant?.value;
                const styleValue = style?.value;
                if (
                    attributes.length > 2 ||
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            (attribute.name !== 'variant' &&
                                attribute.name !== 'style'),
                    ) ||
                    (variantValue !== undefined &&
                        variantValue !== 'info' &&
                        variantValue !== 'success' &&
                        variantValue !== 'warning' &&
                        variantValue !== 'error') ||
                    (styleValue !== undefined &&
                        styleValue !== 'normal' &&
                        styleValue !== 'soft' &&
                        styleValue !== 'outline' &&
                        styleValue !== 'dash')
                )
                    fail(
                        contentRoot,
                        path,
                        'Alert accepts optional variant (info, success, warning, error) and style (normal, soft, outline, dash) props',
                    );
            } else if (mdxNode.name === 'Button') {
                buttonCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const variant = attributes.find(
                    (attribute) => attribute.name === 'variant',
                );
                const style = attributes.find(
                    (attribute) => attribute.name === 'style',
                );
                const size = attributes.find(
                    (attribute) => attribute.name === 'size',
                );
                const href = attributes.find(
                    (attribute) => attribute.name === 'href',
                );
                const type = attributes.find(
                    (attribute) => attribute.name === 'type',
                );
                const disabled = attributes.find(
                    (attribute) => attribute.name === 'disabled',
                );
                if (
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            ![
                                'variant',
                                'style',
                                'size',
                                'href',
                                'type',
                                'disabled',
                            ].includes(attribute.name ?? ''),
                    ) ||
                    new Set(attributes.map((attribute) => attribute.name))
                        .size !== attributes.length ||
                    (variant &&
                        ![
                            'primary',
                            'secondary',
                            'accent',
                            'neutral',
                            'info',
                            'success',
                            'warning',
                            'error',
                        ].includes(String(variant.value))) ||
                    (style &&
                        !['solid', 'outline', 'soft', 'ghost', 'link'].includes(
                            String(style.value),
                        )) ||
                    (size &&
                        !['xs', 'sm', 'md', 'lg', 'xl'].includes(
                            String(size.value),
                        )) ||
                    (href &&
                        (typeof href.value !== 'string' ||
                            !href.value.trim() ||
                            /^(?:javascript:|data:|\/\/)/i.test(href.value))) ||
                    (type &&
                        !['button', 'submit', 'reset'].includes(
                            String(type.value),
                        )) ||
                    (disabled && disabled.value !== null) ||
                    (href && (type || disabled))
                )
                    fail(
                        contentRoot,
                        path,
                        'Button accepts optional variant, style, size, href, type, and disabled props; links cannot also have type or disabled',
                    );
            } else if (mdxNode.name === 'Badge') {
                badgeCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const variant = attributes.find(
                    (attribute) => attribute.name === 'variant',
                );
                const style = attributes.find(
                    (attribute) => attribute.name === 'style',
                );
                const size = attributes.find(
                    (attribute) => attribute.name === 'size',
                );
                if (
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            !['variant', 'style', 'size'].includes(
                                attribute.name ?? '',
                            ),
                    ) ||
                    new Set(attributes.map((attribute) => attribute.name))
                        .size !== attributes.length ||
                    (variant &&
                        ![
                            'default',
                            'primary',
                            'secondary',
                            'accent',
                            'neutral',
                            'info',
                            'success',
                            'warning',
                            'error',
                        ].includes(String(variant.value))) ||
                    (style &&
                        !['solid', 'outline', 'soft', 'dash'].includes(
                            String(style.value),
                        )) ||
                    (size &&
                        !['xs', 'sm', 'md', 'lg', 'xl'].includes(
                            String(size.value),
                        ))
                )
                    fail(
                        contentRoot,
                        path,
                        'Badge accepts optional variant, style (solid, outline, soft, dash), and size props',
                    );
            } else if (mdxNode.name === 'Eyebrow') {
                eyebrowCount += 1;
                if (mdxNode.attributes?.length !== 0)
                    fail(contentRoot, path, 'Eyebrow does not accept props');
            } else if (mdxNode.name === 'ContentImage') {
                contentImageCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const attributeNames = attributes.map(
                    (attribute) => attribute.name,
                );
                const src = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'src',
                );
                const alt = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'alt',
                );
                const width = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'width',
                );
                const height = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'height',
                );
                const fullWidth = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'fullWidth',
                );
                const shape = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'shape',
                );
                const border = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'border',
                );
                const srcValue = src?.value;
                const widthValue = width?.value;
                const heightValue = height?.value;
                const srcName =
                    srcValue !== null && typeof srcValue === 'object'
                        ? srcValue.value
                        : undefined;
                const widthNumber = Number(
                    widthValue !== null && typeof widthValue === 'object'
                        ? widthValue.value
                        : undefined,
                );
                const heightNumber = Number(
                    heightValue !== null && typeof heightValue === 'object'
                        ? heightValue.value
                        : undefined,
                );
                if (
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            ![
                                'src',
                                'alt',
                                'width',
                                'height',
                                'fullWidth',
                                'shape',
                                'border',
                            ].includes(attribute.name ?? ''),
                    ) ||
                    new Set(attributeNames).size !== attributeNames.length ||
                    !src ||
                    !localImageImports.has(srcName ?? '') ||
                    typeof alt?.value !== 'string' ||
                    alt.value.trim() === '' ||
                    (width &&
                        (!Number.isInteger(widthNumber) || widthNumber < 1)) ||
                    (height &&
                        (!Number.isInteger(heightNumber) ||
                            heightNumber < 1)) ||
                    (fullWidth && fullWidth.value !== null) ||
                    (shape &&
                        shape.value !== 'rounded' &&
                        shape.value !== 'square') ||
                    (border &&
                        border.value !== 'default' &&
                        border.value !== 'none')
                )
                    fail(
                        contentRoot,
                        path,
                        'ContentImage requires a local image src expression and non-empty alt; optional width and height are positive integers, fullWidth is a boolean prop, shape is rounded or square, and border is default or none',
                    );
            } else if (mdxNode.name === 'Card') {
                cardCount += 1;
                const attributes = mdxNode.attributes ?? [];
                const image = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'image',
                );
                const imageAlt = attributes.find(
                    (attribute) =>
                        attribute.type === 'mdxJsxAttribute' &&
                        attribute.name === 'imageAlt',
                );
                const imageValue = image?.value;
                const imageImport =
                    imageValue !== null && typeof imageValue === 'object'
                        ? imageValue.value
                        : undefined;
                const actions = (mdxNode.children ?? []).filter(
                    (child) =>
                        child.type === 'mdxJsxFlowElement' &&
                        child.name === 'CardActions',
                );
                actions.forEach((action) => validatedCardActions.add(action));
                if (
                    attributes.length > 2 ||
                    attributes.some(
                        (attribute) =>
                            attribute.type !== 'mdxJsxAttribute' ||
                            (attribute.name !== 'image' &&
                                attribute.name !== 'imageAlt'),
                    ) ||
                    Boolean(image) !== Boolean(imageAlt) ||
                    (image && !localImageImports.has(imageImport ?? '')) ||
                    (imageAlt &&
                        (typeof imageAlt.value !== 'string' ||
                            imageAlt.value.trim() === '')) ||
                    actions.length > 1
                )
                    fail(
                        contentRoot,
                        path,
                        'Card accepts image and imageAlt together, or neither; it may contain one direct CardActions component',
                    );
            } else if (mdxNode.name === 'CardActions') {
                if (
                    mdxNode.attributes?.length !== 0 ||
                    !validatedCardActions.has(mdxNode)
                )
                    fail(
                        contentRoot,
                        path,
                        'CardActions must be a direct child of Card and does not accept props',
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

    if (
        !hasComponentImport ||
        (columnsCount === 0 &&
            tabsCount === 0 &&
            contentTableCount === 0 &&
            foundationSampleCount === 0 &&
            alertCount === 0 &&
            contentImageCount === 0 &&
            cardCount === 0 &&
            eyebrowCount === 0 &&
            buttonCount === 0 &&
            badgeCount === 0)
    )
        fail(
            contentRoot,
            path,
            'MDX section requires a supported AstroPilot component and its import',
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
    const pageDataByDirectory = new Map<string, z.infer<typeof pageSchema>>();
    const routes = new Set<string>();
    const headingsByRoute = new Map<string, Set<string>>();

    for (const pagePath of pageFiles) {
        const directory = contentDirectory(contentRoot, pagePath);
        if (isReservedContentDirectory(directory))
            fail(
                contentRoot,
                pagePath,
                'page.yaml is not allowed in a reserved directory beginning with _',
            );
        const parsed = pageSchema.safeParse(
            parseYaml(readFileSync(pagePath, 'utf8')),
        );
        if (!parsed.success)
            fail(
                contentRoot,
                pagePath,
                `invalid page metadata: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
            );
        pageDataByDirectory.set(directory, parsed.data);
    }

    const routeForDirectory = (directory: string): string =>
        routeFromPageId(
            `${directory === '' ? '' : `${directory}/`}page.yaml`,
            (path) => pageDataByDirectory.get(path)?.url,
        );

    for (const pagePath of pageFiles) {
        const directory = contentDirectory(contentRoot, pagePath);
        const route = routeForDirectory(directory);
        if (routes.has(route))
            fail(contentRoot, pagePath, `URL collision at ${route}`);
        routes.add(route);
        headingsByRoute.set(route, new Set(['page-title']));
    }

    for (const path of allFiles) {
        if (imageExtensions.has(extname(path).toLowerCase())) continue;
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
            filename === 'hero.md' ? heroSchema : sectionSchema
        ).safeParse(frontmatter);
        if (!metadata.success)
            fail(
                contentRoot,
                path,
                `invalid frontmatter: ${metadata.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
            );
        if (path.endsWith('.mdx')) validateMdxLayout(contentRoot, path, tree);
        const route = routeForDirectory(directory);
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
                    const [targetWithQuery, fragment] = href.split('#', 2);
                    const [target] = targetWithQuery.split('?', 1);
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
