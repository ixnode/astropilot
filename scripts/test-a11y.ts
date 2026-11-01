import { readFile } from 'node:fs/promises';
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
        for (const route of [
            '/',
            '/faq/',
            '/info/',
            '/showcase/',
            '/kontakt/',
        ]) {
            const page = await context.newPage();
            await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
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
            await page.close();
        }
        await context.close();
    }
    await browser.close();
    console.log(
        'Axe, keyboard-focus, and viewport-overflow checks passed for five routes on mobile and desktop.',
    );
} finally {
    await new Promise<void>((resolveClose, reject) => {
        previewServer.close((error) =>
            error ? reject(error) : resolveClose(),
        );
    });
}
