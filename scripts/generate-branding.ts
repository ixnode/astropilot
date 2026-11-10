import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { openSync } from 'fontkit';
import sharp from 'sharp';

// The reference is redrawn as vector geometry. Raster assets are derived from
// these paths, never cropped from the reference. Nunito is already licensed
// and stored in this repository; standalone SVG wordmarks contain outlines.
const theme = new URL('../src/themes/default/', import.meta.url);
const output = new URL('assets/branding/', theme);
await mkdir(output, { recursive: true });
const tokens = await readFile(
    new URL('styles/foundation/tokens.css', theme),
    'utf8',
);
function color(name: string): string {
    const value = tokens.match(
        new RegExp(`--color-brand-${name}:\\s*(#[a-f0-9]{6})`, 'i'),
    )?.[1];
    if (!value) throw new Error(`Missing brand token: ${name}`);
    return value;
}
const navy = color('navy');
const white = color('white');
const definitions = `<defs>
    <linearGradient id="turquoise" x2="1" y2="1"><stop stop-color="${color('turquoise')}"/><stop offset="1" stop-color="#08b9ae"/></linearGradient>
    <linearGradient id="cyan" x2="1" y2="1"><stop stop-color="${color('cyan')}"/><stop offset="1" stop-color="#0084ac"/></linearGradient>
    <linearGradient id="blue" x2="1" y2="1"><stop stop-color="${color('blue')}"/><stop offset="1" stop-color="#064886"/></linearGradient>
    <linearGradient id="green" x2="0.35" y2="1"><stop stop-color="${color('light-green')}"/><stop offset="0.5" stop-color="${color('green')}"/><stop offset="1" stop-color="#35b919"/></linearGradient>
</defs>`;
const layers = [
    [
        'blue',
        'M 37 254 L 62 244 L 140 274 Q 160 282 180 274 L 258 244 L 283 254 Q 298 261 283 269 L 180 309 Q 160 317 140 309 L 37 269 Q 22 262 37 254 Z',
    ],
    [
        'cyan',
        'M 37 207 L 62 197 L 140 227 Q 160 235 180 227 L 258 197 L 283 207 Q 298 214 283 222 L 180 262 Q 160 270 140 262 L 37 222 Q 22 215 37 207 Z',
    ],
    [
        'turquoise',
        'M 37 160 L 102 135 Q 115 130 128 135 L 160 147 L 210 132 Q 224 127 237 132 L 283 150 Q 298 157 283 165 L 180 205 Q 160 213 140 205 L 37 175 Q 22 168 37 160 Z',
    ],
];
const leaves = [
    'M 177 126 C 165 78 145 45 94 47 Q 86 47 88 56 C 94 101 119 124 160 120 Z',
    'M 181 116 C 179 57 214 19 275 23 Q 283 23 281 32 C 275 85 238 116 195 111 Z',
    'M 173 166 L 173 127 Q 172 115 160 107 L 166 98 Q 176 104 181 116 Q 186 103 194 97 L 201 104 Q 189 117 189 132 L 189 166 Q 181 171 173 166 Z',
];
function symbol(monochrome = false): string {
    const fill = (name: string) =>
        monochrome ? 'currentColor' : `url(#${name})`;
    return `${monochrome ? '' : definitions}${layers.map(([name, path]) => `<path fill="${fill(name!)}" d="${path}"/>`).join('')}<path fill="${monochrome ? 'currentColor' : color('green')}" d="${leaves[2]}"/>${leaves
        .slice(0, 2)
        .map((path) => `<path fill="${fill('green')}" d="${path}"/>`)
        .join('')}`;
}
function svg(
    body: string,
    width = 320,
    height = 320,
    label = 'Sproutsite',
): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}">${body}</svg>\n`;
}
const sourceFont = openSync(
    fileURLToPath(new URL('./assets/nunito-variable.ttf', import.meta.url)),
);
if (!('layout' in sourceFont))
    throw new Error('Expected a single Nunito font.');
