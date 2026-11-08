import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { parse } from 'yaml';
import type { SiteConfig } from './types.js';

const linkSchema = z.object({
    label: z.string().trim().min(1),
    href: z.string().trim().min(1),
});
const heroClass = z.string().regex(/^ap-[a-z0-9][a-z0-9_-]*$/, {
    message:
        'must start with ap- and contain only lowercase letters, digits, underscores, or hyphens',
});

const siteSchema = z.object({
    name: z.string().trim().min(1),
    url: z.url(),
    base: z
        .string()
        .regex(/^\/(?:[^/].*)?\/$|^\/$/, 'must be / or begin and end with /'),
    language: z
        .string()
        .regex(/^[a-z]{2}(?:-[A-Z]{2})?$/, 'must be a BCP 47 language tag'),
    'hero-classes': z.array(heroClass).max(8).default([]),
    blog: z
        .object({
            title: z.string().trim().min(1),
            description: z.string().trim().min(1),
            eyebrow: z.string().trim().min(1),
            heading: z.string().trim().min(1),
        })
        .optional(),
    header: z.object({ links: z.array(linkSchema).min(1) }),
    footer: z.object({
        text: z.string().trim().min(1),
        links: z.array(linkSchema),
    }),
});

export function loadSiteConfig(): SiteConfig {
    const source = resolve(process.cwd(), 'src/content/site.yaml');
    const raw = parse(readFileSync(source, 'utf8'));
    const parsed = siteSchema.safeParse(raw);
    if (!parsed.success) {
        throw new Error(
            `Invalid src/content/site.yaml: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`,
        );
    }
    const { 'hero-classes': heroClasses, ...site } = parsed.data;
    const config: SiteConfig = { ...site, heroClasses };
    const environmentBase = process.env.ASTROPILOT_BASE;
    if (environmentBase === undefined) return config;
    const base = siteSchema.shape.base.safeParse(environmentBase);
    if (!base.success)
        throw new Error(
            `Invalid ASTROPILOT_BASE: ${base.error.issues[0]?.message}`,
        );
    return { ...config, base: base.data };
}
