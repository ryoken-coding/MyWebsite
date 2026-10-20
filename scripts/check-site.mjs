/**
 * Post-build check: internal links and anchors resolve, every page has a title
 * and description, all 21 locales expose the right lang/dir and hreflang set,
 * the sitemap has the expected size, and the author's name is not rendered.
 * Run with `npm run check:site` (after `npm run build`).
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const locales = ['pt','pt-br','en','es','fr','zh-cn','zh-tw','ru','uk','it','de','pl','hi','ko','ja','ar','bg','nl','sv','el','ro'];
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
for (const page of pages) {
  const html = await readFile(page, 'utf8');
  const rel = page.replace(dist, '');
  if (/Amós|Oliveira/.test(html)) errors.push(`${rel}: forbidden name is rendered`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${rel}: missing title`);
  if (!/name="description" content="[^"]{8,}"/.test(html)) errors.push(`${rel}: missing description`);

  for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(link) || link.startsWith('/_vercel')) continue;
    const [pathPart, hash] = link.split('#');
    let target = join(dist, pathPart.split('?')[0]);
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

for (const code of locales) {
  const html = await readFile(join(dist, code, 'index.html'), 'utf8');
  if (!html.includes(`data-locale="${code}"`)) errors.push(`${code}: missing data-locale`);
  if (!html.includes(`dir="${code === 'ar' ? 'rtl' : 'ltr'}"`)) errors.push(`${code}: wrong text direction`);
  const hreflang = (html.match(/rel="alternate" hreflang=/g) || []).length;
  if (hreflang !== locales.length + 1) errors.push(`${code}: expected ${locales.length + 1} hreflang links, found ${hreflang}`);
}

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
const urlCount = (sitemap.match(/<url>/g) || []).length;
if (urlCount !== locales.length * 6) errors.push(`sitemap: expected ${locales.length * 6} URLs, found ${urlCount}`);

if (!(await readFile(join(dist, 'robots.txt'), 'utf8')).includes('Sitemap:')) errors.push('robots.txt: no sitemap');

if (errors.length) {
  console.error('site check failed:\n - ' + errors.join('\n - '));
  process.exit(1);
}
console.log(`site check passed: ${pages.length} pages, all links and language markers OK`);
