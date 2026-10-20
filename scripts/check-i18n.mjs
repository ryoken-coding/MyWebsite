/**
 * Build-time checks for locale structure and visitor-facing text.
 * Run with `npm run check:i18n`; the static build runs this as well.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const localesDir = join(root, 'src/i18n');
const expectedLocales = [
  'pt-PT', 'pt-BR', 'en', 'es', 'fr', 'zh-CN', 'zh-TW', 'ru', 'uk', 'it', 'de',
  'pl', 'hi', 'ko', 'ja', 'ar', 'bg', 'nl', 'sv', 'el', 'ro',
];
const files = (await readdir(localesDir)).filter(
  (file) => file.endsWith('.ts') && !['index.ts', 'locales.ts'].includes(file)
);

const entries = await Promise.all(
  files.map(async (file) => {
    const mod = await import(join(localesDir, file));
    return [file.replace(/\.ts$/, ''), mod.default];
  })
);

const dictionaries = new Map(entries);
const reference = dictionaries.get('pt-PT');
const errors = [];
if (!reference) {
  console.error('check-i18n: pt-PT.ts not found');
  process.exit(1);
}

const refKeys = Object.keys(reference).sort();
const actualNames = new Set(dictionaries.keys());
for (const locale of expectedLocales) {
  if (!actualNames.has(locale)) errors.push(`missing locale file: ${locale}.ts`);
}
for (const locale of actualNames) {
  if (!expectedLocales.includes(locale)) errors.push(`unexpected locale file: ${locale}.ts`);
}

const placeholderPattern = /\[(?:EMAIL|GITHUB|WHATSAPP|CV|PDF|LINK|IMAGE|IMAGEM|FICHEIRO|PERFIL|FORNECEDOR|DOM[IÍ]NIO)[^\]]*\]|\b(?:TODO|TBD|FIXME)\b|\bundefined\b/i;
for (const [name, dictionary] of entries) {
  const keys = Object.keys(dictionary).sort();
  const missing = refKeys.filter((key) => !(key in dictionary));
  const extra = keys.filter((key) => !(key in reference));
  const empty = keys.filter((key) => typeof dictionary[key] !== 'string' || !dictionary[key].trim());
  if (missing.length) errors.push(`${name}: ${missing.length} missing key(s) → ${missing.slice(0, 8).join(', ')}`);
  if (extra.length) errors.push(`${name}: ${extra.length} unknown key(s) → ${extra.slice(0, 8).join(', ')}`);
  if (empty.length) errors.push(`${name}: ${empty.length} empty/non-text value(s) → ${empty.slice(0, 8).join(', ')}`);
  if (!('meta.home.title' in dictionary) || !('meta.privacy.title' in dictionary)) {
    errors.push(`${name}: metadata keys are missing`);
  }
  for (const [key, value] of Object.entries(dictionary)) {
    if (placeholderPattern.test(value)) errors.push(`${name}.${key}: unresolved placeholder or work marker`);
  }
}

// Guard the specifically reported localization defects against regressions.
const ja = dictionaries.get('ja');
if (ja && Object.values(ja).some((value) => /\bweb\b/i.test(value))) {
  errors.push('ja: generic English “Web” remains in visitor-facing copy');
}
const es = dictionaries.get('es');
if (es && Object.values(es).some((value) => /\b(?:trabalh\w*|perceber)\b|à distância/i.test(value))) {
  errors.push('es: Portuguese wording remains in Spanish visitor-facing copy');
}
for (const locale of ['zh-CN', 'zh-TW']) {
  const dictionary = dictionaries.get(locale);
  if (dictionary && Object.values(dictionary).some((value) => /\[(?:PDF|CV|RESUME|履歷|履歴書)[^\]]*\]/i.test(value))) {
    errors.push(`${locale}: unresolved CV/PDF marker remains`);
  }
}

// The author's full name must never be rendered by the site.
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

if (entries.length !== expectedLocales.length) {
  errors.push(`expected ${expectedLocales.length} locale files, found ${entries.length}`);
}

if (errors.length) {
  console.error('i18n check failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`i18n check passed: ${entries.length} locales × ${refKeys.length} keys`);
