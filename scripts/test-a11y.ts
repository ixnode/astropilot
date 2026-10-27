import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const port = 4325;
const server = spawn('npm', ['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(port)], { stdio: 'ignore' });
const baseUrl = `http://127.0.0.1:${port}`;

async function waitForServer(): Promise<void> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try { if ((await fetch(baseUrl)).ok) return; } catch { /* server is starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error('Astro dev server did not start');
}

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  for (const viewport of [{ width: 390, height: 844, name: 'mobile' }, { width: 1440, height: 900, name: 'desktop' }]) {
    const context = await browser.newContext({ viewport });
    for (const route of ['/', '/faq/', '/info/', '/kontakt/']) {
      const page = await context.newPage();
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).analyze();
      if (results.violations.length > 0) throw new Error(`${viewport.name} ${route}: ${results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`).join('; ')}`);
      await page.keyboard.press('Tab');
      if (await page.locator(':focus-visible').count() === 0) throw new Error(`${viewport.name} ${route}: no visible keyboard focus after Tab`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      if (overflow) throw new Error(`${viewport.name} ${route}: viewport overflows horizontally`);
      await page.close();
    }
    await context.close();
  }
  await browser.close();
  console.log('Axe, keyboard-focus, and viewport-overflow checks passed for four routes on mobile and desktop.');
} finally {
  server.kill('SIGTERM');
}
