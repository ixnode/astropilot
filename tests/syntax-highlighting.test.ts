import assert from 'node:assert/strict';
import test from 'node:test';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { createSproutsiteConfig } from '../src/package/config.js';

test('highlights MDX imports, embedded JSX, and other fenced code languages', async () => {
    const { shikiConfig } = createSproutsiteConfig().markdown;
    const processor = await createMarkdownProcessor({ shikiConfig });
    const examples = [
        {
            language: 'mdx',
            source: 'import { Card } from "sproutsite/components";\n\n<Card image={picture}>\n\n#### Example\n\n</Card>',
            minimumColors: 4,
        },
        {
            language: 'typescript',
            source: 'const title: string = "Example";',
            minimumColors: 2,
        },
        {
            language: 'yaml',
            source: 'title: Example\nenabled: true',
            minimumColors: 2,
        },
        {
            language: 'css',
            source: '.example { color: red; padding: 1rem; }',
            minimumColors: 2,
        },
    ];
    for (const { language, source, minimumColors } of examples) {
        const { code } = await processor.render(
            `\`\`\`${language}\n${source}\n\`\`\``,
        );
        assert(code.includes(`data-language="${language}"`));
        const colors = new Set(
            Array.from(
                code.matchAll(/style="color:([^";]+)/g),
                (match) => match[1],
            ),
        );
        assert(
            colors.size >= minimumColors,
            `${language} should contain distinct syntax token colors`,
        );
    }
});
