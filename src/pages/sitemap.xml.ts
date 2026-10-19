import type { APIRoute } from 'astro';
import { locales } from '../i18n/locales';
import { projects } from '../data/projects';
import { siteUrl } from '../data/site';

/** Every page exists in every language, so the sitemap lists all of them. */
export const GET: APIRoute = () => {
  const base = siteUrl.replace(/\/$/, '');
  const routes = ['', 'privacy', ...projects.map((p) => `projects/${p.slug}`)];
  const urls = locales.flatMap((locale) =>
    routes.map((route) => `${base}/${locale.code}/${route ? route + '/' : ''}`)
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
