/**
 * Build-time sanity check for the translations and the content rules:
 *  - every one of the 21 locales has exactly the same keys as pt-PT
 *  - no empty strings
 *  - the name that must not appear on the site is absent from src/ and public/
 *  - no translation API keys or runtime translation calls are present
 * Run with `npm run check:i18n`. It also runs after `astro build`.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const localesDir = join(root, 'src/i18n');
const files = (await readdir(localesDir)).filter((f) => f.endsWith('.ts') && !f.startsWith('index') && f !== 'locales.ts');

const entries = await Promise.all(
  files.map(async (file) => {
    const mod = await import(join(localesDir, file));
    return [file.replace(/\.ts$/, ''), mod.default];
  })
);

const reference = entries.find(([name]) => name === 'pt-PT');
if (!reference) {
  console.error('check-i18n: pt-PT.ts not found');
  process.exit(1);
}
const refKeys = Object.keys(reference[1]).sort();
const errors = [];

for (const [name, dict] of entries) {
  const keys = Object.keys(dict).sort();
  const missing = refKeys.filter((k) => !(k in dict));
  const extra = keys.filter((k) => !(k in reference[1]));
  const empty = keys.filter((k) => !String(dict[k]).trim());
  if (missing.length) errors.push(`${name}: ${missing.length} missing key(s) → ${missing.slice(0, 8).join(', ')}`);
  if (extra.length) errors.push(`${name}: ${extra.length} unknown key(s) → ${extra.slice(0, 8).join(', ')}`);
  if (empty.length) errors.push(`${name}: ${empty.length} empty value(s) → ${empty.slice(0, 8).join(', ')}`);
  if (!('meta.home.title' in dict) || !('meta.privacy.title' in dict)) {
    errors.push(`${name}: metadata keys are missing`);
  }
}

// Content guard: the author's full name must never be rendered by the site.
const forbidden = ['Amós', 'Amos Oliveira', 'Oliveira'];
async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (/\.(astro|ts|tsx|js|mjs|json|md|css|svg|txt)$/.test(entry.name)) out.push(path);
  }
  return out;
}
for (const dir of ['src', 'public']) {
  for (const file of await walk(join(root, dir))) {
    const text = await readFile(file, 'utf8');
    for (const word of forbidden) {
      if (text.includes(word)) errors.push(`${file.replace(root, '')}: forbidden name "${word}"`);
    }
    if (/translate\.googleapis|deepl\.com\/v2|api\.cognitive|libretranslate/i.test(text)) {
      errors.push(`${file.replace(root, '')}: runtime translation API reference`);
    }
  }
}

if (entries.length !== 21) errors.push(`expected 21 locale files, found ${entries.length}`);

if (errors.length) {
  console.error('i18n check failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`i18n check passed: ${entries.length} locales × ${refKeys.length} keys`);
