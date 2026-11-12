import { defineCollection, type ImageFunction } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { tones } from '../lib/sproutsite/types.js';

function blogDirectoryId(entry: string): string {
    const match = entry.match(
        /^(\d{4}-\d{2}-\d{2}\.([a-z0-9]+(?:-[a-z0-9]+)*))\/page\.yaml$/,
    );
    if (!match)
        throw new Error(
            `Invalid blog page path ${entry}; expected YYYY-MM-DD.article-slug/page.yaml`,
        );
    return match[1];
}

/** Creates the Astro collections required by the Sproutsite content contract. */
export function createSproutsiteCollections(
    contentDirectory = './src/content/pages',
    blogDirectory = './src/content/blog',
) {
    const tone = z.enum(tones).default('default');
    const heroClass = z.string().regex(/^ss-[a-z0-9][a-z0-9_-]*$/, {
        message:
            'Hero classes must start with ss- and contain only lowercase letters, digits, underscores, or hyphens',
    });
    const heroAction = z
        .object({
            label: z.string().trim().min(1),
            href: z.string().trim().min(1),
            variant: z.enum(['primary', 'secondary']),
        })
        .strict();

    const pages = defineCollection({
        loader: glob({
            base: contentDirectory,
            pattern: '**/page.yaml',
            generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
        }),
        schema: z.object({
            title: z.string().trim().min(1),
            description: z.string().trim().min(1),
            layout: z.enum(['default', 'landing']).default('default'),
            url: z
                .string()
                .trim()
                .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
                    message:
                        'URL segments must use lowercase letters, digits, and hyphens',
                })
                .optional(),
        }),
    });

    const documentSchema = ({ image }: { image: ImageFunction }) =>
        z.object({
            title: z.string().trim().min(1).optional(),
            titleHighlight: z.string().trim().min(1).optional(),
            eyebrow: z.string().trim().min(1).optional(),
            classes: z.array(heroClass).max(8).nullable().optional(),
            'background-image': image().optional(),
            actions: z.array(heroAction).min(1).max(2).optional(),
            claim: z.string().trim().min(1).optional(),
            tagline: z.string().trim().min(1).optional(),
            tone,
            fullWidth: z.boolean().default(false),
        });

    const documents = defineCollection({
        loader: glob({
            base: contentDirectory,
            pattern: '**/*.{md,mdx}',
            generateId: ({ entry }) => entry.replace(/\.(?:md|mdx)$/, ''),
        }),
        schema: documentSchema,
    });

    const blogPages = defineCollection({
        loader: glob({
            base: blogDirectory,
            pattern: '*/page.yaml',
            generateId: ({ entry }) => blogDirectoryId(entry),
        }),
        schema: ({ image }: { image: ImageFunction }) =>
            z.object({
                title: z.string().trim().min(1),
                description: z.string().trim().min(1),
                pubDate: z.coerce.date(),
                image: image(),
                imageAlt: z.string().trim().min(1),
            }),
    });

    const blogDocuments = defineCollection({
        loader: glob({
            base: blogDirectory,
            pattern: '*/*.{md,mdx}',
            generateId: ({ entry }) => entry.replace(/\.(?:md|mdx)$/, ''),
        }),
        schema: documentSchema,
    });

    return { pages, documents, blogPages, blogDocuments };
}
