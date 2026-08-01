#!/usr/bin/env node
/**
 * Scans assets/ and writes src/assets.generated.ts.
 *
 * The character of each image is derived from its filename prefix so that the
 * disableSteve / disableMonsters options can filter client-side without a server.
 * See assets/README.md for the convention.
 */
import { readdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ASSET_DIR = join(ROOT, 'assets');
const OUT_FILE = join(ROOT, 'src', 'assets.generated.ts');

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']);
const PREFIXES = [
    ['steve-', 'steve'],
    ['monster-', 'monster']
];

const files = readdirSync(ASSET_DIR)
    .filter((name) => IMAGE_EXTENSIONS.has(extname(name).toLowerCase()))
    .sort();

if (files.length === 0) {
    console.error(`No images found in ${ASSET_DIR}. See assets/README.md for the naming convention.`);
    process.exit(1);
}

const entries = files.map((file) => {
    const match = PREFIXES.find(([prefix]) => file.toLowerCase().startsWith(prefix));
    return { file, character: match ? match[1] : 'hedgie' };
});

const counts = entries.reduce((acc, { character }) => {
    acc[character] = (acc[character] || 0) + 1;
    return acc;
}, {});

const body = `/**
 * GENERATED FILE - DO NOT EDIT.
 *
 * Regenerate with \`npm run assets\` after changing the contents of assets/.
 */
import type { HedgehogAsset } from './types';

/** Every bundled image, tagged with the character it depicts. */
export const ASSETS: readonly HedgehogAsset[] = [
${entries.map(({ file, character }) => `    { file: '${file}', character: '${character}' }`).join(',\n')}
];
`;

const previous = (() => {
    try {
        return readFileSync(OUT_FILE, 'utf8');
    } catch {
        return null;
    }
})();

if (previous === body) {
    console.log(`assets: up to date (${entries.length} images)`);
} else {
    writeFileSync(OUT_FILE, body);
    const summary = Object.entries(counts)
        .map(([character, count]) => `${count} ${character}`)
        .join(', ');
    console.log(`assets: wrote ${entries.length} images to src/assets.generated.ts (${summary})`);
}