const font = sourceFont.getVariation({ wght: 800 });
function lettering(
    text: string,
    size: number,
    x: number,
    y: number,
    fill: string,
    tracking = 0,
): { paths: string; width: number } {
    const run = font.layout(text);
    const scale = size / font.unitsPerEm;
    let cursor = 0;
    const paths = run.glyphs
        .map((glyph, index) => {
            const position = run.positions[index]!;
            const path = `<path transform="translate(${x + cursor + position.xOffset * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})" d="${glyph.path.toSVG()}"/>`;
            cursor += position.xAdvance * scale + tracking;
            return path;
        })
        .join('');
    return {
        paths: `<g fill="${fill}">${paths}</g>`,
        width: cursor - tracking,
    };
}
function lockup(ink: string, monochrome = false): string {
    const word = lettering('Sproutsite', 184, 350, 202, ink);
    const text = 'THE AGENT-READY STATIC CMS';
    const natural = lettering(text, 31, 363, 271, ink);
    const tracking = (word.width - 26 - natural.width) / (text.length - 1);
    const tagline = lettering(text, 31, 363, 271, ink, tracking);
    return svg(
        `${symbol(monochrome)}${word.paths}${tagline.paths}`,
        Math.ceil(350 + word.width + 16),
        320,
    );
}
const icon = svg(symbol());
// Flat fills stay crisp at tab sizes; preserve all three separated layers.
const small = icon
    .replace(definitions, '')
    .replaceAll('url(#turquoise)', color('turquoise'))
    .replaceAll('url(#cyan)', color('cyan'))
    .replaceAll('url(#blue)', color('blue'))
    .replaceAll('url(#green)', color('green'));
const files: Record<string, string> = {
    'logo.svg': lockup(navy),
    'logo-dark.svg': lockup(white),
    'logo-monochrome.svg': lockup('currentColor', true),
    'icon.svg': icon,
    'icon-monochrome.svg': svg(symbol(true)),
    'favicon.svg': small,
};
for (const [name, content] of Object.entries(files))
    await writeFile(new URL(name, output), content);
const faviconPngs: Buffer[] = [];
for (const size of [16, 32, 48]) {
    const png = await sharp(Buffer.from(small))
        .resize(size, size)
        .png()
        .toBuffer();
    faviconPngs.push(png);
    await writeFile(new URL(`favicon-${size}x${size}.png`, output), png);
}
// ICO directories can contain lossless PNG frames; keep native 16/32/48 sizes.
const directory = Buffer.alloc(6 + 16 * faviconPngs.length);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(faviconPngs.length, 4);
let offset = directory.length;
faviconPngs.forEach((png, index) => {
    const start = 6 + index * 16;
    directory[start] = directory[start + 1] = [16, 32, 48][index]!;
    directory.writeUInt16LE(1, start + 4);
    directory.writeUInt16LE(32, start + 6);
    directory.writeUInt32LE(png.length, start + 8);
    directory.writeUInt32LE(offset, start + 12);
    offset += png.length;
});
await writeFile(
    new URL('favicon.ico', output),
    Buffer.concat([directory, ...faviconPngs]),
);
for (const size of [180, 192, 512]) {
    const app = svg(
        `<rect width="320" height="320" rx="55" fill="${navy}"/><g transform="translate(35 30) scale(0.78)">${symbol()}</g>`,
    );
    await sharp(Buffer.from(app))
        .resize(size, size)
        .png()
        .toFile(
            fileURLToPath(
                new URL(
                    size === 180
                        ? 'apple-touch-icon.png'
                        : `icon-${size}x${size}.png`,
                    output,
                ),
            ),
        );
}
const socialWord = lettering('Sproutsite', 142, 390, 329, white);
const socialTagline = lettering(
    'THE AGENT-READY STATIC CMS',
    23,
    400,
    387,
    white,
    2.4,
);
await sharp(
    Buffer.from(
        svg(
            `<rect width="1200" height="630" fill="${navy}"/><g transform="translate(60 145)">${symbol()}</g>${socialWord.paths}${socialTagline.paths}`,
            1200,
            630,
        ),
    ),
)
    .png()
    .toFile(fileURLToPath(new URL('social-card.png', output)));
console.log(
    'Generated Sproutsite SVG logos, favicons, app icons, and social card.',
);
