/**
 * Post-build checks for routes, links, metadata, locale markers and output hygiene.
 * Run with `npm run check:site` after `npm run build`.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const locales = [
  { code: 'pt', tag: 'pt-PT', dir: 'ltr' },
  { code: 'pt-br', tag: 'pt-BR', dir: 'ltr' },
  { code: 'en', tag: 'en', dir: 'ltr' },
  { code: 'es', tag: 'es', dir: 'ltr' },
  { code: 'fr', tag: 'fr', dir: 'ltr' },
  { code: 'zh-cn', tag: 'zh-CN', dir: 'ltr' },
  { code: 'zh-tw', tag: 'zh-TW', dir: 'ltr' },
  { code: 'ru', tag: 'ru', dir: 'ltr' },
  { code: 'uk', tag: 'uk', dir: 'ltr' },
  { code: 'it', tag: 'it', dir: 'ltr' },
  { code: 'de', tag: 'de', dir: 'ltr' },
  { code: 'pl', tag: 'pl', dir: 'ltr' },
  { code: 'hi', tag: 'hi', dir: 'ltr' },
  { code: 'ko', tag: 'ko', dir: 'ltr' },
  { code: 'ja', tag: 'ja', dir: 'ltr' },
  { code: 'ar', tag: 'ar', dir: 'rtl' },
  { code: 'bg', tag: 'bg', dir: 'ltr' },
  { code: 'nl', tag: 'nl', dir: 'ltr' },
  { code: 'sv', tag: 'sv', dir: 'ltr' },
  { code: 'el', tag: 'el', dir: 'ltr' },
  { code: 'ro', tag: 'ro', dir: 'ltr' },
];
const projectSlugs = ['blog', 'hardware-store', 'unity-rpg', 'cpp-rpg'];
const errors = [];

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else if (entry.name.endsWith('.html')) out.push(path);
  }
  return out;
}
const exists = async (path) => {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
};

const pages = await walk(dist);
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
const urlCount = (sitemap.match(/<url>/g) || []).length;
const hasPublicOrigin = urlCount > 0;
const expectedHtmlPages = locales.length * (2 + projectSlugs.length) + 2;
if (pages.length !== expectedHtmlPages) {
  errors.push(`expected ${expectedHtmlPages} HTML pages, found ${pages.length}`);
}
if (hasPublicOrigin && urlCount !== locales.length * (2 + projectSlugs.length)) {
  errors.push(`sitemap: expected ${locales.length * (2 + projectSlugs.length)} URLs, found ${urlCount}`);
}
if (!hasPublicOrigin && urlCount !== 0) errors.push(`sitemap: expected 0 URLs without a configured public origin, found ${urlCount}`);
if (hasPublicOrigin && !/^Sitemap:\s*https?:\/\/\S+\/sitemap\.xml\s*$/m.test(robots)) {
  errors.push('robots.txt: configured sitemap URL is missing or malformed');
}
if (!hasPublicOrigin && /^Sitemap:/m.test(robots)) errors.push('robots.txt: sitemap is advertised without a public origin');

const placeholderPattern = /\[(?:EMAIL|GITHUB|WHATSAPP|CV|PDF|LINK|IMAGE|IMAGEM|FICHEIRO|PERFIL|FORNECEDOR|DOM[IÍ]NIO)[^\]]*\]|\b(?:TODO|TBD|FIXME)\b|\bundefined\b/i;
const translationKeyPattern = /\b(?:meta|nav|hero|project|form|privacy|footer|contact|status|cv|theme|a11y|stack|path|consent|notFound)\.[A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)?\b/;
const fakeDestinationPattern = /mywebsite\.vercel\.app|example\.com|xxxxxxxx|github\.com\/username|wa\.me\/351900000000/i;

for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const rel = page.replace(dist, '');
  if (/Amós|Oliveira/.test(html)) errors.push(`${rel}: forbidden name is rendered`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing title`);
  if (!/name="description" content="[^"]{8,}"/.test(html)) errors.push(`${rel}: missing description`);
  if (/<a\b[^>]*\bhref=""/i.test(html)) errors.push(`${rel}: empty link destination`);
  if (fakeDestinationPattern.test(html)) errors.push(`${rel}: fictitious destination appears in output`);

  const visibleText = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  if (placeholderPattern.test(visibleText)) errors.push(`${rel}: unresolved placeholder or work marker is visible`);
  if (translationKeyPattern.test(visibleText)) errors.push(`${rel}: a translation key is visible`);
  if (/\b(?:Vercel|vercel\.com|vercel\.app)\b/i.test(visibleText)) errors.push(`${rel}: hosting brand is visible to visitors`);

  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (link.startsWith('#')) {
      const hash = decodeURIComponent(link.slice(1));
      if (hash && !html.includes(`id="${hash}"`)) errors.push(`${rel}: missing anchor #${hash}`);
      continue;
    }
    if (/^(https?:|mailto:|tel:|data:)/.test(link) || link.startsWith('/_vercel')) continue;
    const [pathPart, hash] = link.split('#');
    let target = join(dist, pathPart.replace(/^\/+/, '').split('?')[0]);
    if (pathPart.endsWith('/')) target = join(target, 'index.html');
    else if (!extname(pathPart)) target = join(target, 'index.html');
    if (!(await exists(target))) {
      errors.push(`${rel}: broken link ${link}`);
      continue;
    }
    if (hash && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      if (!targetHtml.includes(`id="${hash}"`)) errors.push(`${rel}: missing anchor #${hash}`);
    }
  }
}

for (const locale of locales) {
  const home = join(dist, locale.code, 'index.html');
  if (!(await exists(home))) {
    errors.push(`${locale.code}: missing localized home page`);
    continue;
  }
  const html = await readFile(home, 'utf8');
  if (!html.includes(`data-locale="${locale.code}"`)) errors.push(`${locale.code}: missing data-locale`);
  if (!html.includes(`lang="${locale.tag}"`)) errors.push(`${locale.code}: wrong lang attribute`);
  if (!html.includes(`dir="${locale.dir}"`)) errors.push(`${locale.code}: wrong text direction`);
  const hreflang = (html.match(/rel="alternate" hreflang=/g) || []).length;
  const expectedHreflang = hasPublicOrigin ? locales.length + 1 : 0;
  if (hreflang !== expectedHreflang) {
    errors.push(`${locale.code}: expected ${expectedHreflang} hreflang links, found ${hreflang}`);
  }
  const hasCanonical = /rel="canonical"/.test(html);
  if (hasCanonical !== hasPublicOrigin) errors.push(`${locale.code}: canonical does not match public-origin configuration`);
  if (locale.code === 'ar') {
    if (!/<bdi\b[^>]*dir="ltr"/.test(html)) errors.push('ar: no LTR-isolated fragments found on the Arabic home page');
  }
  for (const slug of projectSlugs) {
    if (!(await exists(join(dist, locale.code, 'projects', slug, 'index.html')))) {
      errors.push(`${locale.code}: missing project page ${slug}`);
    }
  }
  if (!(await exists(join(dist, locale.code, 'privacy', 'index.html')))) {
    errors.push(`${locale.code}: missing privacy page`);
  }
}

if (!(await exists(join(dist, '404.html')))) errors.push('missing 404.html');
if (hasPublicOrigin && !/<link\s+rel="sitemap"\s+href="\/sitemap\.xml"/.test(await readFile(join(dist, 'pt', 'index.html'), 'utf8'))) {
  errors.push('configured site has no sitemap link');
}
if (!hasPublicOrigin && /<link\s+rel="sitemap"/.test(await readFile(join(dist, 'pt', 'index.html'), 'utf8'))) {
  errors.push('sitemap link is present without a configured public origin');
}

if (errors.length) {
  console.error('site check failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`site check passed: ${pages.length} pages, all locale routes, links and output checks OK`);
