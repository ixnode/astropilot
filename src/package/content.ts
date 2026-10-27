import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { tones } from '../lib/astropilot/types';

/** Creates the two Astro collections required by the AstroPilot content contract. */
export function createAstroPilotCollections(contentDirectory = './src/content/pages') {
  const tone = z.enum(tones).default('default');

  const pages = defineCollection({
    loader: glob({ base: contentDirectory, pattern: '**/page.yaml' }),
    schema: z.object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
    }),
  });

  const documents = defineCollection({
    loader: glob({ base: contentDirectory, pattern: '**/*.md' }),
    schema: z.object({
      eyebrow: z.string().trim().min(1).optional(),
      tone,
    }),
  });

  return { pages, documents };
}
