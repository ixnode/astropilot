import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url));
const contentTypes: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.xml': 'application/xml; charset=utf-8',
};

function outputPath(pathname: string): string | undefined {
    const file = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const resolved = resolve(distDirectory, `.${decodeURIComponent(file)}`);
    const pathFromDist = relative(distDirectory, resolved);
    return pathFromDist.startsWith('..') || pathFromDist === ''
        ? undefined
        : resolved;
}

const previewServer = createServer(async (request, response) => {
    try {
        const pathname = new URL(request.url ?? '/', 'http://127.0.0.1')
            .pathname;
        const file = outputPath(pathname);
        if (!file) {
            response.writeHead(404).end();
            return;
        }
        const body = await readFile(file);
        response
            .writeHead(200, {
                'content-type':
                    contentTypes[extname(file)] ?? 'application/octet-stream',
            })
            .end(body);
    } catch {
        response.writeHead(404).end();
    }
});

const port = await new Promise<number>((resolvePort, reject) => {
    previewServer.once('error', reject);
    previewServer.listen(0, '127.0.0.1', () => {
        const address = previewServer.address();
        if (!address || typeof address === 'string') {
            reject(new Error('Could not determine the local preview port'));
            return;
        }
        resolvePort(address.port);
    });
});
const baseUrl = `http://127.0.0.1:${port}`;
const routes = [
    '/showcase/tabs/',
    '/',
    '/faq/',
    '/info/',
    '/kontakt/',
    '/dokumentation/',
    '/dokumentation/einstieg/',
    '/dokumentation/inhalte/',
    '/dokumentation/layout/',
    '/dokumentation/theme/',
    '/dokumentation/pruefen/',
    '/dokumentation/paket/',
    '/showcase/',
    '/showcase/foundations/',
    '/showcase/layout/',
    '/showcase/typografie/',
    '/showcase/navigation/',
    '/showcase/sections/',
    '/showcase/alerts/',
    '/showcase/images/',
    '/showcase/cards/',
] as const;

