import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ignored = new Set(['node_modules', 'dist', '.astro', '.git']);
function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    if (ignored.has(name)) return [];
    const path = join(directory, name);
    return statSync(path).isDirectory() ? sourceFiles(path) : [path];
  });
}
const violations = sourceFiles('.').filter((path) => /\.(?:js|mjs|cjs)$/.test(path));
if (violations.length > 0) throw new Error(`Own JavaScript source files are forbidden: ${violations.join(', ')}`);
console.log('No own JavaScript source files found.');
