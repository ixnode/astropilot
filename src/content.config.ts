import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const tone = z.enum(['default', 'muted', 'brand']).default('default');

const pages = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/page.yaml' }),
  schema: z.object({
    title: z.string().trim().min(1),
    description: z.string().trim().min(1),
  }),
});

const documents = defineCollection({
  loader: glob({ base: './src/content/pages', pattern: '**/*.md' }),
  schema: z.object({
    eyebrow: z.string().trim().min(1).optional(),
    tone,
  }),
});

export const collections = { pages, documents };