async function waitForServer(): Promise<void> {
    for (let attempt = 0; attempt < 40; attempt += 1) {
        try {
            if ((await fetch(baseUrl)).ok) return;
        } catch {
            /* server is starting */
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error('Static preview server did not start');
}

try {
    await waitForServer();
    const browser = await chromium.launch({ headless: true });
    for (const viewport of [
        { width: 390, height: 844, name: 'mobile' },
        { width: 1440, height: 900, name: 'desktop' },
    ]) {
        const context = await browser.newContext({ viewport });
        for (const route of routes) {
            const page = await context.newPage();
            await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
            const header = page.locator('.ap-header');
            const initialHeaderPosition = await header.evaluate(
                (element) => getComputedStyle(element).position,
            );
            if (initialHeaderPosition !== 'absolute')
                throw new Error(
                    `${viewport.name} ${route}: header is not transparent before scrolling`,
                );
            const results = await new AxeBuilder({ page }).analyze();
            if (results.violations.length > 0)
                throw new Error(
                    `${viewport.name} ${route}: ${results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`).join('; ')}`,
                );
            await page.keyboard.press('Tab');
            if ((await page.locator(':focus-visible').count()) === 0)
                throw new Error(
                    `${viewport.name} ${route}: no visible keyboard focus after Tab`,
                );
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth > window.innerWidth,
            );
            if (overflow)
                throw new Error(
                    `${viewport.name} ${route}: viewport overflows horizontally`,
                );
            if (route === '/showcase/tabs/') {
                const examples = page.locator('.content-prose > .ap-tabs');
                assert.equal(await examples.count(), 3);
                assert.equal(await page.locator('.ap-tabs').count(), 6);
                const groups = examples.locator(
                    ':scope > .ap-tab > .ap-tab__content > .ap-tabs',
                );
                assert.equal(await groups.count(), 3);
                for (let index = 0; index < 3; index += 1) {
                    const example = examples.nth(index);
                    const outerTabs = example
                        .locator(':scope > .ap-tabs__list')
                        .getByRole('tab');
                    assert.equal(await outerTabs.count(), 2);
                    assert.equal(
                        await outerTabs.nth(0).getAttribute('aria-selected'),
                        'true',
                    );
                    const group = groups.nth(index);
                    const tabs = group.locator(
                        ':scope > .ap-tabs__list > [role="tab"]',
                    );
                    assert.equal(await tabs.count(), 3);
                    assert.equal(
                        await group
                            .locator('.ap-tabs__list')
                            .evaluate(
                                (element) => getComputedStyle(element).flexWrap,
                            ),
                        'nowrap',
                    );
                    const initial = index === 1 ? 1 : 0;
                    assert.equal(
                        await tabs.nth(initial).getAttribute('aria-selected'),
                        'true',
                    );
                    assert.equal(await group.getByRole('tabpanel').count(), 1);
                    for (let tab = 0; tab < 3; tab += 1) {
                        const button = tabs.nth(tab);
                        const panelId =
                            await button.getAttribute('aria-controls');
                        const panel = group.locator(`[id="${panelId}"]`);
                        assert.equal(
                            await panel.getAttribute('aria-labelledby'),
                            await button.getAttribute('id'),
                        );
                        await button.click();
                        assert.equal(
                            await button.getAttribute('aria-selected'),
                            'true',
                        );
                        assert.equal(await panel.isVisible(), true);
                        if (index === 2) {
                            const listBounds = await group
                                .locator('.ap-tabs__list')
                                .boundingBox();
                            const panelBounds = await panel.boundingBox();
                            const tabBounds = await button.boundingBox();
                            assert(listBounds && panelBounds);
                            assert(tabBounds);
                            assert(
                                Math.abs(
                                    listBounds.y +
                                        listBounds.height -
                                        panelBounds.y -
                                        1,
                                ) < 1,
                                'Lifted tabs must join the panel without a gap',
                            );
                            assert(
                                Math.abs(
                                    tabBounds.y +
                                        tabBounds.height -
                                        panelBounds.y -
                                        1,
                                ) < 1,
                                'The active lifted tab must touch its panel',
                            );
                        }
                    }
                    await tabs.nth(2).press('ArrowRight');
                    assert.equal(
                        await tabs.nth(0).getAttribute('aria-selected'),
                        'true',
                    );
                    await tabs.nth(0).press('ArrowLeft');
                    assert.equal(
                        await tabs.nth(2).getAttribute('aria-selected'),
                        'true',
                    );
                    await tabs.nth(2).press('Home');
                    assert.equal(
                        await tabs.nth(0).getAttribute('aria-selected'),
                        'true',
                    );
                    await tabs.nth(0).press('End');
                    assert.equal(
                        await tabs.nth(2).getAttribute('aria-selected'),
                        'true',
                    );
                    await page.keyboard.press('Tab');
                    assert.equal(
                        await group
                            .getByRole('tabpanel')
                            .evaluate(
                                (element) => element === document.activeElement,
                            ),
                        true,
                    );
                    const activeResults = await new AxeBuilder({
                        page,
                    }).analyze();
                    assert.deepEqual(
                        activeResults.violations.map(
                            (violation) => violation.id,
                        ),
                        [],
                    );
                    assert.equal(
                        await outerTabs.nth(0).getAttribute('aria-selected'),
                        'true',
                        'Inner keyboard navigation must leave the outer selection unchanged',
                    );
                    await outerTabs.nth(1).click();
                    assert.equal(await group.isVisible(), false);
                    const code = example
                        .locator(':scope > .ap-tab')
                        .nth(1)
                        .locator('pre[data-language="mdx"]');
                    assert.equal(await code.isVisible(), true);
                    const source = await code.innerText();
                    assert(
                        source.includes(
                            "import { Tabs, Tab } from 'astropilot/components';",
                        ),
                    );
                    assert(!source.includes('Vorschau und Code'));
                    if (index === 0)
                        assert(
                            source.includes('```sh'),
                            'The inner shell fence must remain part of the MDX sample',
                        );
                    assert.equal(
                        await tabs.nth(2).getAttribute('aria-selected'),
                        'true',
                        'Hiding the preview must preserve the inner selection',
                    );
                    assert(
                        await page.evaluate(
                            () =>
                                document.documentElement.scrollWidth <=
                                innerWidth,
                        ),
                    );
                    await outerTabs.nth(1).press('ArrowLeft');
                    assert.equal(
                        await outerTabs.nth(0).getAttribute('aria-selected'),
                        'true',
                    );
                    assert.equal(await tabs.nth(2).isVisible(), true);
                    assert.equal(
                        await tabs.nth(2).getAttribute('aria-selected'),
                        'true',
                        'Returning to the preview must preserve the inner selection',
                    );
                }
                assert.equal(
                    await groups
                        .nth(0)
                        .getByRole('tab')
                        .nth(2)
                        .getAttribute('aria-selected'),
                    'true',
                );
                const ids = await page
                    .locator('[id]')
                    .evaluateAll((elements) =>
                        elements.map((element) => element.id),
                    );
                assert.equal(new Set(ids).size, ids.length);
                await page.evaluate(() => window.scrollTo(0, 0));
            }
            if (route === '/showcase/sections/') {
                const groups = page.locator('.ap-tabs');
                const tones = ['default', 'muted', 'brand', 'muted', 'default'];
                const fullWidths = [true, true, true, false, true];
                const widths: number[] = [];
                assert.equal(await groups.count(), 5);
                for (let index = 0; index < tones.length; index += 1) {
                    const group = groups.nth(index);
                    const preview = group.getByRole('tab', {
                        name: 'Vorschau',
                        exact: true,
                    });
                    const code = group.getByRole('tab', {
                        name: 'Code',
                        exact: true,
                    });
                    assert.equal(
                        await preview.getAttribute('aria-selected'),
                        'true',
                    );
                    const sectionState = await group.evaluate((element) => {
                        const section = element.closest('.ap-section');
                        const content =
                            section?.querySelector('.content-prose');
                        if (!section || !content)
                            throw new Error('Missing Section container');
                        return {
                            classes: Array.from(section.classList),
                            constrained: content.classList.contains(
                                'ap-section__content',
                            ),
                            width: content.getBoundingClientRect().width,
                        };
                    });
                    assert(
                        sectionState.classes.includes(`tone-${tones[index]}`),
                    );
                    assert.equal(sectionState.constrained, !fullWidths[index]);
                    widths.push(sectionState.width);
                    const heading = await group
                        .getByRole('tabpanel')
                        .getByRole('heading')
                        .innerText();
                    await code.click();
                    const sample = group
                        .getByRole('tabpanel')
                        .locator('pre[data-language="markdown"]');
                    const source = await sample.innerText();
                    assert(source.startsWith('---\n'));
                    assert(source.includes(`tone: ${tones[index]}`));
                    assert(source.includes(`fullWidth: ${fullWidths[index]}`));
                    assert(source.includes(`## ${heading}`));
                    assert.equal(await sample.isVisible(), true);
                    assert(
                        await page.evaluate(
                            () =>
                                document.documentElement.scrollWidth <=
                                innerWidth,
                        ),
                    );
                    await code.press('ArrowLeft');
                    assert.equal(
                        await preview.getAttribute('aria-selected'),
                        'true',
                    );
                }
                if (viewport.name === 'desktop') assert(widths[3] < widths[4]);
                else assert.equal(widths[3], widths[4]);
                await page.evaluate(() => window.scrollTo(0, 0));
            }
            const canScroll = await page.evaluate(
                () =>
                    document.documentElement.scrollHeight -
                        window.innerHeight >=
                    10,
            );
            if (!canScroll) {
                await page.close();
                continue;
            }
            await page.evaluate(() => window.scrollTo(0, 10));
            await page.waitForFunction(() =>
                document
                    .querySelector('.ap-header')
                    ?.classList.contains('ap-header--scrolled'),
            );
            const scrolledHeader = await header.evaluate((element) => {
                const styles = getComputedStyle(element);
                return {
                    backdropFilter: styles.backdropFilter,
                    position: styles.position,
                };
            });
            if (
                scrolledHeader.position !== 'fixed' ||
                scrolledHeader.backdropFilter === 'none'
            )
                throw new Error(
                    `${viewport.name} ${route}: header does not use the fixed glass state after scrolling`,
                );
            await page.close();
        }
        await context.close();
    }
    const staticContext = await browser.newContext({
        javaScriptEnabled: false,
        viewport: { width: 390, height: 844 },
    });
    const staticPage = await staticContext.newPage();
    await staticPage.goto(`${baseUrl}/showcase/tabs/`);
    assert.equal(await staticPage.locator('.ap-tab:visible').count(), 15);
    assert.equal(
        await staticPage.locator('.ap-tab__label:visible').count(),
        15,
    );
    assert.equal(await staticPage.locator('.ap-tabs__list:visible').count(), 0);
    await staticContext.close();
    await browser.close();
    console.log(
        `Axe, keyboard-focus, and viewport-overflow checks passed for ${routes.length} routes on mobile and desktop.`,
    );
} finally {
    await new Promise<void>((resolveClose, reject) => {
        previewServer.close((error) =>
            error ? reject(error) : resolveClose(),
        );
    });
}
