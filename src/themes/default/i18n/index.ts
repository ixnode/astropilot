import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { parse } from 'yaml';

const messagesSchema = z
    .object({
        skipToContent: z.string().trim().min(1),
        primaryNavigation: z.string().trim().min(1),
        footerNavigation: z.string().trim().min(1),
        home: z.string().trim().min(1),
    })
    .strict();

export type Locale = 'en' | 'de';
export type MessageKey = keyof z.infer<typeof messagesSchema>;

function loadMessages(locale: Locale) {
    const url = new URL(`./${locale}.yaml`, import.meta.url);
    const source = readFileSync(fileURLToPath(url), 'utf8');
    return messagesSchema.parse(parse(source));
}

const messages: Record<Locale, z.infer<typeof messagesSchema>> = {
    en: loadMessages('en'),
    de: loadMessages('de'),
};

export function t(locale: Locale, key: MessageKey): string {
    return messages[locale][key];
}
