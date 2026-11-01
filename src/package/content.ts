import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { tones } from '../lib/astropilot/types';

/** Creates the two Astro collections required by the AstroPilot content contract. */
export function createAstroPilotCollections(
    contentDirectory = './src/content/pages',
) {
    const tone = z.enum(tones).default('default');
    const heroClass = z.string().regex(/^ap-[a-z0-9][a-z0-9_-]*$/, {
        message:
            'Hero classes must start with ap- and contain only lowercase letters, digits, underscores, or hyphens',
    });

    const pages = defineCollection({
        loader: glob({
            base: contentDirectory,
            pattern: '**/page.yaml',
            generateId: ({ entry }) => entry.replace(/\.yaml$/, ''),
        }),
        schema: z.object({
            title: z.string().trim().min(1),
            description: z.string().trim().min(1),
        }),
    });

    const documents = defineCollection({
        loader: glob({
            base: contentDirectory,
            pattern: '**/*.{md,mdx}',
            generateId: ({ entry }) => entry.replace(/\.(?:md|mdx)$/, ''),
        }),
        schema: z.object({
            title: z.string().trim().min(1).optional(),
            eyebrow: z.string().trim().min(1).optional(),
            classes: z.array(heroClass).max(8).default([]),
            tone,
            fullWidth: z.boolean().default(false),
        }),
    });

    return { pages, documents };
}
